import { beforeEach, describe, expect, it } from "vitest";
import {
  computeExcerptChecksum,
  getAllClaims,
  getClaimById,
  getCorpusSource,
  normalizeCorpusText,
  verifyCorpusIntegrity,
} from "./corpus";
import { CitationVerifier, DraftClaimError } from "./citations";
import {
  isRejectedFinding,
  isVerifiedFinding,
  type Finding,
} from "./contracts";

const validFinding: Finding = {
  findingId: "f-ml-1",
  propositionId: "prop-ml-1",
  stance: "supports",
  summary: "Aggregate accuracy does not imply proper calibration in neural networks.",
  citations: [
    {
      sourceId: "src-ml-guo-2017",
      url: "https://arxiv.org/abs/1706.04599",
      quote: "modern neural networks, unlike those from a decade ago, are poorly calibrated",
      locator: "Abstract, p. 1",
    },
  ],
};

describe("Corpus and SHA-256 integrity", () => {
  it("computes stable SHA-256 checksums across runs", () => {
    const text = "Reliability requires evaluation beyond aggregate accuracy.";
    const hash1 = computeExcerptChecksum(text);
    const hash2 = computeExcerptChecksum(text);

    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[0-9a-f]{64}$/);
  });

  it("normalizes whitespace and line breaks when hashing excerpts", () => {
    const raw1 = "Modern neural networks\r\n  are poorly   calibrated.";
    const raw2 = "Modern neural networks\n are poorly calibrated.";

    expect(computeExcerptChecksum(raw1)).toBe(computeExcerptChecksum(raw2));
    expect(normalizeCorpusText(raw1)).toBe("Modern neural networks are poorly calibrated.");
  });

  it("verifies integrity of all loaded claims and excerpts", () => {
    const result = verifyCorpusIntegrity();
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("detects corrupted excerpt or checksum mismatch", () => {
    const claim1 = getClaimById("claim-1");
    expect(claim1).toBeDefined();

    const tampered = {
      ...claim1!,
      sources: [
        {
          ...claim1!.sources[0],
          excerpt: claim1!.sources[0].excerpt + " [tampered modification]",
        },
      ],
    };

    const result = verifyCorpusIntegrity(tampered);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain("Checksum mismatch");
  });
});

describe("Server-only corpus lookup and claim records", () => {
  it("contains exactly three claims with claim-1 approved and claims 2 and 3 in draft status", () => {
    const claims = getAllClaims();
    expect(claims.length).toBe(3);

    const claim1 = getClaimById("claim-1");
    const claim2 = getClaimById("claim-2");
    const claim3 = getClaimById("claim-3");

    expect(claim1?.reviewStatus).toBe("approved");
    expect(claim2?.reviewStatus).toBe("draft");
    expect(claim3?.reviewStatus).toBe("draft");
  });

  it("only claim-1 has verified public sources at this stage", () => {
    const claim1 = getClaimById("claim-1");
    const claim2 = getClaimById("claim-2");
    const claim3 = getClaimById("claim-3");

    expect(claim1?.sources.length).toBeGreaterThanOrEqual(2);
    expect(claim2?.sources.length).toBe(0);
    expect(claim3?.sources.length).toBe(0);

    for (const source of claim1!.sources) {
      expect(source.url.startsWith("https://")).toBe(true);
      expect(source.excerpt.length).toBeGreaterThan(20);
      expect(source.checksum).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it("looks up individual corpus sources by claim and source ID", () => {
    const source = getCorpusSource("claim-1", "src-ml-guo-2017");
    expect(source).toBeDefined();
    expect(source?.publisher).toContain("ICML");

    const missing = getCorpusSource("claim-1", "src-unknown-999");
    expect(missing).toBeUndefined();
  });
});

describe("CitationVerifier - Draft case execution restriction", () => {
  let verifier: CitationVerifier;

  beforeEach(() => {
    verifier = new CitationVerifier();
  });

  it("refuses to execute verification on draft claim-2 and throws DraftClaimError", () => {
    expect(() => verifier.verifyFinding("claim-2", validFinding)).toThrowError(DraftClaimError);
    expect(() => verifier.verifyFinding("claim-2", validFinding)).toThrowError(
      /in draft status and unexecutable/,
    );
  });

  it("refuses to execute batch verification on draft claim-3", () => {
    expect(() => verifier.verifyFindings("claim-3", [validFinding])).toThrowError(DraftClaimError);
  });
});

describe("CitationVerifier - Grounded verification and rejection codes", () => {
  let verifier: CitationVerifier;

  beforeEach(() => {
    verifier = new CitationVerifier();
  });

  it("accepts a fully grounded finding for approved claim-1", () => {
    const result = verifier.verifyFinding("claim-1", validFinding);
    expect(isVerifiedFinding(result)).toBe(true);
    if (!isVerifiedFinding(result)) throw new Error("Expected verified finding");

    expect(result.verified).toBe(true);
    expect(result).toMatchObject({
      findingId: "f-ml-1",
      propositionId: "prop-ml-1",
      stance: "supports",
      verified: true,
    });
  });

  it("rejects unknown source with code unknown_source", () => {
    const finding: Finding = {
      ...validFinding,
      citations: [
        {
          ...validFinding.citations[0],
          sourceId: "src-non-existent",
        },
      ],
    };

    const result = verifier.verifyFinding("claim-1", finding);
    expect(isRejectedFinding(result)).toBe(true);
    if (!isRejectedFinding(result)) throw new Error("Expected rejected finding");
    expect(result.code).toBe("unknown_source");
  });

  it("rejects empty or whitespace-only quote with code missing_quote", () => {
    const findingEmpty: Finding = {
      ...validFinding,
      citations: [
        {
          ...validFinding.citations[0],
          quote: "   ",
        },
      ],
    };

    const result = verifier.verifyFinding("claim-1", findingEmpty);
    expect(isRejectedFinding(result)).toBe(true);
    if (!isRejectedFinding(result)) throw new Error("Expected rejected finding");
    expect(result.code).toBe("missing_quote");
  });

  it("rejects fabricated or mismatched quote with code quote_mismatch", () => {
    const findingMismatch: Finding = {
      ...validFinding,
      citations: [
        {
          ...validFinding.citations[0],
          quote: "Neural networks never fail when accuracy reaches ninety-nine percent.",
        },
      ],
    };

    const result = verifier.verifyFinding("claim-1", findingMismatch);
    expect(isRejectedFinding(result)).toBe(true);
    if (!isRejectedFinding(result)) throw new Error("Expected rejected finding");
    expect(result.code).toBe("quote_mismatch");
  });

  it("accepts verbatim quote despite whitespace and curly quote variation", () => {
    const findingNormalized: Finding = {
      ...validFinding,
      citations: [
        {
          ...validFinding.citations[0],
          quote: "modern   neural networks,\nunlike those from a decade ago,\nare poorly calibrated",
        },
      ],
    };

    const result = verifier.verifyFinding("claim-1", findingNormalized);
    expect(isVerifiedFinding(result)).toBe(true);
    if (!isVerifiedFinding(result)) throw new Error("Expected verified finding");
    expect(result.verified).toBe(true);
  });

  it("rejects locator outside bounds with code locator_mismatch", () => {
    const findingBadLocator: Finding = {
      ...validFinding,
      citations: [
        {
          ...validFinding.citations[0],
          locator: "p. 99",
        },
      ],
    };

    const result = verifier.verifyFinding("claim-1", findingBadLocator);
    expect(isRejectedFinding(result)).toBe(true);
    if (!isRejectedFinding(result)) throw new Error("Expected rejected finding");
    expect(result.code).toBe("locator_mismatch");
  });

  it("rejects unsafe or mismatched source URL with code unsafe_url", () => {
    const findingUnsafeHost: Finding = {
      ...validFinding,
      citations: [
        {
          ...validFinding.citations[0],
          url: "https://127.0.0.1:8080/exploit",
        },
      ],
    };

    const findingMismatchedUrl: Finding = {
      ...validFinding,
      citations: [
        {
          ...validFinding.citations[0],
          url: "https://attacker-domain.org/fake-paper",
        },
      ],
    };

    const res1 = verifier.verifyFinding("claim-1", findingUnsafeHost);
    expect(isRejectedFinding(res1)).toBe(true);
    if (isRejectedFinding(res1)) {
      expect(res1.code).toBe("unsafe_url");
    }

    const res2 = verifier.verifyFinding("claim-1", findingMismatchedUrl);
    expect(isRejectedFinding(res2)).toBe(true);
    if (isRejectedFinding(res2)) {
      expect(res2.code).toBe("unsafe_url");
    }
  });

  it("rejects findings tied to unknown proposition with code unsupported_component", () => {
    const findingBadProp: Finding = {
      ...validFinding,
      propositionId: "prop-unknown-999",
    };

    const result = verifier.verifyFinding("claim-1", findingBadProp);
    expect(isRejectedFinding(result)).toBe(true);
    if (!isRejectedFinding(result)) throw new Error("Expected rejected finding");
    expect(result.code).toBe("unsupported_component");
  });

  it("rejects oversized fields with code oversized_field", () => {
    const findingOversized: Finding = {
      ...validFinding,
      summary: "a".repeat(501),
    };

    const result = verifier.verifyFinding("claim-1", findingOversized);
    expect(isRejectedFinding(result)).toBe(true);
    if (!isRejectedFinding(result)) throw new Error("Expected rejected finding");
    expect(result.code).toBe("oversized_field");
  });

  it("rejects duplicate findings with code duplicate_finding", () => {
    const result1 = verifier.verifyFinding("claim-1", validFinding);
    expect(isVerifiedFinding(result1)).toBe(true);

    // Same finding verified again in same session
    const result2 = verifier.verifyFinding("claim-1", validFinding);
    expect(isRejectedFinding(result2)).toBe(true);
    if (!isRejectedFinding(result2)) throw new Error("Expected rejected finding");
    expect(result2.code).toBe("duplicate_finding");
  });

  it("batch verification separates verified findings from rejected findings", () => {
    const batchVerifier = new CitationVerifier();

    const finding2: Finding = {
      findingId: "f-ml-2",
      propositionId: "prop-ml-2",
      stance: "supports",
      summary: "Scikit-learn documentation defines well calibrated classifiers.",
      citations: [
        {
          sourceId: "src-ml-scikit-calibration",
          url: "https://scikit-learn.org/stable/modules/calibration.html",
          quote: "Well calibrated classifiers are probabilistic classifiers",
          locator: "Section 1.16",
        },
      ],
    };

    const invalidFinding: Finding = {
      findingId: "f-ml-3",
      propositionId: "prop-ml-1",
      stance: "contradicts",
      summary: "Fabricated citation.",
      citations: [
        {
          sourceId: "src-ml-guo-2017",
          url: "https://arxiv.org/abs/1706.04599",
          quote: "This text does not exist anywhere in the paper.",
          locator: "Abstract, p. 1",
        },
      ],
    };

    const duplicateFinding: Finding = {
      ...validFinding,
      findingId: "f-ml-1", // duplicate ID
    };

    const batch = batchVerifier.verifyFindings("claim-1", [
      validFinding,
      finding2,
      invalidFinding,
      duplicateFinding,
    ]);

    expect(batch.verified.length).toBe(2);
    expect(batch.rejected.length).toBe(2);
    expect(batch.verified.map((v) => v.findingId)).toEqual(["f-ml-1", "f-ml-2"]);
    expect(batch.rejected.map((r) => r.code)).toEqual(["quote_mismatch", "duplicate_finding"]);
  });
});
