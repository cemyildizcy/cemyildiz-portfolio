import { randomUUID } from "node:crypto";
import { CitationVerifier } from "./citations";
import {
  CONTRACT_VERSION,
  type PublicErrorCode,
  type RejectedFinding,
  type ReviewEvent,
  type ReviewRequest,
  type RoleName,
  type VerifiedFinding,
} from "./contracts";
import { getClaimById } from "./corpus";
import { compileReview } from "./editor";
import { ReviewEventSerializer } from "./events";
import { FakeReviewProvider, type ReviewModelProvider } from "./provider";
import { executeRole } from "./roles";

export interface RunReviewOptions {
  provider?: ReviewModelProvider;
  verifier?: CitationVerifier;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export async function runReviewStream(
  request: ReviewRequest,
  options: RunReviewOptions = {},
): Promise<ReadableStream<Uint8Array>> {
  const provider = options.provider ?? new FakeReviewProvider();
  const verifier = options.verifier ?? new CitationVerifier();
  const signal = options.signal;

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
        const errorEvent = createEvent("run.error", {
          code,
          message,
          retryable,
        });
        emit(errorEvent);
      }

      try {
        if (signal?.aborted) {
          controller.close();
          return;
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
                signal,
              }),
            ),
          );
        } catch {
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

        if (signal?.aborted) {
          controller.close();
          return;
        }

        const allVerifiedFindings: VerifiedFinding[] = [];
        const allRejectedFindings: RejectedFinding[] = [];

        // 4. Process each role output, verify citations, and emit events
        for (const output of roleOutputs) {
          emit(createEvent("role.completed", output));

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

        controller.close();
      } catch {
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
      }
    },
  });
}
