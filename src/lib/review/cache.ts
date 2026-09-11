import { createHash } from "node:crypto";
import {
  CONTRACT_VERSION,
  parseRejectedFinding,
  parseRunReceipt,
  parseVerifiedFinding,
  type ClaimId,
  type RejectedFinding,
  type ResultSource,
  type ReviewMode,
  type RunReceipt,
  type Verdict,
  type VerifiedFinding,
} from "./contracts";
import { getClaimById } from "./corpus";
import { computeResultHash } from "./editor";

export interface CachedReviewRecord {
  contractVersion: typeof CONTRACT_VERSION;
  claimId: ClaimId;
  mode: ReviewMode;
  corpusHash: string;
  receipt: RunReceipt;
  verdict: Verdict;
  summary: string;
  verifiedFindings: VerifiedFinding[];
  rejectedFindings: RejectedFinding[];
  createdAt: string;
  checksum: string;
}

export interface ReviewCacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del?(key: string): Promise<void>;
}

export function computeClaimCorpusHash(claimId: ClaimId): string {
  const claim = getClaimById(claimId);
  if (!claim) return "";

  const canonicalObj = {
    claimId: claim.id,
    statement: claim.statement,
    propositions: claim.propositions.map((p) => ({ id: p.id, statement: p.statement })),
    sources: claim.sources
      .map((s) => ({ id: s.id, checksum: s.checksum }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  };

  return createHash("sha256")
    .update(JSON.stringify(canonicalObj), "utf8")
    .digest("hex")
    .toLowerCase();
}

export function getCanonicalCacheKey(
  claimId: ClaimId,
  mode: ReviewMode,
  corpusHash: string,
): string {
  return `review:v1:${claimId}:${mode}:${corpusHash}`;
}

export function computeRecordChecksum(
  data: Omit<CachedReviewRecord, "checksum"> | Record<string, unknown>,
): string {
  const record = data as Record<string, unknown>;
  const canonicalObj = {
    contractVersion: record.contractVersion ?? CONTRACT_VERSION,
    claimId: record.claimId,
    mode: record.mode,
    corpusHash: record.corpusHash,
    verdict: record.verdict,
    summary: record.summary,
    receipt: record.receipt,
    verifiedFindings: record.verifiedFindings,
    rejectedFindings: record.rejectedFindings,
    createdAt: record.createdAt,
  };

  return createHash("sha256")
    .update(JSON.stringify(canonicalObj), "utf8")
    .digest("hex")
    .toLowerCase();
}

export type CacheValidationResult =
  | { valid: true; record: CachedReviewRecord }
  | { valid: false; reason: string };

export function validateCachedRecord(input: unknown): CacheValidationResult {
  if (typeof input !== "object" || input === null) {
    return { valid: false, reason: "Record must be an object" };
  }

  const raw = input as Record<string, unknown>;

  // Check required fields
  if (
    !raw.claimId ||
    !raw.mode ||
    !raw.corpusHash ||
    !raw.receipt ||
    !raw.verdict ||
    !raw.summary ||
    !raw.verifiedFindings ||
    !raw.rejectedFindings ||
    !raw.createdAt ||
    !raw.checksum
  ) {
    return { valid: false, reason: "Missing required fields in cache record" };
  }

  if (raw.contractVersion !== CONTRACT_VERSION) {
    return { valid: false, reason: `Unsupported contract version: ${raw.contractVersion}` };
  }

  // 1. Validate receipt schema
  let receipt: RunReceipt;
  try {
    receipt = parseRunReceipt(raw.receipt);
  } catch (err) {
    return { valid: false, reason: `Invalid receipt schema: ${err}` };
  }

  // 2. Validate findings
  let verifiedFindings: VerifiedFinding[];
  let rejectedFindings: RejectedFinding[];
  try {
    if (!Array.isArray(raw.verifiedFindings) || !Array.isArray(raw.rejectedFindings)) {
      return { valid: false, reason: "Findings must be arrays" };
    }
    verifiedFindings = raw.verifiedFindings.map((f, i) => parseVerifiedFinding(f, `$verified[${i}]`));
    rejectedFindings = raw.rejectedFindings.map((f, i) => parseRejectedFinding(f, `$rejected[${i}]`));
  } catch (err) {
    return { valid: false, reason: `Invalid finding schema: ${err}` };
  }

  // 3. Validate resultHash
  const computedHash = computeResultHash({
    claimId: raw.claimId as ClaimId,
    mode: raw.mode as ReviewMode,
    verdict: raw.verdict as Verdict,
    sourceIds: receipt.sourceIds,
    verifiedFindingCount: verifiedFindings.length,
    rejectedFindingCount: rejectedFindings.length,
  });

  if (computedHash.toLowerCase() !== receipt.resultHash.toLowerCase()) {
    return {
      valid: false,
      reason: `resultHash mismatch (expected ${computedHash}, got ${receipt.resultHash})`,
    };
  }

  // 4. Validate checksum
  const expectedChecksum = computeRecordChecksum(raw);
  if (typeof raw.checksum !== "string" || raw.checksum.toLowerCase() !== expectedChecksum.toLowerCase()) {
    return {
      valid: false,
      reason: `checksum mismatch (expected ${expectedChecksum}, got ${raw.checksum})`,
    };
  }

  const record: CachedReviewRecord = {
    contractVersion: CONTRACT_VERSION,
    claimId: raw.claimId as ClaimId,
    mode: raw.mode as ReviewMode,
    corpusHash: raw.corpusHash as string,
    receipt,
    verdict: raw.verdict as Verdict,
    summary: raw.summary as string,
    verifiedFindings,
    rejectedFindings,
    createdAt: raw.createdAt as string,
    checksum: raw.checksum as string,
  };

  return { valid: true, record };
}

export class InMemoryCacheStore implements ReviewCacheStore {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

export interface UpstashCacheConfig {
  url: string;
  token: string;
  fetchFn?: typeof fetch;
}

export class UpstashRestCacheStore implements ReviewCacheStore {
  private url: string;
  private token: string;
  private fetchFn: typeof fetch;

  constructor(config: UpstashCacheConfig) {
    this.url = config.url.replace(/\/$/, "");
    this.token = config.token;
    this.fetchFn = config.fetchFn ?? fetch;
  }

  async get(key: string): Promise<string | null> {
    const res = await this.fetchFn(`${this.url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result: string | null };
    return data.result ?? null;
  }

  async set(key: string, value: string, ttlSeconds = 86400): Promise<void> {
    const res = await this.fetchFn(
      `${this.url}/set/${encodeURIComponent(key)}?ex=${ttlSeconds}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(value),
      },
    );
    if (!res.ok) {
      throw new Error(`Upstash cache set failed with status ${res.status}`);
    }
  }

  async del(key: string): Promise<void> {
    await this.fetchFn(`${this.url}/del/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}` },
    });
  }
}

export interface ReviewCacheOptions {
  store?: ReviewCacheStore;
  ttlSeconds?: number;
}

export interface CacheSetInput {
  claimId: ClaimId;
  mode: ReviewMode;
  receipt: RunReceipt;
  verdict: Verdict;
  summary: string;
  verifiedFindings: VerifiedFinding[];
  rejectedFindings?: RejectedFinding[];
  createdAt?: string;
}

export class ReviewCache {
  private store: ReviewCacheStore;
  private ttlSeconds: number;

  constructor(options: ReviewCacheOptions = {}) {
    this.ttlSeconds = options.ttlSeconds ?? 86400;

    if (options.store) {
      this.store = options.store;
    } else {
      const restUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
      const restToken = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
      if (restUrl && restToken) {
        this.store = new UpstashRestCacheStore({
          url: restUrl,
          token: restToken,
        });
      } else {
        this.store = new InMemoryCacheStore();
      }
    }
  }

  async get(
    claimId: ClaimId,
    mode: ReviewMode,
    options?: { asSource?: ResultSource },
  ): Promise<CachedReviewRecord | null> {
    const corpusHash = computeClaimCorpusHash(claimId);
    if (!corpusHash) return null;

    const key = getCanonicalCacheKey(claimId, mode, corpusHash);
    let rawStr: string | null;
    try {
      rawStr = await this.store.get(key);
    } catch {
      return null;
    }

    if (!rawStr) return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawStr);
    } catch {
      return null;
    }

    const validation = validateCachedRecord(parsed);
    if (!validation.valid) {
      return null;
    }

    const record = validation.record;
    if (options?.asSource) {
      record.receipt = {
        ...record.receipt,
        resultSource: options.asSource,
      };
    }

    return record;
  }

  async set(input: CacheSetInput): Promise<boolean> {
    const corpusHash = computeClaimCorpusHash(input.claimId);
    if (!corpusHash) return false;

    // Verify resultHash integrity before writing to cache
    const computedHash = computeResultHash({
      claimId: input.claimId,
      mode: input.mode,
      verdict: input.verdict,
      sourceIds: input.receipt.sourceIds,
      verifiedFindingCount: input.verifiedFindings.length,
      rejectedFindingCount: (input.rejectedFindings ?? []).length,
    });

    if (computedHash.toLowerCase() !== input.receipt.resultHash.toLowerCase()) {
      // Inconsistent resultHash; refuse partial/invalid write
      return false;
    }

    const baseRecord = {
      contractVersion: CONTRACT_VERSION,
      claimId: input.claimId,
      mode: input.mode,
      corpusHash,
      receipt: input.receipt,
      verdict: input.verdict,
      summary: input.summary,
      verifiedFindings: input.verifiedFindings,
      rejectedFindings: input.rejectedFindings ?? [],
      createdAt: input.createdAt ?? new Date().toISOString(),
    };

    const checksum = computeRecordChecksum(baseRecord);
    const fullRecord: CachedReviewRecord = {
      ...baseRecord,
      checksum,
    };

    // Final schema and integrity validation
    const check = validateCachedRecord(fullRecord);
    if (!check.valid) {
      return false;
    }

    const key = getCanonicalCacheKey(input.claimId, input.mode, corpusHash);
    try {
      await this.store.set(key, JSON.stringify(fullRecord), this.ttlSeconds);
      return true;
    } catch {
      return false;
    }
  }
}

export const defaultReviewCache = new ReviewCache();
