import { createHash } from "node:crypto";
import { getClaimById, normalizeCorpusText } from "./corpus";
import {
  type ClaimId,
  type Finding,
  type RejectedFinding,
  type ResultSource,
  type ReviewMode,
  type RunReceipt,
  type Verdict,
  type VerifiedFinding,
  parseRunReceipt,
} from "./contracts";

export interface ComputeVerdictParams {
  materialPropositionIds: readonly string[];
  verifiedFindings: readonly VerifiedFinding[];
}

export function computeVerdict(params: ComputeVerdictParams): Verdict {
  const { materialPropositionIds, verifiedFindings } = params;

  if (materialPropositionIds.length === 0) {
    return "insufficient_evidence";
  }

  const materialSet = new Set(materialPropositionIds);

  // 1. If any contradicted finding on a material proposition -> "revise"
  const hasContradiction = verifiedFindings.some(
    (f) => f.stance === "contradicts" && materialSet.has(f.propositionId),
  );
  if (hasContradiction) {
    return "revise";
  }

  // 2. Else if all material propositions have at least one verified supporting finding -> "supported"
  const supportedPropositions = new Set(
    verifiedFindings
      .filter((f) => f.stance === "supports" && materialSet.has(f.propositionId))
      .map((f) => f.propositionId),
  );

  const allSupported = materialPropositionIds.every((id) => supportedPropositions.has(id));
  if (allSupported) {
    return "supported";
  }

  // 3. Else -> "insufficient_evidence"
  return "insufficient_evidence";
}

export function getFindingQuoteFingerprint(finding: Finding): string {
  if (!finding.citations || finding.citations.length === 0) {
    return "";
  }
  const quotes = finding.citations
    .map((c) => normalizeCorpusText(c.quote ?? ""))
    .filter((q) => q.length > 0)
    .sort();
  return JSON.stringify(quotes);
}

export interface DeduplicateResult<T extends Finding = VerifiedFinding> {
  deduplicatedFindings: T[];
  duplicateFindingIds: string[];
}

export function deduplicateFindings<T extends Finding = VerifiedFinding>(
  findings: readonly T[],
): DeduplicateResult<T> {
  const seenKeys = new Set<string>();
  const deduplicatedFindings: T[] = [];
  const duplicateFindingIds: string[] = [];

  for (const finding of findings) {
    const quoteKey = getFindingQuoteFingerprint(finding);
    const key = `${finding.propositionId}::${finding.stance}::${quoteKey}`;
    if (seenKeys.has(key)) {
      duplicateFindingIds.push(finding.findingId);
    } else {
      seenKeys.add(key);
      deduplicatedFindings.push(finding);
    }
  }

  return { deduplicatedFindings, duplicateFindingIds };
}

export function collectSourceIds(findings: readonly Finding[]): string[] {
  const sourceIds = new Set<string>();
  for (const finding of findings) {
    for (const citation of finding.citations ?? []) {
      if (citation && citation.sourceId) {
        sourceIds.add(citation.sourceId);
      }
    }
  }
  return Array.from(sourceIds).sort().slice(0, 50);
}

export function collectRejectedFindingIds(
  inputRejected: readonly (RejectedFinding | string)[],
  duplicateFindingIds: readonly string[] = [],
): string[] {
  const ids = new Set<string>();
  for (const item of inputRejected) {
    if (typeof item === "string") {
      ids.add(item);
    } else if (item && typeof item.findingId === "string") {
      ids.add(item.findingId);
    }
  }
  for (const dupId of duplicateFindingIds) {
    ids.add(dupId);
  }
  return Array.from(ids).sort().slice(0, 50);
}

export interface ResultHashInput {
  claimId: ClaimId;
  mode: ReviewMode;
  verdict: Verdict;
  sourceIds: readonly string[];
  verifiedFindingCount: number;
  rejectedFindingCount: number;
}

export function computeResultHash(params: ResultHashInput): string {
  const canonicalSourceIds = Array.from(new Set(params.sourceIds ?? [])).sort().slice(0, 50);
  const canonicalObj = {
    claimId: params.claimId,
    mode: params.mode,
    verdict: params.verdict,
    sourceIds: canonicalSourceIds,
    verifiedFindingCount: params.verifiedFindingCount,
    rejectedFindingCount: params.rejectedFindingCount,
  };
  return createHash("sha256")
    .update(JSON.stringify(canonicalObj), "utf8")
    .digest("hex")
    .toLowerCase();
}

export function generateTurkishSummary(
  verdict: Verdict,
  verifiedFindingCount: number,
  rejectedFindingCount: number,
): string {
  const rejectedPart =
    rejectedFindingCount > 0
      ? `, ${rejectedFindingCount} elenen bulgu`
      : "";

  switch (verdict) {
    case "supported":
      return `İnceleme tamamlandı: İddia eldeki kaynaklarca desteklenmektedir (${verifiedFindingCount} doğrulanmış bulgu${rejectedPart}).`;
    case "revise":
      return `İnceleme tamamlandı: İddianın revize edilmesi gerekiyor. İncelenen kaynaklarda karşıt bulgu tespit edildi (${verifiedFindingCount} doğrulanmış bulgu${rejectedPart}).`;
    case "insufficient_evidence":
      return `İnceleme tamamlandı: Yayımlamak için yetersiz kanıt. Temel önermelerin tümü doğrulanmış kaynaklarla temellendirilemedi (${verifiedFindingCount} doğrulanmış bulgu${rejectedPart}).`;
  }
}

export interface CompileReviewParams {
  runId: string;
  claimId: ClaimId;
  mode: ReviewMode;
  durationMs: number;
  resultSource?: ResultSource;
  completedAt?: string;
  verifiedFindings: readonly VerifiedFinding[];
  rejectedFindings?: readonly (RejectedFinding | string)[];
  materialPropositionIds?: readonly string[];
}

export interface ReviewCompilationResult {
  verdict: Verdict;
  summary: string;
  receipt: RunReceipt;
  deduplicatedFindings: VerifiedFinding[];
  sourceIds: string[];
  rejectedFindingIds: string[];
}

export function compileReview(params: CompileReviewParams): ReviewCompilationResult {
  const { deduplicatedFindings, duplicateFindingIds } = deduplicateFindings(params.verifiedFindings);
  const rejectedFindingIds = collectRejectedFindingIds(
    params.rejectedFindings ?? [],
    duplicateFindingIds,
  );
  const sourceIds = collectSourceIds(deduplicatedFindings);

  let materialPropositionIds = params.materialPropositionIds;
  if (!materialPropositionIds || materialPropositionIds.length === 0) {
    const claim = getClaimById(params.claimId);
    materialPropositionIds = claim ? claim.propositions.map((p) => p.id) : [];
  }

  const verdict = computeVerdict({
    materialPropositionIds,
    verifiedFindings: deduplicatedFindings,
  });

  const summary = generateTurkishSummary(
    verdict,
    deduplicatedFindings.length,
    rejectedFindingIds.length,
  );

  const resultHash = computeResultHash({
    claimId: params.claimId,
    mode: params.mode,
    verdict,
    sourceIds,
    verifiedFindingCount: deduplicatedFindings.length,
    rejectedFindingCount: rejectedFindingIds.length,
  });

  const rawReceipt = {
    runId: params.runId,
    claimId: params.claimId,
    mode: params.mode,
    verdict,
    durationMs: params.durationMs,
    resultSource: params.resultSource ?? "live",
    sourceIds,
    rejectedFindingIds,
    resultHash,
    completedAt: params.completedAt ?? new Date().toISOString(),
    humanReviewLabel: "Son kontrol: Cem." as const,
  };

  const receipt = parseRunReceipt(rawReceipt);

  return {
    verdict,
    summary,
    receipt,
    deduplicatedFindings,
    sourceIds,
    rejectedFindingIds,
  };
}
