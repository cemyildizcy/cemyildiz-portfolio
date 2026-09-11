import { describe, expect, it } from "vitest";
import {
  CONTRACT_VERSION,
  ContractParseError,
  isFinding,
  isRejectedFinding,
  isReviewEvent,
  isReviewRequest,
  isRoleOutput,
  isRunReceipt,
  isVerifiedFinding,
  parseFinding,
  parseRejectedFinding,
  parseReviewEvent,
  parseReviewRequest,
  parseRoleOutput,
  parseRunReceipt,
  parseVerifiedFinding,
} from "./contracts";

const request = {
  claimId: "claim-1",
  mode: "quick",
  clientRequestId: "123e4567-e89b-42d3-a456-426614174000",
  contractVersion: "1",
};

const finding = {
  findingId: "finding-1",
  propositionId: "proposition-1",
  stance: "supports",
  summary: "Accuracy alone does not establish reliability.",
  citations: [
    {
      sourceId: "source-1",
      url: "https://example.org/research/model-reliability",
      quote: "Reliability requires evaluation beyond aggregate accuracy.",
      locator: "p. 4",
    },
  ],
};

const receipt = {
  runId: "123e4567-e89b-42d3-a456-426614174001",
  claimId: "claim-1",
  mode: "balanced",
  verdict: "revise",
  durationMs: 842,
  resultSource: "live",
  sourceIds: ["source-1"],
  rejectedFindingIds: ["finding-2"],
  resultHash: "a".repeat(64),
  completedAt: "2026-09-11T10:30:00.000Z",
  humanReviewLabel: "Son kontrol: Cem.",
};

function expectCode(action: () => unknown, code: ContractParseError["code"]) {
  expect(action).toThrowError(expect.objectContaining({ code }));
}

describe("parseReviewRequest", () => {
  it("accepts a closed claim and mode request", () => {
    expect(parseReviewRequest(request)).toEqual(request);
    expect(isReviewRequest(request)).toBe(true);
  });

  it("rejects unknown fields without coercing values", () => {
    expectCode(() => parseReviewRequest({ ...request, extra: "free form" }), "unknown_field");
    expectCode(() => parseReviewRequest({ ...request, mode: 1 }), "invalid_type");
  });

  it("rejects invalid UUIDs and contract versions", () => {
    expectCode(() => parseReviewRequest({ ...request, clientRequestId: "not-a-uuid" }), "invalid_format");
    expectCode(() => parseReviewRequest({ ...request, contractVersion: "2" }), "unsupported_version");
  });

  it("rejects values outside closed request enums", () => {
    expectCode(() => parseReviewRequest({ ...request, claimId: "claim-4" }), "invalid_enum");
    expectCode(() => parseReviewRequest({ ...request, mode: "ruthless" }), "invalid_enum");
    expect(isReviewRequest({ ...request, claimId: "invalid" })).toBe(false);
  });
});

describe("untrusted role and finding parsers", () => {
  it("accepts bounded role output and rejects hidden reasoning in any casing", () => {
    const output = {
      role: "researcher",
      summary: "The cited material limits what accuracy can establish.",
      findings: [finding],
    };
    expect(parseRoleOutput(output)).toEqual(output);
    expect(isRoleOutput(output)).toBe(true);
    expectCode(() => parseRoleOutput({ ...output, reasoning: "private chain" }), "forbidden_field");
    expectCode(() => parseRoleOutput({ ...output, raw_output: "token dump" }), "forbidden_field");
    expectCode(() => parseRoleOutput({ ...output, chainOfThought: "steps" }), "forbidden_field");
  });

  it("rejects oversized strings and arrays, and empty strings fail with invalid_format", () => {
    expectCode(() => parseFinding({ ...finding, summary: "x".repeat(501) }), "too_large");
    expectCode(() => parseFinding({ ...finding, summary: "" }), "invalid_format");
    expectCode(
      () => parseRoleOutput({ role: "skeptic", summary: "Bounded.", findings: Array(21).fill(finding) }),
      "too_large",
    );
  });

  it("rejects invalid role and finding enum values", () => {
    expectCode(
      () => parseRoleOutput({ role: "editor", summary: "Not a model role.", findings: [] }),
      "invalid_enum",
    );
    expectCode(() => parseFinding({ ...finding, stance: "maybe" }), "invalid_enum");
  });

  it("guards against prototype pollution in exactObject", () => {
    const polluted = Object.create({ reasoning: "leaked-from-proto" });
    polluted.claimId = "claim-1";
    polluted.mode = "quick";
    polluted.clientRequestId = "123e4567-e89b-42d3-a456-426614174000";
    polluted.contractVersion = "1";
    expectCode(() => parseReviewRequest(polluted), "invalid_type");
  });

  it("accepts only safe bounded HTTPS source values and guards against SSRF", () => {
    const valid = parseFinding(finding);
    expect(valid.citations[0].url).toBe("https://example.org/research/model-reliability");

    expectCode(
      () => parseFinding({ ...finding, citations: [{ ...finding.citations[0], url: "http://example.org" }] }),
      "unsafe_url",
    );
    expectCode(
      () => parseFinding({ ...finding, citations: [{ ...finding.citations[0], url: "https://user@example.org" }] }),
      "unsafe_url",
    );
    expectCode(
      () => parseFinding({ ...finding, citations: [{ ...finding.citations[0], url: "https://localhost/admin" }] }),
      "unsafe_url",
    );
    expectCode(
      () => parseFinding({ ...finding, citations: [{ ...finding.citations[0], url: "https://127.0.0.1:8080/flag" }] }),
      "unsafe_url",
    );
    expectCode(
      () => parseFinding({ ...finding, citations: [{ ...finding.citations[0], url: "https://169.254.169.254/meta" }] }),
      "unsafe_url",
    );
    expectCode(
      () => parseFinding({ ...finding, citations: [{ ...finding.citations[0], url: "https://192.168.1.1/router" }] }),
      "unsafe_url",
    );
    expectCode(
      () => parseFinding({ ...finding, citations: [{ ...finding.citations[0], url: "https://10.0.0.5:443" }] }),
      "unsafe_url",
    );
    expectCode(
      () => parseFinding({ ...finding, citations: [{ ...finding.citations[0], url: "https://internal-server" }] }),
      "unsafe_url",
    );
  });
});

describe("verified and rejected findings", () => {
  it("parses verified finding correctly and rejects non-boolean or false", () => {
    const verified = { ...finding, verified: true };
    expect(parseVerifiedFinding(verified)).toEqual(verified);
    expect(isVerifiedFinding(verified)).toBe(true);
    expect(isFinding(finding)).toBe(true);

    expectCode(() => parseVerifiedFinding({ ...finding, verified: "true" }), "invalid_type");
    expectCode(() => parseVerifiedFinding({ ...finding, verified: false }), "invalid_format");
  });

  it("parses rejected finding correctly", () => {
    const rejected = {
      findingId: "finding-2",
      propositionId: "proposition-2",
      role: "verifier",
      summary: "Quote does not appear in source excerpt.",
      code: "quote_mismatch",
    };
    expect(parseRejectedFinding(rejected)).toEqual(rejected);
    expect(isRejectedFinding(rejected)).toBe(true);
    expectCode(() => parseRejectedFinding({ ...rejected, code: "not_a_code" }), "invalid_enum");
  });
});

describe("receipts and public events", () => {
  it("parses a bounded receipt and handles uppercase SHA256 hashes", () => {
    expect(parseRunReceipt(receipt)).toEqual(receipt);
    expect(isRunReceipt(receipt)).toBe(true);

    const upperHashReceipt = { ...receipt, resultHash: "A".repeat(64) };
    expect(parseRunReceipt(upperHashReceipt).resultHash).toBe("a".repeat(64));

    expectCode(() => parseRunReceipt({ ...receipt, prompt: "hidden" }), "forbidden_field");
  });

  it("parses every supported review event type exhaustively", () => {
    const baseEnvelope = {
      contractVersion: CONTRACT_VERSION,
      runId: receipt.runId,
      sequence: 1,
      timestamp: "2026-09-11T10:29:59.000Z",
    };

    const events = [
      { ...baseEnvelope, type: "run.started", payload: { claimId: "claim-1", mode: "balanced" } },
      { ...baseEnvelope, type: "run.status", payload: { status: "researching", message: "Tarama yapılıyor." } },
      {
        ...baseEnvelope,
        type: "role.completed",
        payload: { role: "researcher", summary: "Özet.", findings: [finding] },
      },
      { ...baseEnvelope, type: "finding.verified", payload: { finding: { ...finding, verified: true } } },
      {
        ...baseEnvelope,
        type: "finding.rejected",
        payload: {
          finding: {
            findingId: "finding-9",
            propositionId: "prop-1",
            role: "skeptic",
            summary: "Reddedildi.",
            code: "missing_quote",
          },
        },
      },
      { ...baseEnvelope, type: "run.verdict", payload: { verdict: "supported", summary: "Doğrulandı." } },
      { ...baseEnvelope, type: "run.receipt", payload: { receipt } },
      { ...baseEnvelope, type: "run.completed", payload: { receipt } },
      {
        ...baseEnvelope,
        type: "run.error",
        payload: { code: "invalid_request", message: "Hatalı istek.", retryable: false },
      },
    ];

    for (const ev of events) {
      expect(parseReviewEvent(ev)).toEqual(ev);
      expect(isReviewEvent(ev)).toBe(true);
    }

    expect(isReviewEvent({ ...baseEnvelope, type: "token.delta" })).toBe(false);
    expectCode(
      () =>
        parseReviewEvent({
          ...baseEnvelope,
          type: "run.started",
          payload: { claimId: "claim-1", mode: "balanced", extra: "illegal" },
        }),
      "unknown_field",
    );
  });
});
