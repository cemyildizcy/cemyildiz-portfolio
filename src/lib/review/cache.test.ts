import { beforeEach, describe, expect, it } from "vitest";
import type {
  ClaimId,
  ReviewMode,
  RunReceipt,
  VerifiedFinding,
} from "./contracts";
import { computeResultHash } from "./editor";
import {
  ReviewCache,
  computeClaimCorpusHash,
  computeRecordChecksum,
  getCanonicalCacheKey,
  validateCachedRecord,
  type CachedReviewRecord,
} from "./cache";

describe("Review Desk Cache - Canonical Keys and Integrity Validation", () => {
  const sampleReceipt: RunReceipt = {
    runId: "123e4567-e89b-42d3-a456-426614174001",
    claimId: "claim-1",
    mode: "quick",
    verdict: "supported",
    durationMs: 842,
    resultSource: "live",
    sourceIds: ["src-ml-guo-2017", "src-ml-niculescu-2005"],
    rejectedFindingIds: [],
    resultHash: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    completedAt: "2026-09-11T10:30:00.000Z",
    humanReviewLabel: "Son kontrol: Cem.",
  };

  const sampleFinding: VerifiedFinding = {
    findingId: "f-ml-guo-1",
    propositionId: "prop-ml-1",
    stance: "supports",
    summary: "Guo et al. (2017) modern sinir ağlarının kalibrasyonunun zayıf olduğunu gösterir.",
    citations: [
      {
        sourceId: "src-ml-guo-2017",
        url: "https://arxiv.org/abs/1706.04599v2",
        quote: "We discover that modern neural networks, unlike those from a decade ago, are poorly calibrated.",
        locator: "Abstract, arXiv v2 landing page",
      },
    ],
    verified: true,
  };

  let validRecord: CachedReviewRecord;

  beforeEach(() => {
    const corpusHash = computeClaimCorpusHash("claim-1");
    const base = {
      contractVersion: "1" as const,
      claimId: "claim-1" as ClaimId,
      mode: "quick" as ReviewMode,
      corpusHash,
      receipt: {
        ...sampleReceipt,
        resultHash: "computed-hash-placeholder",
      },
      verdict: "supported" as const,
      summary: "İnceleme tamamlandı: İddia eldeki kaynaklarca desteklenmektedir (1 doğrulanmış bulgu).",
      verifiedFindings: [sampleFinding],
      rejectedFindings: [],
      createdAt: "2026-09-11T10:30:00.000Z",
    };

    // Use proper editor resultHash
    base.receipt.resultHash = computeResultHash({
      claimId: base.claimId,
      mode: base.mode,
      verdict: base.verdict,
      sourceIds: base.receipt.sourceIds,
      verifiedFindingCount: base.verifiedFindings.length,
      rejectedFindingCount: base.rejectedFindings.length,
    });

    const checksum = computeRecordChecksum(base);
    validRecord = { ...base, checksum };
  });

  it("computes deterministic corpus hash for a valid claim", () => {
    const hash1 = computeClaimCorpusHash("claim-1");
    const hash2 = computeClaimCorpusHash("claim-1");
    expect(hash1).toBeDefined();
    expect(hash1.length).toBeGreaterThanOrEqual(16);
    expect(hash1).toBe(hash2);
  });

  it("generates canonical cache key with claimId, mode, and corpusHash", () => {
    const key = getCanonicalCacheKey("claim-1", "quick", "corpus-hash-123");
    expect(key).toBe("review:v1:claim-1:quick:corpus-hash-123");
  });

  it("validates an authentic and untampered cache record", () => {
    const result = validateCachedRecord(validRecord);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.record.claimId).toBe("claim-1");
      expect(result.record.receipt.humanReviewLabel).toBe("Son kontrol: Cem.");
    }
  });

  it("rejects a cache record with a tampered resultHash", () => {
    const tamperedRecord = {
      ...validRecord,
      receipt: {
        ...validRecord.receipt,
        resultHash: "0000000000000000000000000000000000000000000000000000000000000000",
      },
    };
    // Recompute checksum over the modified record to test that resultHash integrity check catches it
    tamperedRecord.checksum = computeRecordChecksum(tamperedRecord);

    const result = validateCachedRecord(tamperedRecord);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toMatch(/resultHash/i);
    }
  });

  it("rejects a cache record with a tampered payload checksum", () => {
    const tamperedRecord = {
      ...validRecord,
      summary: "Zararlı içerik sızdırıldı.",
      // Checksum is NOT updated
    };

    const result = validateCachedRecord(tamperedRecord);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toMatch(/checksum/i);
    }
  });

  it("rejects partial or incomplete cache records missing required fields", () => {
    const partialRecord = {
      claimId: "claim-1",
      mode: "quick",
      // missing receipt, checksum, verifiedFindings, etc.
    };

    const result = validateCachedRecord(partialRecord);
    expect(result.valid).toBe(false);
  });

  it("ReviewCache stores and retrieves verified results with canonical keys", async () => {
    const cache = new ReviewCache();
    const stored = await cache.set({
      claimId: validRecord.claimId,
      mode: validRecord.mode,
      receipt: validRecord.receipt,
      verdict: validRecord.verdict,
      summary: validRecord.summary,
      verifiedFindings: validRecord.verifiedFindings,
      rejectedFindings: validRecord.rejectedFindings,
    });

    expect(stored).toBe(true);

    const retrieved = await cache.get("claim-1", "quick");
    expect(retrieved).not.toBeNull();
    expect(retrieved?.claimId).toBe("claim-1");
    expect(retrieved?.receipt.resultHash).toBe(validRecord.receipt.resultHash);
  });

  it("ReviewCache rejects partial cache writes", async () => {
    const cache = new ReviewCache();
    const invalidInput = {
      claimId: "claim-1" as ClaimId,
      mode: "quick" as ReviewMode,
      receipt: { ...validRecord.receipt, resultHash: "corrupt" },
      verdict: validRecord.verdict,
      summary: validRecord.summary,
      verifiedFindings: validRecord.verifiedFindings,
      rejectedFindings: validRecord.rejectedFindings,
    };

    const stored = await cache.set(invalidInput);
    expect(stored).toBe(false);

    const retrieved = await cache.get("claim-1", "quick");
    expect(retrieved).toBeNull();
  });

  it("correctly attributes resultSource as cache or fallback_cache", async () => {
    const cache = new ReviewCache();
    await cache.set({
      claimId: validRecord.claimId,
      mode: validRecord.mode,
      receipt: validRecord.receipt,
      verdict: validRecord.verdict,
      summary: validRecord.summary,
      verifiedFindings: validRecord.verifiedFindings,
      rejectedFindings: validRecord.rejectedFindings,
    });

    const standardHit = await cache.get("claim-1", "quick", { asSource: "cache" });
    expect(standardHit?.receipt.resultSource).toBe("cache");

    const fallbackHit = await cache.get("claim-1", "quick", { asSource: "fallback_cache" });
    expect(fallbackHit?.receipt.resultSource).toBe("fallback_cache");
  });

  it("supports dependency-injected Upstash / Vercel KV REST client", async () => {
    const mockStore: Record<string, string> = {};
    const customStore = {
      async get(key: string) {
        return mockStore[key] ?? null;
      },
      async set(key: string, value: string) {
        mockStore[key] = value;
      },
    };

    const cache = new ReviewCache({ store: customStore });
    await cache.set({
      claimId: validRecord.claimId,
      mode: validRecord.mode,
      receipt: validRecord.receipt,
      verdict: validRecord.verdict,
      summary: validRecord.summary,
      verifiedFindings: validRecord.verifiedFindings,
      rejectedFindings: validRecord.rejectedFindings,
    });

    const keys = Object.keys(mockStore);
    expect(keys.length).toBe(1);
    expect(keys[0]).toMatch(/^review:v1:claim-1:quick:/);

    const retrieved = await cache.get("claim-1", "quick");
    expect(retrieved).not.toBeNull();
    expect(retrieved?.receipt.claimId).toBe("claim-1");
  });
});
