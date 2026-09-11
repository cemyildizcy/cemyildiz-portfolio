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
      url: "https://arxiv.org/abs/1706.04599v2",
      quote: "We discover that modern neural networks, unlike those from a decade ago, are poorly calibrated.",
      locator: "Abstract, arXiv v2 landing page",
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
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
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
  it("contains exactly three claims, with all claims approved for review", () => {
    const claims = getAllClaims();
    expect(claims.length).toBe(3);

    const claim1 = getClaimById("claim-1");
    const claim2 = getClaimById("claim-2");
    const claim3 = getClaimById("claim-3");

    expect(claim1?.reviewStatus).toBe("approved");
    expect(claim2?.reviewStatus).toBe("approved");
    expect(claim3?.reviewStatus).toBe("approved");
  });

  it("all three claims have verified public sources with valid HTTPS URLs, locators, and checksums", () => {
    const claims = getAllClaims();
    expect(claims.length).toBe(3);

    for (const claim of claims) {
      expect(claim.sources.length).toBeGreaterThanOrEqual(2);
      for (const source of claim.sources) {
        expect(source.url.startsWith("https://")).toBe(true);
        expect(source.excerpt.length).toBeGreaterThan(20);
        expect(source.checksum).toMatch(/^[0-9a-f]{64}$/);
        expect(source.locator.trim().length).toBeGreaterThan(0);
      }
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

  const draftClaimRecord = {
    id: "claim-2" as const,
    title: "Draft Test Claim",
    statement: "Draft statement",
    topic: "test",
    reviewStatus: "draft" as const,
    propositions: [],
    sources: [],
  };

  beforeEach(() => {
    verifier = new CitationVerifier((claimId) =>
      claimId === "claim-2" ? draftClaimRecord : getClaimById(claimId),
    );
  });

  it("refuses to execute verification on draft claim and throws DraftClaimError", () => {
    expect(() => verifier.verifyFinding("claim-2", validFinding)).toThrowError(DraftClaimError);
    expect(() => verifier.verifyFinding("claim-2", validFinding)).toThrowError(
      /in draft status and unexecutable/,
    );
  });

  it("refuses to execute batch verification on draft claim", () => {
    expect(() => verifier.verifyFindings("claim-2", [validFinding])).toThrowError(DraftClaimError);
  });
});

describe("CitationVerifier - Grounded verification and rejection codes", () => {
  let verifier: CitationVerifier;

  beforeEach(() => {
    verifier = new CitationVerifier();
  });

  it("replaces an opposite HTML-like provider summary with reviewed presentation text", () => {
    const maliciousSummary = "<img src=x onerror=alert(1)> Yüksek doğruluk güvenilirliği kesin kanıtlar.";
    const result = verifier.verifyFinding("claim-1", {
      ...validFinding,
      summary: maliciousSummary,
    });
    expect(isVerifiedFinding(result)).toBe(true);
    if (!isVerifiedFinding(result)) throw new Error("Expected verified finding");

    expect(result.verified).toBe(true);
    expect(result.summary).toBe(
      "Modern sinir ağlarının zayıf kalibre edilebilmesi, doğruluğun tek başına güvenilirlik kanıtı olmadığını gösterir.",
    );
    expect(result.summary).not.toContain(maliciousSummary);
    expect(result.summary).not.toContain("<img");
  });

  it("uses a fixed safe label instead of a rejected provider summary", () => {
    const maliciousSummary = "<script>alert('rejected')</script> karşıt iddia";
    const result = verifier.verifyFinding("claim-1", {
      ...validFinding,
      findingId: "f-rejected-summary",
      summary: maliciousSummary,
      citations: [{ ...validFinding.citations[0], sourceId: "src-non-existent" }],
    });
    expect(isRejectedFinding(result)).toBe(true);
    if (!isRejectedFinding(result)) throw new Error("Expected rejected finding");

    expect(result.summary).toBe("Sağlayıcı bulgusu güvenli doğrulama kurallarını geçemedi.");
    expect(result.summary).not.toContain(maliciousSummary);
    expect(result.summary).not.toContain("<script");
  });

  it("rejects the truncated sklearn quote as a semantic mismatch", () => {
    const result = verifier.verifyFinding("claim-1", {
      findingId: "f-ml-truncated",
      propositionId: "prop-ml-3",
      stance: "supports",
      summary: "Provider claims the partial quote is sufficient.",
      citations: [
        {
          sourceId: "src-ml-scikit-calibration",
          url: "https://scikit-learn.org/1.7/modules/calibration.html",
          quote: "Well calibrated classifiers are probabilistic classifiers",
          locator: "Section 1.16",
        },
      ],
    });

    expect(isRejectedFinding(result)).toBe(true);
    if (!isRejectedFinding(result)) throw new Error("Expected rejected finding");
    expect(result.code).toBe("semantic_mismatch");
  });

  it("binds Claim 3 editor behavior to implementation and narrows the fixed label claim", () => {
    const claim = getClaimById("claim-3");
    const propositionIds = claim?.propositions.map((proposition) => proposition.id);

    expect(propositionIds).toEqual([
      "prop-portfolio-roles",
      "prop-portfolio-editor",
      "prop-portfolio-human-control",
      "prop-portfolio-2",
    ]);
    expect(claim?.propositions.find(({ id }) => id === "prop-portfolio-human-control")?.statement)
      .toBe("AI Review Desk'in tamamlanan sonuçları, son kontrol sorumluluğunu Cem'e atayan sabit “Son kontrol: Cem.” etiketini gösterir.");

    const runSource = getCorpusSource("claim-3", "src-portfolio-run-8a69913");
    expect(runSource?.semanticMappings.map((mapping) => mapping.propositionId)).toEqual([
      "prop-portfolio-roles",
      "prop-portfolio-editor",
    ]);
    expect(runSource?.semanticMappings.find(({ propositionId }) => propositionId === "prop-portfolio-editor")?.quote)
      .toContain("verifiedFindings: allVerifiedFindings");

    const editorSource = getCorpusSource("claim-3", "src-portfolio-editor-8a69913");
    expect(editorSource?.url).toBe("https://github.com/cemyildizcy/cemyildiz-portfolio/blob/8a6991310633ec1f758c115ef361fd223edb2123/src/lib/review/editor.ts");
    expect(editorSource?.semanticMappings.find(({ propositionId }) => propositionId === "prop-portfolio-editor")?.quote)
      .toContain("const verdict = computeVerdict");
    expect(editorSource?.semanticMappings.find(({ propositionId }) => propositionId === "prop-portfolio-editor")?.displaySummary)
      .toBe("Editoryal derleme, yalnızca doğrulanmış bulguları deterministik doğruluk tablosu ve özet kurallarıyla birleştirir.");
  });

  it("does not describe the fixed responsibility label as proof that Cem reviewed a result", () => {
    const designSource = getCorpusSource("claim-3", "src-portfolio-design-8a69913");
    const mapping = designSource?.semanticMappings.find(
      ({ propositionId }) => propositionId === "prop-portfolio-human-control",
    );

    expect(mapping?.displaySummary).toBe("Tamamlanan sonuçlar, son kontrol sorumluluğunu Cem'e atayan sabit “Son kontrol: Cem.” etiketini gösterir.");
    expect(mapping?.displaySummary).not.toMatch(/kontrolü? (Cem'e bırakılır|Cem yaptı)|Cem tarafından (incelendi|kontrol edildi)/i);

    const designEditorMapping = designSource?.semanticMappings.find(
      ({ propositionId }) => propositionId === "prop-portfolio-editor",
    );
    expect(designEditorMapping).toBeUndefined();
  });

  it("verifies findings citing implementation sources for prop-portfolio-editor", () => {
    const runFindingResult = verifier.verifyFinding("claim-3", {
      findingId: "f-test-run-editor",
      propositionId: "prop-portfolio-editor",
      stance: "supports",
      summary: "Arbitrary untrusted text",
      citations: [
        {
          sourceId: "src-portfolio-run-8a69913",
          url: "https://github.com/cemyildizcy/cemyildiz-portfolio/blob/8a6991310633ec1f758c115ef361fd223edb2123/src/lib/review/run.ts",
          quote: "verifiedFindings: allVerifiedFindings,\n          rejectedFindings: allRejectedFindings,",
          locator: "src/lib/review/run.ts, lines 186-194",
        },
      ],
    });
    expect(isVerifiedFinding(runFindingResult)).toBe(true);
    if (!isVerifiedFinding(runFindingResult)) throw new Error("Expected verified finding");
    expect(runFindingResult.summary).toBe("Orkestratör derleme aşamasına yalnızca doğrulanmış bulguları aktarır.");

    const editorFindingResult = verifier.verifyFinding("claim-3", {
      findingId: "f-test-editor-impl",
      propositionId: "prop-portfolio-editor",
      stance: "supports",
      summary: "Arbitrary untrusted text",
      citations: [
        {
          sourceId: "src-portfolio-editor-8a69913",
          url: "https://github.com/cemyildizcy/cemyildiz-portfolio/blob/8a6991310633ec1f758c115ef361fd223edb2123/src/lib/review/editor.ts",
          quote: "const verdict = computeVerdict({\n    materialPropositionIds,\n    verifiedFindings: deduplicatedFindings,\n  });",
          locator: "src/lib/review/editor.ts, lines 199-219",
        },
      ],
    });
    expect(isVerifiedFinding(editorFindingResult)).toBe(true);
    if (!isVerifiedFinding(editorFindingResult)) throw new Error("Expected verified finding");
    expect(editorFindingResult.summary).toBe("Editoryal derleme, yalnızca doğrulanmış bulguları deterministik doğruluk tablosu ve özet kurallarıyla birleştirir.");
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

  it("rejects a verbatim citation when its stance inverts the reviewed semantic mapping", () => {
    const invertedFinding: Finding = {
      ...validFinding,
      findingId: "f-ml-inverted",
      stance: "contradicts",
    };

    const result = verifier.verifyFinding("claim-1", invertedFinding);
    expect(isRejectedFinding(result)).toBe(true);
    if (!isRejectedFinding(result)) throw new Error("Expected rejected finding");
    expect(result.code).toBe("semantic_mismatch");
  });

  it("rejects a verbatim quote mapped to a different proposition", () => {
    const misboundFinding: Finding = {
      ...validFinding,
      findingId: "f-ml-misbound",
      propositionId: "prop-ml-3",
    };

    const result = verifier.verifyFinding("claim-1", misboundFinding);
    expect(isRejectedFinding(result)).toBe(true);
    if (!isRejectedFinding(result)) throw new Error("Expected rejected finding");
    expect(result.code).toBe("semantic_mismatch");
  });

  it("accepts verbatim quote despite whitespace and curly quote variation", () => {
    const findingNormalized: Finding = {
      ...validFinding,
      citations: [
        {
          ...validFinding.citations[0],
          quote: "We discover that modern   neural networks,\nunlike those from a decade ago,\nare poorly calibrated.",
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
      propositionId: "prop-ml-3",
      stance: "supports",
      summary: "Scikit-learn documentation defines well calibrated classifiers.",
      citations: [
        {
          sourceId: "src-ml-scikit-calibration",
          url: "https://scikit-learn.org/1.7/modules/calibration.html",
          quote: "Well calibrated classifiers are probabilistic classifiers for which the output of the predict_proba method can be directly interpreted as a confidence level.",
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
          url: "https://arxiv.org/abs/1706.04599v2",
          quote: "This text does not exist anywhere in the paper.",
          locator: "Abstract, arXiv v2 landing page",
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
