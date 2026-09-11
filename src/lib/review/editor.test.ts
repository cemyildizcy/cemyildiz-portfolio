import { describe, expect, it } from "vitest";
import type { VerifiedFinding } from "./contracts";
import {
  collectRejectedFindingIds,
  collectSourceIds,
  compileReview,
  computeResultHash,
  computeVerdict,
  deduplicateFindings,
  generateTurkishSummary,
} from "./editor";
import { parseRunReceipt } from "./contracts";

function makeVerifiedFinding(overrides: Partial<VerifiedFinding> = {}): VerifiedFinding {
  return {
    findingId: overrides.findingId ?? "f-1",
    propositionId: overrides.propositionId ?? "prop-1",
    stance: overrides.stance ?? "supports",
    summary: overrides.summary ?? "A verified finding summary.",
    citations: overrides.citations ?? [
      {
        sourceId: "src-1",
        url: "https://example.com/source",
        quote: "Direct source quotation",
        locator: "p. 1",
      },
    ],
    verified: true,
  };
}

describe("Deterministic Editor - Verdict Truth Table", () => {
  const materialProps = ["prop-1", "prop-2"];

  it("returns 'supported' when all material propositions have at least one verified supporting finding", () => {
    const findings: VerifiedFinding[] = [
      makeVerifiedFinding({ findingId: "f-1", propositionId: "prop-1", stance: "supports" }),
      makeVerifiedFinding({ findingId: "f-2", propositionId: "prop-2", stance: "supports" }),
    ];

    const verdict = computeVerdict({
      materialPropositionIds: materialProps,
      verifiedFindings: findings,
    });

    expect(verdict).toBe("supported");
  });

  it("returns 'supported' when material propositions are supported even with extra context findings", () => {
    const findings: VerifiedFinding[] = [
      makeVerifiedFinding({ findingId: "f-1", propositionId: "prop-1", stance: "supports" }),
      makeVerifiedFinding({ findingId: "f-2", propositionId: "prop-2", stance: "supports" }),
      makeVerifiedFinding({ findingId: "f-3", propositionId: "prop-1", stance: "context" }),
    ];

    const verdict = computeVerdict({
      materialPropositionIds: materialProps,
      verifiedFindings: findings,
    });

    expect(verdict).toBe("supported");
  });

  it("returns 'revise' if any material proposition has a contradicted finding, even if all have support", () => {
    const findings: VerifiedFinding[] = [
      makeVerifiedFinding({ findingId: "f-1", propositionId: "prop-1", stance: "supports" }),
      makeVerifiedFinding({ findingId: "f-2", propositionId: "prop-2", stance: "supports" }),
      makeVerifiedFinding({ findingId: "f-3", propositionId: "prop-1", stance: "contradicts" }),
    ];

    const verdict = computeVerdict({
      materialPropositionIds: materialProps,
      verifiedFindings: findings,
    });

    expect(verdict).toBe("revise");
  });

  it("returns 'revise' if any material proposition has a contradicted finding with no supporting findings", () => {
    const findings: VerifiedFinding[] = [
      makeVerifiedFinding({ findingId: "f-1", propositionId: "prop-1", stance: "contradicts" }),
    ];

    const verdict = computeVerdict({
      materialPropositionIds: materialProps,
      verifiedFindings: findings,
    });

    expect(verdict).toBe("revise");
  });

  it("returns 'insufficient_evidence' when only a subset of material propositions has support", () => {
    const findings: VerifiedFinding[] = [
      makeVerifiedFinding({ findingId: "f-1", propositionId: "prop-1", stance: "supports" }),
    ];

    const verdict = computeVerdict({
      materialPropositionIds: materialProps,
      verifiedFindings: findings,
    });

    expect(verdict).toBe("insufficient_evidence");
  });

  it("returns 'insufficient_evidence' when there are no findings at all", () => {
    const verdict = computeVerdict({
      materialPropositionIds: materialProps,
      verifiedFindings: [],
    });

    expect(verdict).toBe("insufficient_evidence");
  });

  it("returns 'insufficient_evidence' when material propositions only have context findings", () => {
    const findings: VerifiedFinding[] = [
      makeVerifiedFinding({ findingId: "f-1", propositionId: "prop-1", stance: "context" }),
      makeVerifiedFinding({ findingId: "f-2", propositionId: "prop-2", stance: "context" }),
    ];

    const verdict = computeVerdict({
      materialPropositionIds: materialProps,
      verifiedFindings: findings,
    });

    expect(verdict).toBe("insufficient_evidence");
  });

  it("ignores non-material propositions when evaluating complete support", () => {
    // Only prop-non-material is supported, prop-1 and prop-2 are not
    const findings: VerifiedFinding[] = [
      makeVerifiedFinding({ findingId: "f-1", propositionId: "prop-non-material", stance: "supports" }),
    ];

    const verdict = computeVerdict({
      materialPropositionIds: materialProps,
      verifiedFindings: findings,
    });

    expect(verdict).toBe("insufficient_evidence");
  });
});

describe("Deterministic Editor - Deduplication & Collection", () => {
  it("deduplicates findings by propositionId + stance + quote", () => {
    const f1 = makeVerifiedFinding({
      findingId: "f-1",
      propositionId: "prop-1",
      stance: "supports",
      citations: [
        {
          sourceId: "src-1",
          url: "https://example.com/1",
          quote: "Exact quote text from source.",
          locator: "p. 10",
        },
      ],
    });
    const f2 = makeVerifiedFinding({
      findingId: "f-2",
      propositionId: "prop-1",
      stance: "supports",
      citations: [
        {
          sourceId: "src-1",
          url: "https://example.com/1",
          quote: "Exact quote text from source.",
          locator: "p. 10",
        },
      ],
    });

    const result = deduplicateFindings([f1, f2]);
    expect(result.deduplicatedFindings).toEqual([f1]);
    expect(result.duplicateFindingIds).toEqual(["f-2"]);
  });

  it("normalizes quote whitespace and characters when detecting duplicates", () => {
    const f1 = makeVerifiedFinding({
      findingId: "f-1",
      propositionId: "prop-1",
      stance: "supports",
      citations: [
        {
          sourceId: "src-1",
          url: "https://example.com/1",
          quote: "Modern  neural   networks\r\nare poorly calibrated.",
          locator: "p. 10",
        },
      ],
    });
    const f2 = makeVerifiedFinding({
      findingId: "f-2",
      propositionId: "prop-1",
      stance: "supports",
      citations: [
        {
          sourceId: "src-1",
          url: "https://example.com/1",
          quote: "Modern neural networks are poorly calibrated.",
          locator: "p. 10",
        },
      ],
    });

    const result = deduplicateFindings([f1, f2]);
    expect(result.deduplicatedFindings).toEqual([f1]);
    expect(result.duplicateFindingIds).toEqual(["f-2"]);
  });

  it("keeps findings distinct if stance differs", () => {
    const f1 = makeVerifiedFinding({
      findingId: "f-1",
      propositionId: "prop-1",
      stance: "supports",
      citations: [
        {
          sourceId: "src-1",
          url: "https://example.com/1",
          quote: "Same quote",
          locator: "p. 1",
        },
      ],
    });
    const f2 = makeVerifiedFinding({
      findingId: "f-2",
      propositionId: "prop-1",
      stance: "contradicts",
      citations: [
        {
          sourceId: "src-1",
          url: "https://example.com/1",
          quote: "Same quote",
          locator: "p. 1",
        },
      ],
    });

    const result = deduplicateFindings([f1, f2]);
    expect(result.deduplicatedFindings).toHaveLength(2);
    expect(result.duplicateFindingIds).toHaveLength(0);
  });

  it("collects unique source IDs from findings in sorted order", () => {
    const findings: VerifiedFinding[] = [
      makeVerifiedFinding({
        findingId: "f-1",
        citations: [
          { sourceId: "src-b", url: "https://example.com/b", quote: "q1", locator: "p. 1" },
          { sourceId: "src-a", url: "https://example.com/a", quote: "q2", locator: "p. 2" },
        ],
      }),
      makeVerifiedFinding({
        findingId: "f-2",
        citations: [
          { sourceId: "src-c", url: "https://example.com/c", quote: "q3", locator: "p. 3" },
          { sourceId: "src-a", url: "https://example.com/a", quote: "q4", locator: "p. 4" },
        ],
      }),
    ];

    const sourceIds = collectSourceIds(findings);
    expect(sourceIds).toEqual(["src-a", "src-b", "src-c"]);
  });

  it("collects unique rejectedFindingIds combining input rejections and duplicates", () => {
    const rejectedInput = ["f-rej-1", "f-rej-2"];
    const duplicateIds = ["f-dup-1", "f-rej-1"]; // f-rej-1 overlap

    const rejectedIds = collectRejectedFindingIds(rejectedInput, duplicateIds);
    expect(rejectedIds).toEqual(["f-dup-1", "f-rej-1", "f-rej-2"]);
  });

  it("caps collected sourceIds and rejectedFindingIds at 50 elements", () => {
    const manyFindings = Array.from({ length: 70 }, (_, i) =>
      makeVerifiedFinding({
        findingId: `f-${i}`,
        citations: [
          {
            sourceId: `src-${String(i).padStart(3, "0")}`,
            url: `https://example.com/${i}`,
            quote: `quote ${i}`,
            locator: "p. 1",
          },
        ],
      }),
    );

    const sourceIds = collectSourceIds(manyFindings);
    expect(sourceIds).toHaveLength(50);

    const manyRejected = Array.from({ length: 65 }, (_, i) => `rej-${i}`);
    const rejectedIds = collectRejectedFindingIds(manyRejected);
    expect(rejectedIds).toHaveLength(50);
  });

  it("treats citations order invariantly when deduplicating findings", () => {
    const f1 = makeVerifiedFinding({
      findingId: "f-1",
      propositionId: "prop-1",
      stance: "supports",
      citations: [
        { sourceId: "src-1", url: "https://example.com/1", quote: "Alpha quote", locator: "p. 1" },
        { sourceId: "src-2", url: "https://example.com/2", quote: "Beta quote", locator: "p. 2" },
      ],
    });
    const f2 = makeVerifiedFinding({
      findingId: "f-2",
      propositionId: "prop-1",
      stance: "supports",
      citations: [
        { sourceId: "src-2", url: "https://example.com/2", quote: "Beta quote", locator: "p. 2" },
        { sourceId: "src-1", url: "https://example.com/1", quote: "Alpha quote", locator: "p. 1" },
      ],
    });

    const result = deduplicateFindings([f1, f2]);
    expect(result.deduplicatedFindings).toEqual([f1]);
    expect(result.duplicateFindingIds).toEqual(["f-2"]);
  });
});

describe("Deterministic Editor - Canonical Result Hash", () => {
  it("computes a deterministic 64-character lowercase hex SHA-256 hash", () => {
    const hash = computeResultHash({
      claimId: "claim-1",
      mode: "quick",
      verdict: "supported",
      sourceIds: ["src-1", "src-2"],
      verifiedFindingCount: 3,
      rejectedFindingCount: 1,
    });

    expect(hash).toMatch(/^[0-9a-f]{64}$/);

    const hash2 = computeResultHash({
      claimId: "claim-1",
      mode: "quick",
      verdict: "supported",
      sourceIds: ["src-1", "src-2"],
      verifiedFindingCount: 3,
      rejectedFindingCount: 1,
    });
    expect(hash).toBe(hash2);
  });

  it("produces distinct hashes when any parameter changes", () => {
    const base = {
      claimId: "claim-1" as const,
      mode: "quick" as const,
      verdict: "supported" as const,
      sourceIds: ["src-1"],
      verifiedFindingCount: 2,
      rejectedFindingCount: 0,
    };

    const baseHash = computeResultHash(base);
    const modeHash = computeResultHash({ ...base, mode: "balanced" });
    const verdictHash = computeResultHash({ ...base, verdict: "revise" });
    const countHash = computeResultHash({ ...base, verifiedFindingCount: 3 });
    const rejHash = computeResultHash({ ...base, rejectedFindingCount: 1 });

    expect(baseHash).not.toBe(modeHash);
    expect(baseHash).not.toBe(verdictHash);
    expect(baseHash).not.toBe(countHash);
    expect(baseHash).not.toBe(rejHash);
  });
});

describe("Deterministic Editor - Turkish Summary Generator", () => {
  it("generates deterministic Turkish summary for 'supported'", () => {
    const summary = generateTurkishSummary("supported", 3, 0);
    expect(summary).toContain("desteklenmektedir");
    expect(summary).toContain("3 doğrulanmış bulgu");

    const summaryWithRejections = generateTurkishSummary("supported", 2, 1);
    expect(summaryWithRejections).toContain("1 elenen bulgu");
  });

  it("generates deterministic Turkish summary for 'revise'", () => {
    const summary = generateTurkishSummary("revise", 2, 1);
    expect(summary).toContain("revize");
    expect(summary).toContain("karşıt");
    expect(summary).toContain("2 doğrulanmış bulgu");
    expect(summary).toContain("1 elenen bulgu");
  });

  it("generates deterministic Turkish summary for 'insufficient_evidence'", () => {
    const summary = generateTurkishSummary("insufficient_evidence", 1, 2);
    expect(summary).toContain("yetersiz");
    expect(summary).toContain("1 doğrulanmış bulgu");
    expect(summary).toContain("2 elenen bulgu");
  });
});

describe("Deterministic Editor - compileReview", () => {
  const validRunId = "11111111-2222-4333-8444-555555555555";

  it("compiles a review run into a valid RunReceipt with 'Son kontrol: Cem.'", () => {
    const findings: VerifiedFinding[] = [
      makeVerifiedFinding({
        findingId: "f-1",
        propositionId: "prop-ml-1",
        stance: "supports",
        citations: [{ sourceId: "src-ml-guo-2017", url: "https://arxiv.org/abs/1706.04599", quote: "q1", locator: "p. 1" }],
      }),
      makeVerifiedFinding({
        findingId: "f-2",
        propositionId: "prop-ml-2",
        stance: "supports",
        citations: [{ sourceId: "src-ml-guo-2017", url: "https://arxiv.org/abs/1706.04599", quote: "q2", locator: "p. 2" }],
      }),
      makeVerifiedFinding({
        findingId: "f-3",
        propositionId: "prop-ml-3",
        stance: "supports",
        citations: [{ sourceId: "src-ml-scikit-calibration", url: "https://scikit-learn.org/stable/modules/calibration.html", quote: "q3", locator: "Section 1.16" }],
      }),
    ];

    const result = compileReview({
      runId: validRunId,
      claimId: "claim-1",
      mode: "quick",
      durationMs: 450,
      resultSource: "live",
      completedAt: "2026-09-12T10:00:00.000Z",
      verifiedFindings: findings,
      rejectedFindings: ["f-rej-1"],
    });

    expect(result.verdict).toBe("supported");
    expect(result.receipt.humanReviewLabel).toBe("Son kontrol: Cem.");
    expect(result.receipt.verdict).toBe("supported");
    expect(result.receipt.sourceIds).toEqual(["src-ml-guo-2017", "src-ml-scikit-calibration"]);
    expect(result.receipt.rejectedFindingIds).toEqual(["f-rej-1"]);
    expect(result.receipt.durationMs).toBe(450);
    expect(result.receipt.resultSource).toBe("live");
    expect(result.receipt.resultHash).toMatch(/^[0-9a-f]{64}$/);

    // Verify against strict contract parser
    const parsed = parseRunReceipt(result.receipt);
    expect(parsed.humanReviewLabel).toBe("Son kontrol: Cem.");
  });

  it("handles duplicate findings by moving duplicates to rejectedFindingIds", () => {
    const f1 = makeVerifiedFinding({
      findingId: "f-1",
      propositionId: "prop-ml-1",
      stance: "supports",
      citations: [{ sourceId: "src-ml-guo-2017", url: "https://arxiv.org/abs/1706.04599", quote: "q1", locator: "p. 1" }],
    });
    const f1Duplicate = makeVerifiedFinding({
      findingId: "f-dup-1",
      propositionId: "prop-ml-1",
      stance: "supports",
      citations: [{ sourceId: "src-ml-guo-2017", url: "https://arxiv.org/abs/1706.04599", quote: "q1", locator: "p. 1" }],
    });

    const result = compileReview({
      runId: validRunId,
      claimId: "claim-1",
      mode: "quick",
      durationMs: 300,
      verifiedFindings: [f1, f1Duplicate],
      materialPropositionIds: ["prop-ml-1"],
      completedAt: "2026-09-12T10:00:00.000Z",
    });

    expect(result.deduplicatedFindings).toHaveLength(1);
    expect(result.deduplicatedFindings[0].findingId).toBe("f-1");
    expect(result.receipt.rejectedFindingIds).toContain("f-dup-1");
    expect(result.verdict).toBe("supported");
  });

  it("defaults resultSource to 'live' and generates valid ISO completedAt if omitted", () => {
    const result = compileReview({
      runId: validRunId,
      claimId: "claim-1",
      mode: "quick",
      durationMs: 120,
      verifiedFindings: [],
      materialPropositionIds: ["prop-ml-1"],
    });

    expect(result.receipt.resultSource).toBe("live");
    expect(result.receipt.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    const parsed = parseRunReceipt(result.receipt);
    expect(parsed.resultSource).toBe("live");
  });

  it("respects explicit resultSource such as 'cache' or 'fallback_cache'", () => {
    const result = compileReview({
      runId: validRunId,
      claimId: "claim-1",
      mode: "balanced",
      durationMs: 10,
      resultSource: "cache",
      verifiedFindings: [],
      materialPropositionIds: ["prop-ml-1"],
    });

    expect(result.receipt.resultSource).toBe("cache");
    const parsed = parseRunReceipt(result.receipt);
    expect(parsed.resultSource).toBe("cache");
  });
});
