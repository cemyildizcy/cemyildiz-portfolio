import { createHash } from "node:crypto";
import { CLAIMS, type ClaimRecord, type CorpusSource } from "../../data/review-desk/claims";
import type { ClaimId } from "./contracts";

export { CLAIMS, type ClaimRecord, type CorpusSource };

export function normalizeCorpusText(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/\r\n/g, "\n")
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export function computeExcerptChecksum(excerpt: string): string {
  const normalized = normalizeCorpusText(excerpt);
  return createHash("sha256").update(normalized, "utf8").digest("hex").toLowerCase();
}

export function getAllClaims(): readonly ClaimRecord[] {
  return CLAIMS;
}

export function getClaimById(claimId: ClaimId): ClaimRecord | undefined {
  return CLAIMS.find((c) => c.id === claimId);
}

export function getCorpusForClaim(claimId: ClaimId): readonly CorpusSource[] {
  const claim = getClaimById(claimId);
  return claim ? claim.sources : [];
}

export function getCorpusSource(claimId: ClaimId, sourceId: string): CorpusSource | undefined {
  const claim = getClaimById(claimId);
  if (!claim) return undefined;
  return claim.sources.find((s) => s.id === sourceId);
}

export function verifyCorpusIntegrity(claimRecord?: ClaimRecord): {
  valid: boolean;
  errors: string[];
} {
  const claimsToCheck = claimRecord ? [claimRecord] : CLAIMS;
  const errors: string[] = [];

  for (const claim of claimsToCheck) {
    for (const source of claim.sources) {
      const computed = computeExcerptChecksum(source.excerpt);
      if (computed !== source.checksum.toLowerCase()) {
        errors.push(
          `Checksum mismatch for source "${source.id}" in claim "${claim.id}": expected ${source.checksum}, computed ${computed}`,
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
