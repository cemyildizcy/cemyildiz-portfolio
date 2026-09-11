import { describe, expect, it } from "vitest";
import type {
  ClaimId,
  Finding,
  ReviewEvent,
  ReviewMode,
  ReviewRequest,
  RoleOutput,
} from "./contracts";
import { validateEventSequence } from "./events";
import {
  FakeReviewProvider,
  type ReviewModelProvider,
} from "./provider";
import { runReviewStream } from "./run";

async function readSseEvents(stream: ReadableStream<Uint8Array>): Promise<ReviewEvent[]> {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  const events: ReviewEvent[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() ?? "";

    for (const chunk of lines) {
      if (!chunk.trim() || chunk.startsWith(":")) continue;
      const dataLine = chunk
        .split("\n")
        .find((l) => l.startsWith("data: "));
      if (dataLine) {
        const jsonStr = dataLine.slice("data: ".length);
        events.push(JSON.parse(jsonStr) as ReviewEvent);
      }
    }
  }

  return events;
}

const validRequest: ReviewRequest = {
  claimId: "claim-1",
  mode: "quick",
  clientRequestId: "a0000000-0000-4000-8000-000000000001",
  contractVersion: "1",
};

describe("Review Orchestrator - runReviewStream", () => {
  it("streams a complete verified review for claim-1 in quick mode", async () => {
    const provider = new FakeReviewProvider();
    const stream = await runReviewStream(validRequest, { provider });
    const events = await readSseEvents(stream);

    expect(events.length).toBeGreaterThanOrEqual(7);

    // Validate overall event sequence according to contract state machine
    expect(() => validateEventSequence(events)).not.toThrow();

    // 1. run.started
    expect(events[0].type).toBe("run.started");
    if (events[0].type === "run.started") {
      expect(events[0].payload.claimId).toBe("claim-1");
      expect(events[0].payload.mode).toBe("quick");
    }

    // Role completed events should exist for all three roles
    const roleEvents = events.filter((e) => e.type === "role.completed");
    expect(roleEvents).toHaveLength(3);
    const completedRoles = roleEvents.map((e) => (e.payload as RoleOutput).role);
    expect(completedRoles).toContain("researcher");
    expect(completedRoles).toContain("skeptic");
    expect(completedRoles).toContain("verifier");

    // Verified findings should be emitted
    const verifiedFindingEvents = events.filter((e) => e.type === "finding.verified");
    expect(verifiedFindingEvents.length).toBeGreaterThan(0);

    // Terminal sequence: verdict -> receipt -> completed
    const verdictEvent = events.find((e) => e.type === "run.verdict");
    expect(verdictEvent).toBeDefined();
    if (verdictEvent && verdictEvent.type === "run.verdict") {
      expect(verdictEvent.payload.verdict).toBe("supported");
    }

    const receiptEvent = events.find((e) => e.type === "run.receipt");
    expect(receiptEvent).toBeDefined();
    if (receiptEvent && receiptEvent.type === "run.receipt") {
      expect(receiptEvent.payload.receipt.humanReviewLabel).toBe("Son kontrol: Cem.");
      expect(receiptEvent.payload.receipt.claimId).toBe("claim-1");
    }

    const completedEvent = events[events.length - 1];
    expect(completedEvent.type).toBe("run.completed");
  });

  it("executes all three roles in parallel", async () => {
    const callTimes: Record<string, { start: number; end: number }> = {};
    const delay = 40;

    const parallelTrackingProvider: ReviewModelProvider = {
      async executeRole({ role, signal }) {
        const start = Date.now();
        await new Promise((resolve, reject) => {
          const t = setTimeout(resolve, delay);
          signal?.addEventListener("abort", () => {
            clearTimeout(t);
            reject(signal.reason);
          });
        });
        const end = Date.now();
        callTimes[role] = { start, end };

        return {
          role,
          summary: `${role} summary`,
          findings: [],
        };
      },
    };

    const stream = await runReviewStream(validRequest, {
      provider: parallelTrackingProvider,
    });
    await readSseEvents(stream);

    expect(Object.keys(callTimes)).toHaveLength(3);
    const startResearcher = callTimes.researcher.start;
    const startSkeptic = callTimes.skeptic.start;
    const startVerifier = callTimes.verifier.start;

    // All three roles should have started almost concurrently (well before delay elapses)
    expect(Math.abs(startResearcher - startSkeptic)).toBeLessThan(delay);
    expect(Math.abs(startResearcher - startVerifier)).toBeLessThan(delay);
  });

  it("propagates AbortSignal and cancels execution", async () => {
    const controller = new AbortController();
    let abortedInProvider = false;

    const abortDetectingProvider: ReviewModelProvider = {
      async executeRole({ signal }) {
        return new Promise((_, reject) => {
          signal?.addEventListener("abort", () => {
            abortedInProvider = true;
            reject(new DOMException("Aborted", "AbortError"));
          });
        });
      },
    };

    const streamPromise = runReviewStream(validRequest, {
      provider: abortDetectingProvider,
      signal: controller.signal,
    });

    // Abort shortly after starting
    setTimeout(() => controller.abort("user_cancelled"), 10);

    const stream = await streamPromise;
    try {
      await readSseEvents(stream);
    } catch {
      // Stream cancellation or error is expected
    }

    expect(abortedInProvider).toBe(true);
  });

  it("safely handles and maps invalid role output from provider", async () => {
    const invalidProvider: ReviewModelProvider = {
      async executeRole({ role }) {
        // Return malformed object violating RoleOutput schema
        return {
          role,
          summary: 12345, // invalid type
          forbiddenField: "not allowed",
        } as unknown as RoleOutput;
      },
    };

    const stream = await runReviewStream(validRequest, {
      provider: invalidProvider,
    });
    const events = await readSseEvents(stream);

    // Should emit an error event instead of crashing or leaking raw data
    const errorEvent = events.find((e) => e.type === "run.error");
    expect(errorEvent).toBeDefined();
    if (errorEvent && errorEvent.type === "run.error") {
      expect(errorEvent.payload.code).toBe("role_failed");
      expect(typeof errorEvent.payload.message).toBe("string");
    }
  });

  it("filters out ungrounded citations and includes only verified findings", async () => {
    const findingWithBadCitation: Finding = {
      findingId: "f-fake-1",
      propositionId: "prop-ml-1",
      stance: "supports",
      summary: "Uydurma alıntı",
      citations: [
        {
          sourceId: "unknown-source",
          url: "https://arxiv.org/abs/1706.04599",
          quote: "Not real quote",
          locator: "p. 1",
        },
      ],
    };

    const hallucinatingProvider: ReviewModelProvider = {
      async executeRole({ role }) {
        return {
          role,
          summary: "Summary with bad citations",
          findings: [findingWithBadCitation],
        };
      },
    };

    const stream = await runReviewStream(validRequest, {
      provider: hallucinatingProvider,
    });
    const events = await readSseEvents(stream);

    // Finding should be rejected, not verified
    const rejectedEvents = events.filter((e) => e.type === "finding.rejected");
    expect(rejectedEvents.length).toBeGreaterThanOrEqual(1);

    const verifiedEvents = events.filter((e) => e.type === "finding.verified");
    expect(verifiedEvents).toHaveLength(0);

    // Because material propositions lack verified support, verdict should be insufficient_evidence
    const verdictEvent = events.find((e) => e.type === "run.verdict");
    expect(verdictEvent).toBeDefined();
    if (verdictEvent && verdictEvent.type === "run.verdict") {
      expect(verdictEvent.payload.verdict).toBe("insufficient_evidence");
    }
  });

  it("returns unavailable error event for draft claim (claim-2)", async () => {
    const draftRequest: ReviewRequest = {
      claimId: "claim-2" as ClaimId,
      mode: "quick",
      clientRequestId: "a0000000-0000-4000-8000-000000000002",
      contractVersion: "1",
    };

    const stream = await runReviewStream(draftRequest);
    const events = await readSseEvents(stream);

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("run.error");
    if (events[0].type === "run.error") {
      expect(events[0].payload.code).toBe("unavailable");
      expect(events[0].sequence).toBe(1);
    }
  });

  it("returns unavailable error event for unapproved mode (balanced)", async () => {
    const balancedRequest: ReviewRequest = {
      claimId: "claim-1",
      mode: "balanced" as ReviewMode,
      clientRequestId: "a0000000-0000-4000-8000-000000000003",
      contractVersion: "1",
    };

    const stream = await runReviewStream(balancedRequest);
    const events = await readSseEvents(stream);

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("run.error");
    if (events[0].type === "run.error") {
      expect(events[0].payload.code).toBe("unavailable");
    }
  });
});
