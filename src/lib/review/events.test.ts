import { describe, expect, it } from "vitest";
import type { ReviewEvent } from "./contracts";
import {
  EventOrderError,
  EventSequenceError,
  ReviewEventSerializer,
  createKeepAliveComment,
  formatSseComment,
  formatSseEvent,
  validateEventSequence,
} from "./events";
import type { RunReceipt } from "./contracts";

const validRunId = "11111111-2222-4333-8444-555555555555";
const sampleTimestamp = "2026-09-12T10:00:00.000Z";

function makeEvent<T extends ReviewEvent["type"]>(
  type: T,
  sequence: number,
  payload: Extract<ReviewEvent, { type: T }>["payload"],
): Extract<ReviewEvent, { type: T }> {
  return {
    contractVersion: "1",
    runId: validRunId,
    sequence,
    timestamp: sampleTimestamp,
    type,
    payload,
  } as Extract<ReviewEvent, { type: T }>;
}

describe("SSE Serializer - Event and Comment Formatting", () => {
  it("formats a typed ReviewEvent into standard SSE message format", () => {
    const event = makeEvent("run.started", 1, {
      claimId: "claim-1",
      mode: "quick",
    });

    const formatted = formatSseEvent(event);

    expect(formatted).toBe(
      `id: 1\nevent: run.started\ndata: ${JSON.stringify(event)}\n\n`,
    );
  });

  it("produces parsable data payload in SSE output", () => {
    const event = makeEvent("run.status", 2, {
      status: "researching",
      message: "Araştırma rolü çalışıyor...",
    });

    const formatted = formatSseEvent(event);
    const lines = formatted.split("\n");

    expect(lines[0]).toBe("id: 2");
    expect(lines[1]).toBe("event: run.status");
    expect(lines[2].startsWith("data: ")).toBe(true);

    const jsonText = lines[2].slice("data: ".length);
    const parsed = JSON.parse(jsonText);
    expect(parsed).toEqual(event);
  });

  it("formats keep-alive comment with default text", () => {
    expect(formatSseComment()).toBe(": keep-alive\n\n");
    expect(createKeepAliveComment()).toBe(": keep-alive\n\n");
  });

  it("formats SSE comment with custom text", () => {
    expect(formatSseComment("ping")).toBe(": ping\n\n");
  });
});

const sampleReceipt: RunReceipt = {
  runId: validRunId,
  claimId: "claim-1",
  mode: "quick",
  verdict: "supported",
  durationMs: 500,
  resultSource: "live",
  sourceIds: ["src-1"],
  rejectedFindingIds: [],
  resultHash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  completedAt: sampleTimestamp,
  humanReviewLabel: "Son kontrol: Cem.",
};

describe("SSE Serializer - Monotonic Sequence Validation", () => {
  it("accepts strictly monotonic sequence starting from 1", () => {
    const serializer = new ReviewEventSerializer();

    const ev1 = makeEvent("run.started", 1, { claimId: "claim-1", mode: "quick" });
    const ev2 = makeEvent("run.status", 2, { status: "researching", message: "Starting..." });

    expect(() => serializer.serialize(ev1)).not.toThrow();
    expect(() => serializer.serialize(ev2)).not.toThrow();
    expect(serializer.currentSequence).toBe(2);
  });

  it("throws EventSequenceError if first event sequence is not 1", () => {
    const serializer = new ReviewEventSerializer();
    const ev = makeEvent("run.started", 0, { claimId: "claim-1", mode: "quick" });

    expect(() => serializer.serialize(ev)).toThrow(EventSequenceError);
  });

  it("throws EventSequenceError if first event sequence starts higher than 1", () => {
    const serializer = new ReviewEventSerializer();
    const ev = makeEvent("run.started", 2, { claimId: "claim-1", mode: "quick" });

    expect(() => serializer.serialize(ev)).toThrow(EventSequenceError);
  });

  it("throws EventSequenceError if sequence skips a number", () => {
    const serializer = new ReviewEventSerializer();
    const ev1 = makeEvent("run.started", 1, { claimId: "claim-1", mode: "quick" });
    const ev3 = makeEvent("run.status", 3, { status: "researching", message: "Skipped" });

    serializer.serialize(ev1);
    expect(() => serializer.serialize(ev3)).toThrow(EventSequenceError);
  });

  it("throws EventSequenceError if sequence duplicates previous number", () => {
    const serializer = new ReviewEventSerializer();
    const ev1 = makeEvent("run.started", 1, { claimId: "claim-1", mode: "quick" });
    const evDuplicate = makeEvent("run.status", 1, { status: "researching", message: "Dup" });

    serializer.serialize(ev1);
    expect(() => serializer.serialize(evDuplicate)).toThrow(EventSequenceError);
  });
});

describe("SSE Serializer - Event Order Enforcement", () => {
  it("enforces run.started as the first event", () => {
    const serializer = new ReviewEventSerializer();
    const ev = makeEvent("run.status", 1, { status: "researching", message: "Starting..." });

    expect(() => serializer.serialize(ev)).toThrow(EventOrderError);
  });

  it("rejects duplicate run.started", () => {
    const serializer = new ReviewEventSerializer();
    const ev1 = makeEvent("run.started", 1, { claimId: "claim-1", mode: "quick" });
    const ev2 = makeEvent("run.started", 2, { claimId: "claim-1", mode: "quick" });

    serializer.serialize(ev1);
    expect(() => serializer.serialize(ev2)).toThrow(EventOrderError);
  });

  it("enforces run.verdict -> run.receipt -> run.completed order at the end", () => {
    const serializer = new ReviewEventSerializer();

    serializer.serialize(makeEvent("run.started", 1, { claimId: "claim-1", mode: "quick" }));
    serializer.serialize(makeEvent("run.verdict", 2, { verdict: "supported", summary: "Özet" }));
    serializer.serialize(makeEvent("run.receipt", 3, { receipt: sampleReceipt }));
    const completedSse = serializer.serialize(
      makeEvent("run.completed", 4, { receipt: sampleReceipt }),
    );

    expect(completedSse).toContain("event: run.completed");
    expect(serializer.isTerminated).toBe(true);
  });

  it("rejects run.receipt before run.verdict", () => {
    const serializer = new ReviewEventSerializer();

    serializer.serialize(makeEvent("run.started", 1, { claimId: "claim-1", mode: "quick" }));
    expect(() =>
      serializer.serialize(makeEvent("run.receipt", 2, { receipt: sampleReceipt })),
    ).toThrow(EventOrderError);
  });

  it("rejects run.completed before run.receipt", () => {
    const serializer = new ReviewEventSerializer();

    serializer.serialize(makeEvent("run.started", 1, { claimId: "claim-1", mode: "quick" }));
    serializer.serialize(makeEvent("run.verdict", 2, { verdict: "supported", summary: "Özet" }));
    expect(() =>
      serializer.serialize(makeEvent("run.completed", 3, { receipt: sampleReceipt })),
    ).toThrow(EventOrderError);
  });

  it("rejects other intermediate events after run.verdict before run.receipt", () => {
    const serializer = new ReviewEventSerializer();

    serializer.serialize(makeEvent("run.started", 1, { claimId: "claim-1", mode: "quick" }));
    serializer.serialize(makeEvent("run.verdict", 2, { verdict: "supported", summary: "Özet" }));
    expect(() =>
      serializer.serialize(
        makeEvent("run.status", 3, { status: "editing", message: "Belated status" }),
      ),
    ).toThrow(EventOrderError);
  });

  it("treats run.completed as terminal and rejects any further events", () => {
    const serializer = new ReviewEventSerializer();

    serializer.serialize(makeEvent("run.started", 1, { claimId: "claim-1", mode: "quick" }));
    serializer.serialize(makeEvent("run.verdict", 2, { verdict: "supported", summary: "Özet" }));
    serializer.serialize(makeEvent("run.receipt", 3, { receipt: sampleReceipt }));
    serializer.serialize(makeEvent("run.completed", 4, { receipt: sampleReceipt }));

    expect(() =>
      serializer.serialize(makeEvent("run.status", 5, { status: "editing", message: "Too late" })),
    ).toThrow(EventOrderError);
  });

  it("treats run.error as terminal and rejects any further events", () => {
    const serializer = new ReviewEventSerializer();

    serializer.serialize(makeEvent("run.started", 1, { claimId: "claim-1", mode: "quick" }));
    serializer.serialize(
      makeEvent("run.error", 2, { code: "role_failed", message: "Role crashed", retryable: true }),
    );

    expect(serializer.isTerminated).toBe(true);

    expect(() =>
      serializer.serialize(
        makeEvent("run.status", 3, { status: "researching", message: "After error" }),
      ),
    ).toThrow(EventOrderError);
  });

  it("rejects events with mismatched runId across the stream", () => {
    const serializer = new ReviewEventSerializer();

    serializer.serialize(makeEvent("run.started", 1, { claimId: "claim-1", mode: "quick" }));

    const mismatchedEvent: ReviewEvent = {
      contractVersion: "1",
      runId: "22222222-2222-4222-8222-222222222222",
      sequence: 2,
      timestamp: sampleTimestamp,
      type: "run.status",
      payload: { status: "researching", message: "Different run" },
    };

    expect(() => serializer.serialize(mismatchedEvent)).toThrow(EventOrderError);
  });
});

describe("SSE Serializer - validateEventSequence batch function", () => {
  it("validates a full correct sequence without errors", () => {
    const events: ReviewEvent[] = [
      makeEvent("run.started", 1, { claimId: "claim-1", mode: "quick" }),
      makeEvent("run.status", 2, { status: "researching", message: "Searching..." }),
      makeEvent("run.verdict", 3, { verdict: "supported", summary: "Destekleniyor" }),
      makeEvent("run.receipt", 4, { receipt: sampleReceipt }),
      makeEvent("run.completed", 5, { receipt: sampleReceipt }),
    ];

    expect(() => validateEventSequence(events)).not.toThrow();
  });

  it("validates an error-terminated sequence without errors", () => {
    const events: ReviewEvent[] = [
      makeEvent("run.started", 1, { claimId: "claim-1", mode: "quick" }),
      makeEvent("run.error", 2, { code: "timeout", message: "Zaman aşımı", retryable: true }),
    ];

    expect(() => validateEventSequence(events)).not.toThrow();
  });

  it("throws EventOrderError if sequence does not end with a terminal event", () => {
    const events: ReviewEvent[] = [
      makeEvent("run.started", 1, { claimId: "claim-1", mode: "quick" }),
      makeEvent("run.status", 2, { status: "researching", message: "Still running..." }),
    ];

    expect(() => validateEventSequence(events)).toThrow(EventOrderError);
  });

  it("does not poison currentRunId if the first event fails ordering validation", () => {
    const serializer = new ReviewEventSerializer();
    const badFirstEvent: ReviewEvent = {
      contractVersion: "1",
      type: "run.status",
      runId: "a0000000-0000-4000-8000-000000000001",
      sequence: 1,
      timestamp: "2026-09-12T00:00:00.000Z",
      payload: { status: "researching", message: "Starting..." },
    };

    expect(() => serializer.validateNext(badFirstEvent)).toThrow(EventOrderError);
    expect(serializer.runId).toBeNull();

    // Now a valid run.started with a different runId must succeed
    const validFirstEvent: ReviewEvent = {
      contractVersion: "1",
      type: "run.started",
      runId: "a0000000-0000-4000-8000-000000000002",
      sequence: 1,
      timestamp: "2026-09-12T00:00:01.000Z",
      payload: {
        claimId: "claim-1",
        mode: "quick",
      },
    };

    expect(() => serializer.validateNext(validFirstEvent)).not.toThrow();
    expect(serializer.runId).toBe("a0000000-0000-4000-8000-000000000002");
  });

  it("rejects unknown event type in formatSseEvent", () => {
    const invalidEvent = {
      contractVersion: "1",
      type: "unknown.event\r\nInject: header",
      runId: "a0000000-0000-4000-8000-000000000001",
      sequence: 1,
      timestamp: "2026-09-12T00:00:00.000Z",
      payload: {},
    } as unknown as ReviewEvent;

    expect(() => formatSseEvent(invalidEvent)).toThrow(EventOrderError);
  });
});
