import { randomUUID } from "node:crypto";
import type { ReviewCache } from "./cache";
import { CitationVerifier } from "./citations";
import {
  CONTRACT_VERSION,
  type PublicErrorCode,
  type RejectedFinding,
  type ReviewEvent,
  type ReviewRequest,
  type RoleName,
  type RunReceipt,
  type VerifiedFinding,
} from "./contracts";
import { getClaimById } from "./corpus";
import { compileReview } from "./editor";
import { ReviewEventSerializer } from "./events";
import { FakeReviewProvider, type ReviewModelProvider } from "./provider";
import { executeRole } from "./roles";
import type { TelemetrySink } from "./telemetry";

export interface RunReviewOptions {
  provider?: ReviewModelProvider;
  verifier?: CitationVerifier;
  signal?: AbortSignal;
  timeoutMs?: number;
  cache?: ReviewCache;
  useCache?: boolean;
  telemetry?: TelemetrySink;
}

export async function runReviewStream(
  request: ReviewRequest,
  options: RunReviewOptions = {},
): Promise<ReadableStream<Uint8Array>> {
  const provider = options.provider ?? new FakeReviewProvider();
  const verifier = options.verifier ?? new CitationVerifier();
  const signal = options.signal;
  const timeoutMs = options.timeoutMs ?? 12_000;
  const cache = options.cache;
  const telemetry = options.telemetry;

  const runId = randomUUID();
  const serializer = new ReviewEventSerializer();
  const encoder = new TextEncoder();
  const startTime = Date.now();

  let currentSequence = 0;

  function createEvent<T extends ReviewEvent["type"]>(
    type: T,
    payload: Extract<ReviewEvent, { type: T }>["payload"],
  ): Extract<ReviewEvent, { type: T }> {
    currentSequence += 1;
    return {
      contractVersion: CONTRACT_VERSION,
      runId,
      sequence: currentSequence,
      timestamp: new Date().toISOString(),
      type,
      payload,
    } as Extract<ReviewEvent, { type: T }>;
  }

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      function emit(event: ReviewEvent): void {
        const sseFormatted = serializer.serialize(event);
        controller.enqueue(encoder.encode(sseFormatted));
      }

      function emitError(code: PublicErrorCode, message: string, retryable = false): void {
        telemetry?.log({
          eventName: "run.error",
          timestamp: new Date().toISOString(),
          runId,
          claimId: request.claimId,
          mode: request.mode,
          durationMs: Date.now() - startTime,
          errorCode: code,
          retryable,
        });

        const errorEvent = createEvent("run.error", {
          code,
          message,
          retryable,
        });
        emit(errorEvent);
      }

      // Manage timeout and abort propagation
      const internalController = new AbortController();
      let didTimeout = false;

      const timeoutId = setTimeout(() => {
        didTimeout = true;
        internalController.abort(new Error("Operation timed out"));
      }, timeoutMs);

      const abortHandler = () => {
        if (!didTimeout) {
          internalController.abort(signal?.reason);
        }
      };

      if (signal) {
        if (signal.aborted) {
          abortHandler();
        } else {
          signal.addEventListener("abort", abortHandler, { once: true });
        }
      }

      async function handleTimeoutFallback(): Promise<void> {
        if (cache) {
          const cached = await cache.get(request.claimId, request.mode, {
            asSource: "fallback_cache",
          });

          if (cached) {
            telemetry?.log({
              eventName: "cache.fallback",
              timestamp: new Date().toISOString(),
              runId,
              claimId: request.claimId,
              mode: request.mode,
              durationMs: Date.now() - startTime,
              resultSource: "fallback_cache",
            });

            emit(
              createEvent("run.status", {
                status: "editing",
                message: "Zaman aşımı nedeniyle doğrulanmış son inceleme kaydı sunuluyor...",
              }),
            );

            for (const finding of cached.verifiedFindings) {
              emit(createEvent("finding.verified", { finding }));
            }

            for (const finding of cached.rejectedFindings) {
              emit(createEvent("finding.rejected", { finding }));
            }

            emit(
              createEvent("run.verdict", {
                verdict: cached.verdict,
                summary: cached.summary,
              }),
            );

            const fallbackReceipt: RunReceipt = {
              ...cached.receipt,
              runId,
              resultSource: "fallback_cache",
              durationMs: Date.now() - startTime,
              completedAt: new Date().toISOString(),
            };

            emit(createEvent("run.receipt", { receipt: fallbackReceipt }));
            emit(createEvent("run.completed", { receipt: fallbackReceipt }));

            telemetry?.log({
              eventName: "run.completed",
              timestamp: new Date().toISOString(),
              runId,
              claimId: request.claimId,
              mode: request.mode,
              durationMs: Date.now() - startTime,
              resultSource: "fallback_cache",
              verdict: cached.verdict,
            });

            controller.close();
            return;
          }
        }

        emitError("timeout", "İnceleme zaman aşımına uğradı.", true);
        controller.close();
      }

      try {
        if (signal?.aborted) {
          controller.close();
          return;
        }

        telemetry?.log({
          eventName: "run.started",
          timestamp: new Date().toISOString(),
          runId,
          claimId: request.claimId,
          mode: request.mode,
        });

        // Optional direct cache hit
        if (options.useCache && cache) {
          const cached = await cache.get(request.claimId, request.mode, {
            asSource: "cache",
          });
          if (cached) {
            telemetry?.log({
              eventName: "cache.hit",
              timestamp: new Date().toISOString(),
              runId,
              claimId: request.claimId,
              mode: request.mode,
              durationMs: Date.now() - startTime,
              resultSource: "cache",
            });

            emit(createEvent("run.started", { claimId: request.claimId, mode: request.mode }));
            emit(createEvent("run.status", { status: "editing", message: "Önbellekten yükleniyor..." }));

            for (const finding of cached.verifiedFindings) {
              emit(createEvent("finding.verified", { finding }));
            }
            for (const finding of cached.rejectedFindings) {
              emit(createEvent("finding.rejected", { finding }));
            }

            emit(createEvent("run.verdict", { verdict: cached.verdict, summary: cached.summary }));
            const cacheReceipt: RunReceipt = {
              ...cached.receipt,
              runId,
              resultSource: "cache",
              durationMs: Date.now() - startTime,
              completedAt: new Date().toISOString(),
            };
            emit(createEvent("run.receipt", { receipt: cacheReceipt }));
            emit(createEvent("run.completed", { receipt: cacheReceipt }));

            telemetry?.log({
              eventName: "run.completed",
              timestamp: new Date().toISOString(),
              runId,
              claimId: request.claimId,
              mode: request.mode,
              durationMs: Date.now() - startTime,
              resultSource: "cache",
              verdict: cached.verdict,
            });

            controller.close();
            return;
          }
        }

        // Gate: In tracer API, only claim-1 and quick mode are approved/supported
        const claim = getClaimById(request.claimId);
        if (
          !claim ||
          claim.reviewStatus !== "approved" ||
          request.claimId !== "claim-1" ||
          request.mode !== "quick"
        ) {
          emitError(
            "unavailable",
            "Bu iddia veya inceleme modu henüz erişilebilir değil.",
            false,
          );
          controller.close();
          return;
        }

        // 1. run.started
        emit(
          createEvent("run.started", {
            claimId: request.claimId,
            mode: request.mode,
          }),
        );

        // 2. run.status -> researching
        emit(
          createEvent("run.status", {
            status: "researching",
            message: "Bağımsız roller kanıt paketini inceliyor...",
          }),
        );

        // 3. Execute all three roles in parallel
        const roles: RoleName[] = ["researcher", "skeptic", "verifier"];
        let roleOutputs;
        try {
          roleOutputs = await Promise.all(
            roles.map((role) =>
              executeRole({
                claimId: request.claimId,
                mode: request.mode,
                role,
                provider,
                signal: internalController.signal,
              }),
            ),
          );
        } catch {
          if (didTimeout) {
            await handleTimeoutFallback();
            return;
          }

          if (signal?.aborted) {
            controller.close();
            return;
          }

          emitError(
            "role_failed",
            "İnceleme rolleri çalıştırılırken bir hata oluştu.",
            true,
          );
          controller.close();
          return;
        }

        if (didTimeout) {
          await handleTimeoutFallback();
          return;
        }

        if (signal?.aborted) {
          controller.close();
          return;
        }

        // Validate that all required roles completed
        const completedRoleSet = new Set(roleOutputs.map((o) => o?.role));
        const missingRoles = roles.filter((r) => !completedRoleSet.has(r));
        if (missingRoles.length > 0) {
          emitError(
            "role_failed",
            `İnceleme rolleri tamamlanamadı (eksik: ${missingRoles.join(", ")}). Karar üretilmedi.`,
            true,
          );
          controller.close();
          return;
        }

        const allVerifiedFindings: VerifiedFinding[] = [];
        const allRejectedFindings: RejectedFinding[] = [];

        // 4. Process each role output, verify citations, and emit events
        for (const output of roleOutputs) {
          emit(createEvent("role.completed", {
            role: output.role,
            summary: "Rol tamamlandı.",
            findings: [],
          }));

          for (const finding of output.findings) {
            const verificationResult = verifier.verifyFinding(
              request.claimId,
              finding,
              output.role,
            );

            if ("verified" in verificationResult && verificationResult.verified === true) {
              allVerifiedFindings.push(verificationResult);
              emit(
                createEvent("finding.verified", {
                  finding: verificationResult,
                }),
              );
            } else {
              const rejected = verificationResult as RejectedFinding;
              allRejectedFindings.push(rejected);
              emit(
                createEvent("finding.rejected", {
                  finding: rejected,
                }),
              );
            }
          }
        }

        // 5. run.status -> editing
        emit(
          createEvent("run.status", {
            status: "editing",
            message: "Bulgular derleniyor ve editoryal karar oluşturuluyor...",
          }),
        );

        // 6. Deterministic compilation
        const compilation = compileReview({
          runId,
          claimId: request.claimId,
          mode: request.mode,
          durationMs: Math.max(0, Date.now() - startTime),
          verifiedFindings: allVerifiedFindings,
          rejectedFindings: allRejectedFindings,
        });

        // 7. run.verdict
        emit(
          createEvent("run.verdict", {
            verdict: compilation.verdict,
            summary: compilation.summary,
          }),
        );

        // 8. run.receipt
        emit(
          createEvent("run.receipt", {
            receipt: compilation.receipt,
          }),
        );

        // 9. run.completed (terminal)
        emit(
          createEvent("run.completed", {
            receipt: compilation.receipt,
          }),
        );

        // Asynchronously save to verified cache
        if (cache) {
          cache
            .set({
              claimId: request.claimId,
              mode: request.mode,
              receipt: compilation.receipt,
              verdict: compilation.verdict,
              summary: compilation.summary,
              verifiedFindings: compilation.deduplicatedFindings,
              rejectedFindings: allRejectedFindings,
            })
            .catch(() => {
              // Non-blocking cache error
            });
        }

        telemetry?.log({
          eventName: "run.completed",
          timestamp: new Date().toISOString(),
          runId,
          claimId: request.claimId,
          mode: request.mode,
          durationMs: Math.max(0, Date.now() - startTime),
          resultSource: "live",
          verdict: compilation.verdict,
          verifiedCount: compilation.deduplicatedFindings.length,
          rejectedCount: compilation.rejectedFindingIds.length,
          sourceCount: compilation.sourceIds.length,
        });

        controller.close();
      } catch {
        if (didTimeout) {
          await handleTimeoutFallback();
          return;
        }

        if (!serializer.isTerminated) {
          try {
            emitError(
              "internal_error",
              "İnceleme sırasında beklenmeyen bir hata oluştu.",
              false,
            );
          } catch {
            // Ignore if already terminated
          }
        }
        controller.close();
      } finally {
        clearTimeout(timeoutId);
        if (signal) {
          signal.removeEventListener("abort", abortHandler);
        }
      }
    },
  });
}
