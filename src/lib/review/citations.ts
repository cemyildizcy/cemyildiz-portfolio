import { getClaimById, normalizeCorpusText, type ClaimRecord, type CorpusSource } from "./corpus";
import {
  type ClaimId,
  type Finding,
  type RejectedFinding,
  type RoleName,
  type SourceCitation,
  type VerifiedFinding,
} from "./contracts";

export class DraftClaimError extends Error {
  constructor(public readonly claimId: string) {
    super(`Claim "${claimId}" is in draft status and unexecutable by CitationVerifier`);
    this.name = "DraftClaimError";
  }
}

export class UnknownClaimError extends Error {
  constructor(public readonly claimId: string) {
    super(`Claim "${claimId}" is unknown in the review corpus`);
    this.name = "UnknownClaimError";
  }
}

const PRIVATE_OR_LOCAL_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "169.254.169.254",
  "0.0.0.0",
]);

function isUnsafeHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (PRIVATE_OR_LOCAL_HOSTNAMES.has(host)) return true;
  if (host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    return true;
  }
  const parts = host.split(".");
  if (parts.length === 4 && parts.every((p) => /^\d+$/.test(p))) {
    const [p0, p1] = parts.map(Number);
    if (p0 === 10) return true;
    if (p0 === 127) return true;
    if (p0 === 169 && p1 === 254) return true;
    if (p0 === 172 && p1 >= 16 && p1 <= 31) return true;
    if (p0 === 192 && p1 === 168) return true;
    if (p0 === 0) return true;
  }
  return !host.includes(".");
}

function verifyCitationUrl(urlStr: string, registeredSource: CorpusSource): boolean {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") return false;
  if (parsed.username || parsed.password) return false;
  if (parsed.port !== "" && parsed.port !== "443") return false;
  if (isUnsafeHost(parsed.hostname)) return false;

  // Must match the registered source URL
  let registeredParsed: URL;
  try {
    registeredParsed = new URL(registeredSource.url);
  } catch {
    return false;
  }

  if (parsed.origin !== registeredParsed.origin) return false;
  if (parsed.pathname !== registeredParsed.pathname) return false;

  return true;
}

function parsePageRange(text: string): { minPage?: number; maxPage?: number } {
  const matchRange = text.match(/pp?\.?\s*(\d+)\s*(?:-|–|to)\s*(\d+)/i);
  if (matchRange) {
    return {
      minPage: Number.parseInt(matchRange[1], 10),
      maxPage: Number.parseInt(matchRange[2], 10),
    };
  }

  const matchSingle = text.match(/pp?\.?\s*(\d+)/i);
  if (matchSingle) {
    const page = Number.parseInt(matchSingle[1], 10);
    return { minPage: page, maxPage: page };
  }

  return {};
}

function verifyLocator(citationLocator: string, source: CorpusSource): boolean {
  const citLocTrimmed = citationLocator.trim();
  if (citLocTrimmed.length === 0) return false;

  const citPages = parsePageRange(citLocTrimmed);

  // Check against explicit locatorBounds on source
  if (source.locatorBounds) {
    const { minPage, maxPage, section } = source.locatorBounds;

    if (citPages.minPage !== undefined) {
      if (minPage !== undefined && citPages.minPage < minPage) return false;
      if (maxPage !== undefined && citPages.minPage > maxPage) return false;
    }
    if (citPages.maxPage !== undefined) {
      if (maxPage !== undefined && citPages.maxPage > maxPage) return false;
      if (minPage !== undefined && citPages.maxPage < minPage) return false;
    }

    if (section !== undefined) {
      const sectionMatch = citLocTrimmed.match(/section\s*([0-9a-z.]+)/i);
      if (sectionMatch) {
        const expectedSectionMatch = section.match(/section\s*([0-9a-z.]+)/i);
        const citSec = sectionMatch[1].toLowerCase();
        const expectedSec = expectedSectionMatch ? expectedSectionMatch[1].toLowerCase() : section.toLowerCase();
        if (citSec !== expectedSec) return false;
      }
    }
  }

  // Also check against page numbers in source.locator string if locatorBounds were not set
  if (!source.locatorBounds || (source.locatorBounds.minPage === undefined && source.locatorBounds.maxPage === undefined)) {
    const srcPages = parsePageRange(source.locator);
    if (srcPages.minPage !== undefined && citPages.minPage !== undefined) {
      if (citPages.minPage < srcPages.minPage) return false;
      if (srcPages.maxPage !== undefined && citPages.minPage > srcPages.maxPage) return false;
    }
    if (srcPages.maxPage !== undefined && citPages.maxPage !== undefined) {
      if (citPages.maxPage > srcPages.maxPage) return false;
    }
  }

  return true;
}

const SAFE_REJECTION_SUMMARY = "Sağlayıcı bulgusu güvenli doğrulama kurallarını geçemedi.";

export class CitationVerifier {
  private readonly seenFindingIds = new Set<string>();
  private readonly seenFingerprints = new Set<string>();

  constructor(
    private readonly claimLookup: (claimId: ClaimId) => ClaimRecord | undefined = getClaimById,
  ) {}

  public reset(): void {
    this.seenFindingIds.clear();
    this.seenFingerprints.clear();
  }

  public verifyFinding(
    claimId: ClaimId,
    finding: Finding,
    role: RoleName = "researcher",
  ): VerifiedFinding | RejectedFinding {
    const claim = this.claimLookup(claimId);
    if (!claim) {
      throw new UnknownClaimError(claimId);
    }

    if (claim.reviewStatus === "draft") {
      throw new DraftClaimError(claimId);
    }

    // Check oversized fields
    if (finding.summary.length > 500) {
      return {
        findingId: finding.findingId,
        propositionId: finding.propositionId,
        role,
        summary: SAFE_REJECTION_SUMMARY,
        code: "oversized_field",
      };
    }

    for (const citation of finding.citations) {
      if (citation.quote.length > 2000 || citation.locator.length > 200) {
        return {
          findingId: finding.findingId,
          propositionId: finding.propositionId,
          role,
          summary: SAFE_REJECTION_SUMMARY,
          code: "oversized_field",
        };
      }
    }

    // Check duplicate findings
    const fingerprint = `${finding.propositionId}:${finding.stance}:${finding.citations
      .map((c) => `${c.sourceId}:${normalizeCorpusText(c.quote)}`)
      .join("|")}`;

    if (this.seenFindingIds.has(finding.findingId) || this.seenFingerprints.has(fingerprint)) {
      return {
        findingId: finding.findingId,
        propositionId: finding.propositionId,
        role,
        summary: SAFE_REJECTION_SUMMARY,
        code: "duplicate_finding",
      };
    }

    // Check unsupported proposition
    const knownProposition = claim.propositions.some((p) => p.id === finding.propositionId);
    if (!knownProposition) {
      return {
        findingId: finding.findingId,
        propositionId: finding.propositionId,
        role,
        summary: SAFE_REJECTION_SUMMARY,
        code: "unsupported_component",
      };
    }

    // Check citations
    if (finding.citations.length === 0) {
      return {
        findingId: finding.findingId,
        propositionId: finding.propositionId,
        role,
        summary: SAFE_REJECTION_SUMMARY,
        code: "missing_quote",
      };
    }

    for (const citation of finding.citations) {
      const rejection = this.verifyCitation(claim, citation, finding, role);
      if (rejection) {
        return rejection;
      }
    }

    const reviewedSummaries = finding.citations.map((citation) => {
      const source = claim.sources.find((candidate) => candidate.id === citation.sourceId)!;
      const normalizedQuote = normalizeCorpusText(citation.quote);
      return source.semanticMappings.find(
        (mapping) =>
          mapping.propositionId === finding.propositionId &&
          mapping.allowedStances.includes(finding.stance) &&
          normalizeCorpusText(mapping.quote) === normalizedQuote,
      )!.displaySummary;
    });

    // Record as seen
    this.seenFindingIds.add(finding.findingId);
    this.seenFingerprints.add(fingerprint);

    return {
      ...finding,
      summary: Array.from(new Set(reviewedSummaries)).join(" "),
      verified: true,
    };
  }

  public verifyFindings(
    claimId: ClaimId,
    findings: Finding[],
    role: RoleName = "researcher",
  ): { verified: VerifiedFinding[]; rejected: RejectedFinding[] } {
    const claim = this.claimLookup(claimId);
    if (!claim) {
      throw new UnknownClaimError(claimId);
    }
    if (claim.reviewStatus === "draft") {
      throw new DraftClaimError(claimId);
    }

    const verified: VerifiedFinding[] = [];
    const rejected: RejectedFinding[] = [];

    for (const finding of findings) {
      const result = this.verifyFinding(claimId, finding, role);
      if ("verified" in result && result.verified === true) {
        verified.push(result);
      } else {
        rejected.push(result as RejectedFinding);
      }
    }

    return { verified, rejected };
  }

  private verifyCitation(
    claim: ClaimRecord,
    citation: SourceCitation,
    finding: Finding,
    role: RoleName,
  ): RejectedFinding | null {
    // 1. Known source check
    const source = claim.sources.find((s) => s.id === citation.sourceId);
    if (!source) {
      return {
        findingId: finding.findingId,
        propositionId: finding.propositionId,
        role,
        summary: SAFE_REJECTION_SUMMARY,
        code: "unknown_source",
      };
    }

    // 2. Empty / missing quote check
    const trimmedQuote = citation.quote.trim();
    if (trimmedQuote.length === 0) {
      return {
        findingId: finding.findingId,
        propositionId: finding.propositionId,
        role,
        summary: SAFE_REJECTION_SUMMARY,
        code: "missing_quote",
      };
    }

    // 3. Safe URL and source URL match check
    if (!verifyCitationUrl(citation.url, source)) {
      return {
        findingId: finding.findingId,
        propositionId: finding.propositionId,
        role,
        summary: SAFE_REJECTION_SUMMARY,
        code: "unsafe_url",
      };
    }

    // 4. Locator bounds check
    if (!verifyLocator(citation.locator, source)) {
      return {
        findingId: finding.findingId,
        propositionId: finding.propositionId,
        role,
        summary: SAFE_REJECTION_SUMMARY,
        code: "locator_mismatch",
      };
    }

    // 5. Normalized verbatim quote match check
    const normalizedQuote = normalizeCorpusText(citation.quote);
    const normalizedExcerpt = normalizeCorpusText(source.excerpt);

    if (!normalizedExcerpt.includes(normalizedQuote)) {
      return {
        findingId: finding.findingId,
        propositionId: finding.propositionId,
        role,
        summary: SAFE_REJECTION_SUMMARY,
        code: "quote_mismatch",
      };
    }

    // 6. Reviewed semantic binding: quote, proposition, and stance must agree.
    const semanticMatch = source.semanticMappings.some(
      (mapping) =>
        mapping.propositionId === finding.propositionId &&
        mapping.allowedStances.includes(finding.stance) &&
        normalizeCorpusText(mapping.quote) === normalizedQuote,
    );
    if (!semanticMatch) {
      return {
        findingId: finding.findingId,
        propositionId: finding.propositionId,
        role,
        summary: SAFE_REJECTION_SUMMARY,
        code: "semantic_mismatch",
      };
    }

    return null;
  }
}
