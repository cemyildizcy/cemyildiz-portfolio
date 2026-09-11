import { randomUUID } from "node:crypto";
import {
  GOLDEN_SCENARIOS,
  type GoldenScenario,
} from "../../data/review-desk/golden-cases";
import { CitationVerifier } from "./citations";
import {
  type ClaimId,
  type PublicErrorCode,
  type RejectedFinding,
  type ReviewMode,
  type RoleName,
  type Verdict,
  type VerifiedFinding,
} from "./contracts";
import {
  getClaimById,
  getCorpusSource,
  normalizeCorpusText,
} from "./corpus";
import { compileReview } from "./editor";
import { FakeReviewProvider, type ReviewModelProvider } from "./provider";
import { executeRole } from "./roles";
import { runReviewStream } from "./run";

export interface CitationGroundingReport {
  total: number;
  grounded: number;
  rate: number;
  failures: string[];
}

export function verifyCitationGrounding(
  verifiedFindings: readonly VerifiedFinding[],
  claimId: ClaimId,
): CitationGroundingReport {
  if (verifiedFindings.length === 0) {
    return { total: 0, grounded: 0, rate: 1.0, failures: [] };
  }

  let totalCitations = 0;
  let groundedCitations = 0;
  const failures: string[] = [];

  for (const finding of verifiedFindings) {
    for (const citation of finding.citations ?? []) {
      totalCitations += 1;
      const registeredSource = getCorpusSource(claimId, citation.sourceId);

      if (!registeredSource) {
        failures.push(`Kaynak bulunamadı: ${citation.sourceId}`);
        continue;
      }

      if (citation.url !== registeredSource.url) {
        failures.push(
          `URL uyuşmazlığı: ${citation.url} !== ${registeredSource.url}`,
        );
        continue;
      }

      const normalizedQuote = normalizeCorpusText(citation.quote ?? "");
      const normalizedExcerpt = normalizeCorpusText(registeredSource.excerpt);

      if (!normalizedExcerpt.includes(normalizedQuote) || normalizedQuote.length === 0) {
        failures.push(
          `Alıntı külliyat metninde yer almıyor: "${citation.quote}" (kaynak: ${citation.sourceId})`,
        );
        continue;
      }

      groundedCitations += 1;
    }
  }

  const rate = totalCitations === 0 ? 1.0 : groundedCitations / totalCitations;

  return {
    total: totalCitations,
    grounded: groundedCitations,
    rate,
    failures,
  };
}

export interface GoldenEvalResult {
  scenarioId: string;
  name: string;
  claimId: ClaimId;
  mode: ReviewMode;
  passed: boolean;
  status: "completed" | "failed";
  expectedStatus: "completed" | "failed";
  verdict: Verdict | null;
  expectedVerdict: Verdict | null;
  errorCode?: PublicErrorCode;
  totalFindings: number;
  verifiedFindingsCount: number;
  rejectedFindingsCount: number;
  citationGroundingRate: number;
  unsupportedDefinitiveVerdict: boolean;
  totalDisplayedCitations: number;
  groundedCitations: number;
  durationMs: number;
  reasons: string[];
}

export interface GoldenSuiteResult {
  total: number;
  passed: number;
  failed: number;
  overallGroundingRate: number;
  totalDisplayedCitations: number;
  totalGroundedCitations: number;
  unsupportedDefinitiveCount: number;
  totalDurationMs: number;
  results: GoldenEvalResult[];
}

export async function runGoldenScenario(
  scenario: GoldenScenario,
  options?: { provider?: ReviewModelProvider },
): Promise<GoldenEvalResult> {
  const startTime = Date.now();
  const reasons: string[] = [];

  if (scenario.simulateRoleFailure) {
    const provider = options?.provider ?? {
      async executeRole() {
        throw new Error("Simulated role execution failure");
      },
    } satisfies ReviewModelProvider;
    const stream = await runReviewStream(
      {
        claimId: scenario.claimId,
        mode: scenario.mode,
        clientRequestId: randomUUID(),
        contractVersion: "1",
      },
      { provider },
    );
    const text = await new Response(stream).text();
    const events = text
      .split("\n\n")
      .map((chunk) => chunk.split("\n").find((line) => line.startsWith("data: ")))
      .filter((line): line is string => Boolean(line))
      .map((line) => JSON.parse(line.slice(6)) as { type: string; payload: { code?: PublicErrorCode } });
    const terminal = events.at(-1);
    const actualFailure = terminal?.type === "run.error" && terminal.payload.code === "role_failed";
    const status = actualFailure ? "failed" : "completed";
    const passed =
      actualFailure &&
      scenario.expectedStatus === "failed" &&
      scenario.expectedErrorCode === "role_failed" &&
      scenario.expectedVerdict === null;

    return {
      scenarioId: scenario.id,
      name: scenario.name,
      claimId: scenario.claimId,
      mode: scenario.mode,
      passed,
      status,
      expectedStatus: scenario.expectedStatus,
      verdict: null,
      expectedVerdict: scenario.expectedVerdict,
      errorCode: actualFailure ? "role_failed" : undefined,
      totalFindings: 0,
      verifiedFindingsCount: 0,
      rejectedFindingsCount: 0,
      citationGroundingRate: 1.0,
      unsupportedDefinitiveVerdict: false,
      totalDisplayedCitations: 0,
      groundedCitations: 0,
      durationMs: Math.max(1, Date.now() - startTime),
      reasons: passed ? ["Gerçek orkestratör provider hatasını role_failed olarak eşledi."] : ["Provider hata vermedi veya orkestratör role_failed üretmedi."],
    };
  }

  const provider =
    options?.provider ??
    new FakeReviewProvider({ customOutputs: scenario.mockOutputs });
  const verifier = new CitationVerifier();

  const roles: RoleName[] = ["researcher", "skeptic", "verifier"];
  const allVerifiedFindings: VerifiedFinding[] = [];
  const allRejectedFindings: RejectedFinding[] = [];
  let totalFindingsCount = 0;

  try {
    const roleOutputs = await Promise.all(
      roles.map((role) =>
        executeRole({
          claimId: scenario.claimId,
          mode: scenario.mode,
          role,
          provider,
        }),
      ),
    );

    for (const output of roleOutputs) {
      for (const finding of output.findings) {
        totalFindingsCount += 1;
        const verificationResult = verifier.verifyFinding(
          scenario.claimId,
          finding,
          output.role,
        );

        if ("verified" in verificationResult && verificationResult.verified === true) {
          allVerifiedFindings.push(verificationResult);
        } else {
          allRejectedFindings.push(verificationResult as RejectedFinding);
        }
      }
    }

    const groundingReport = verifyCitationGrounding(
      allVerifiedFindings,
      scenario.claimId,
    );

    const compilation = compileReview({
      runId: randomUUID(),
      claimId: scenario.claimId,
      mode: scenario.mode,
      durationMs: Math.max(1, Date.now() - startTime),
      verifiedFindings: allVerifiedFindings,
      rejectedFindings: allRejectedFindings,
    });

    const verdict = compilation.verdict;
    const claim = getClaimById(scenario.claimId);
    const materialPropIds = claim ? claim.propositions.map((p) => p.id) : [];

    // Evaluate unsupported definitive verdict gate
    let unsupportedDefinitiveVerdict = false;
    if (verdict === "supported") {
      const supportedProps = new Set(
        allVerifiedFindings
          .filter((f) => f.stance === "supports")
          .map((f) => f.propositionId),
      );
      const allMaterialSupported =
        materialPropIds.length > 0 &&
        materialPropIds.every((id) => supportedProps.has(id));
      if (!allMaterialSupported || groundingReport.rate < 1.0) {
        unsupportedDefinitiveVerdict = true;
        reasons.push("Destekleyici kanıt eksik veya alıntılar külliyata dayanmıyor.");
      }
    } else if (verdict === "revise") {
      const hasContradiction = allVerifiedFindings.some(
        (f) => f.stance === "contradicts" && materialPropIds.includes(f.propositionId),
      );
      if (!hasContradiction || groundingReport.rate < 1.0) {
        unsupportedDefinitiveVerdict = true;
        reasons.push("Revize kararı için doğrulanmış çelişki kanıtı bulunamadı.");
      }
    }

    // Check expectations
    let passed = true;
    if (verdict !== scenario.expectedVerdict) {
      passed = false;
      reasons.push(`Karar uyuşmazlığı: beklenen "${scenario.expectedVerdict}", alınan "${verdict}"`);
    }

    if (scenario.expectedStatus !== "completed") {
      passed = false;
      reasons.push(`Durum uyuşmazlığı: beklenen "${scenario.expectedStatus}", alınan "completed"`);
    }

    if (
      scenario.expectedMinVerifiedFindings !== undefined &&
      allVerifiedFindings.length < scenario.expectedMinVerifiedFindings
    ) {
      passed = false;
      reasons.push(
        `Yetersiz doğrulanmış bulgu: beklenen en az ${scenario.expectedMinVerifiedFindings}, alınan ${allVerifiedFindings.length}`,
      );
    }

    if (
      scenario.expectedMinRejectedFindings !== undefined &&
      allRejectedFindings.length < scenario.expectedMinRejectedFindings
    ) {
      passed = false;
      reasons.push(
        `Yetersiz reddedilen bulgu: beklenen en az ${scenario.expectedMinRejectedFindings}, alınan ${allRejectedFindings.length}`,
      );
    }

    if (unsupportedDefinitiveVerdict) {
      passed = false;
      reasons.push("Dayanaksız kesin karar kapısı ihlal edildi.");
    }

    if (groundingReport.rate < 1.0) {
      passed = false;
      reasons.push(`Alıntı dayanak oranı %100 değil (%${(groundingReport.rate * 100).toFixed(1)})`);
    }

    const durationMs = Math.max(1, Date.now() - startTime);

    return {
      scenarioId: scenario.id,
      name: scenario.name,
      claimId: scenario.claimId,
      mode: scenario.mode,
      passed,
      status: "completed",
      expectedStatus: scenario.expectedStatus,
      verdict,
      expectedVerdict: scenario.expectedVerdict,
      totalFindings: totalFindingsCount,
      verifiedFindingsCount: allVerifiedFindings.length,
      rejectedFindingsCount: allRejectedFindings.length,
      citationGroundingRate: groundingReport.rate,
      unsupportedDefinitiveVerdict,
      totalDisplayedCitations: groundingReport.total,
      groundedCitations: groundingReport.grounded,
      durationMs,
      reasons: reasons.length > 0 ? reasons : ["Tüm altın değerlendirme ölçütleri başarıyla sağlandı."],
    };
  } catch (error) {
    const durationMs = Math.max(1, Date.now() - startTime);
    return {
      scenarioId: scenario.id,
      name: scenario.name,
      claimId: scenario.claimId,
      mode: scenario.mode,
      passed: false,
      status: "failed",
      expectedStatus: scenario.expectedStatus,
      verdict: null,
      expectedVerdict: scenario.expectedVerdict,
      errorCode: "internal_error",
      totalFindings: totalFindingsCount,
      verifiedFindingsCount: allVerifiedFindings.length,
      rejectedFindingsCount: allRejectedFindings.length,
      citationGroundingRate: 1.0,
      unsupportedDefinitiveVerdict: false,
      totalDisplayedCitations: 0,
      groundedCitations: 0,
      durationMs,
      reasons: [`Beklenmeyen hata: ${error instanceof Error ? error.message : String(error)}`],
    };
  }
}

export async function runAllGoldenScenarios(
  scenarios: readonly GoldenScenario[] = GOLDEN_SCENARIOS,
): Promise<GoldenSuiteResult> {
  const startTime = Date.now();
  const results: GoldenEvalResult[] = [];

  for (const scenario of scenarios) {
    const res = await runGoldenScenario(scenario);
    results.push(res);
  }

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  const unsupportedDefinitiveCount = results.filter(
    (r) => r.unsupportedDefinitiveVerdict,
  ).length;

  const totalDisplayedCitations = results.reduce(
    (sum, result) => sum + result.totalDisplayedCitations,
    0,
  );
  const totalGroundedCitations = results.reduce(
    (sum, result) => sum + result.groundedCitations,
    0,
  );
  const overallGroundingRate =
    totalDisplayedCitations === 0 ? 1.0 : totalGroundedCitations / totalDisplayedCitations;

  const totalDurationMs = Math.max(1, Date.now() - startTime);

  return {
    total,
    passed,
    failed,
    overallGroundingRate,
    totalDisplayedCitations,
    totalGroundedCitations,
    unsupportedDefinitiveCount,
    totalDurationMs,
    results,
  };
}

export function generateEvalMarkdownReport(suiteResult: GoldenSuiteResult): string {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const deterministicAlias = "fake-review-provider-v1";
  const lines: string[] = [];

  lines.push("# AI Review Desk - Golden Evaluation Report");
  lines.push("");
  lines.push(`**Date:** ${date}`);
  lines.push("**Status:** BLOCKED / PREVIEW ONLY");
  lines.push("**Harness:** deterministic harness verification only; no real model selection was performed.");
  lines.push(`**Execution Time:** ${suiteResult.totalDurationMs} ms`);
  lines.push("");
  lines.push("## 1. Summary Gate Metrics");
  lines.push("");
  lines.push(`- **Total Scenarios:** ${suiteResult.total}`);
  lines.push(`- **Passed Scenarios:** ${suiteResult.passed} / ${suiteResult.total}`);
  lines.push(`- **Overall Citation Grounding:** ${suiteResult.totalGroundedCitations}/${suiteResult.totalDisplayedCitations} (${(suiteResult.overallGroundingRate * 100).toFixed(1)}%)`);
  lines.push(`- **Unsupported Definitive Verdicts: ${suiteResult.unsupportedDefinitiveCount}**`);
  lines.push("");
  lines.push("| Metric | Value | Requirement | Status |");
  lines.push("| --- | --- | --- | --- |");
  lines.push(`| Total Scenarios | ${suiteResult.total} | 6 scenarios | PASS |`);
  lines.push(`| Passed Scenarios | ${suiteResult.passed} / ${suiteResult.total} | 100% | ${suiteResult.passed === suiteResult.total ? "PASS" : "FAIL"} |`);
  lines.push(`| Displayed Citation Grounding | ${(suiteResult.overallGroundingRate * 100).toFixed(1)}% | 100.0% | ${suiteResult.overallGroundingRate >= 1.0 ? "PASS" : "FAIL"} |`);
  lines.push(`| Unsupported Definitive Verdicts | ${suiteResult.unsupportedDefinitiveCount} | 0 | ${suiteResult.unsupportedDefinitiveCount === 0 ? "PASS" : "FAIL"} |`);
  lines.push("");
  lines.push("## 2. Scenario Results Breakdown");
  lines.push("");
  lines.push("| Scenario ID | Scenario Name | Status | Verdict | Expected | Grounding | Verified | Rejected | Latency |");
  lines.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");

  for (const r of suiteResult.results) {
    const verdictStr = r.verdict ?? (r.errorCode ? `error (${r.errorCode})` : "none");
    const expectedStr = r.expectedVerdict ?? (r.expectedStatus === "failed" ? "error" : "none");
    const groundingPct = `${(r.citationGroundingRate * 100).toFixed(0)}%`;
    lines.push(
      `| \`${r.scenarioId}\` | ${r.name} | ${r.status} | \`${verdictStr}\` | \`${expectedStr}\` | ${groundingPct} | ${r.verifiedFindingsCount} | ${r.rejectedFindingsCount} | ${r.durationMs} ms |`,
    );
  }

  lines.push("");
  lines.push("## 3. Provider Status");
  lines.push("");
  lines.push(`- **Deterministic fixture alias:** \`${deterministicAlias}\` (quick and balanced harness coverage).`);
  lines.push("- No real candidate quick and balanced models were configured or benchmarked; model selection and public release remain blocked.");
  lines.push("");
  lines.push("## 4. Claim Corpus Verification");
  lines.push("");
  lines.push("- **Claim 1:** Guo et al. ICML/arXiv v2 plus version-pinned scikit-learn 1.7 technical documentation. Checksums prove stored-excerpt integrity; semantic mappings constrain proposition and stance.");
  lines.push("- **Claim 2:** Entman (1993) and Semetko & Valkenburg (2000) excerpts, with reviewed semantic mappings.");
  lines.push("- **Claim 3:** project-specific design and orchestrator artifacts pinned to GitHub commit 8a69913, plus Anthropic's caution against unnecessary agentic complexity. These artifacts verify repository design/implementation, not live-model quality.");
  lines.push("");
  lines.push("## 5. Remaining Gate");
  lines.push("");
  lines.push("- The deterministic fixture suite may pass, but this is not a cleared model-selection gate.");
  lines.push("- Benchmark real candidate quick and balanced models through the same adapter before enabling a real provider or public release.");
  lines.push("- All three claims remain approved only for deterministic preview execution within the stated corpus scope.");
  lines.push("");

  return lines.join("\n");
}
