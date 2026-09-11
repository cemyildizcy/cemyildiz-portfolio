import { describe, expect, it } from "vitest";
import { FakeReviewProvider, type ReviewModelProvider } from "./provider";
import {
  GOLDEN_SCENARIOS,
  getGoldenScenarioById,
  type GoldenScenario,
} from "../../data/review-desk/golden-cases";
import {
  generateEvalMarkdownReport,
  runAllGoldenScenarios,
  runGoldenScenario,
  verifyCitationGrounding,
} from "./evals";

describe("AI Review Desk - Golden Evaluation Gate", () => {
  it("defines exactly six versioned golden scenarios covering all required categories", () => {
    expect(GOLDEN_SCENARIOS.length).toBe(6);

    const ids = GOLDEN_SCENARIOS.map((s) => s.id);
    expect(ids).toContain("golden-supported");
    expect(ids).toContain("golden-revise");
    expect(ids).toContain("golden-insufficient");
    expect(ids).toContain("golden-quote-mismatch");
    expect(ids).toContain("golden-role-failure");
    expect(ids).toContain("golden-contradiction");
  });

  it("Scenario 1: 'supported' passes with 100% citation grounding and supported verdict", async () => {
    const scenario = getGoldenScenarioById("golden-supported");
    expect(scenario).toBeDefined();

    const result = await runGoldenScenario(scenario!);
    expect(result.passed, JSON.stringify(result, null, 2)).toBe(true);
    expect(result.verdict).toBe("supported");
    expect(result.status).toBe("completed");
    expect(result.citationGroundingRate).toBe(1.0);
    expect(result.unsupportedDefinitiveVerdict).toBe(false);
    expect(result.verifiedFindingsCount).toBeGreaterThanOrEqual(1);
    expect(result.rejectedFindingsCount).toBe(0);
  });

  it("Scenario 2: 'revise' passes with 100% citation grounding and revise verdict", async () => {
    const scenario = getGoldenScenarioById("golden-revise");
    expect(scenario).toBeDefined();

    const result = await runGoldenScenario(scenario!);
    expect(result.passed, JSON.stringify(result, null, 2)).toBe(true);
    expect(result.verdict).toBe("revise");
    expect(result.status).toBe("completed");
    expect(result.citationGroundingRate).toBe(1.0);
    expect(result.unsupportedDefinitiveVerdict).toBe(false);
  });

  it("Scenario 3: 'insufficient' passes with insufficient_evidence verdict and zero unsupported definitive verdicts", async () => {
    const scenario = getGoldenScenarioById("golden-insufficient");
    expect(scenario).toBeDefined();

    const result = await runGoldenScenario(scenario!);
    expect(result.passed).toBe(true);
    expect(result.verdict).toBe("insufficient_evidence");
    expect(result.status).toBe("completed");
    expect(result.unsupportedDefinitiveVerdict).toBe(false);
  });

  it("Scenario 4: 'quote_mismatch' rejects hallucinated citation and does not emit unsupported definitive verdict", async () => {
    const scenario = getGoldenScenarioById("golden-quote-mismatch");
    expect(scenario).toBeDefined();

    const result = await runGoldenScenario(scenario!);
    expect(result.passed).toBe(true);
    expect(result.rejectedFindingsCount).toBeGreaterThanOrEqual(1);
    expect(result.verdict).toBe("insufficient_evidence");
    expect(result.citationGroundingRate).toBe(1.0);
    expect(result.unsupportedDefinitiveVerdict).toBe(false);
  });

  it("Scenario 5: 'role_failure' fails safely, withholds definitive verdict and reports error", async () => {
    const scenario = getGoldenScenarioById("golden-role-failure");
    expect(scenario).toBeDefined();

    const result = await runGoldenScenario(scenario!);
    expect(result.passed).toBe(true);
    expect(result.status).toBe("failed");
    expect(result.errorCode).toBe("role_failed");
    expect(result.verdict).toBeNull();
    expect(result.unsupportedDefinitiveVerdict).toBe(false);
  });

  it("Scenario 6: 'contradiction' passes with revise verdict upon finding conflicting evidence", async () => {
    const scenario = getGoldenScenarioById("golden-contradiction");
    expect(scenario).toBeDefined();

    const result = await runGoldenScenario(scenario!);
    expect(result.passed, JSON.stringify(result, null, 2)).toBe(true);
    expect(result.verdict).toBe("revise");
    expect(result.status).toBe("completed");
    expect(result.citationGroundingRate).toBe(1.0);
    expect(result.unsupportedDefinitiveVerdict).toBe(false);
  });

  it("includes at least one balanced-mode golden scenario", () => {
    expect(GOLDEN_SCENARIOS.some((scenario) => scenario.mode === "balanced")).toBe(true);
  });

  it("role-failure passes only when the injected provider actually throws through the orchestrator", async () => {
    const scenario = getGoldenScenarioById("golden-role-failure")!;
    let calls = 0;
    const nonThrowingProvider: ReviewModelProvider = {
      async executeRole({ role }) {
        calls += 1;
        return { role, summary: "completed", findings: [] };
      },
    };

    const result = await runGoldenScenario(scenario, { provider: nonThrowingProvider });
    expect(calls).toBeGreaterThan(0);
    expect(result.passed).toBe(false);
    expect(result.status).toBe("completed");
  });

  it("aggregates grounded and total displayed citations rather than averaging scenario rates", async () => {
    const oneGrounded = getGoldenScenarioById("golden-revise")!;
    const noCitations = getGoldenScenarioById("golden-insufficient")!;
    const suite = await runAllGoldenScenarios([oneGrounded, noCitations]);

    expect(suite.totalDisplayedCitations).toBe(1);
    expect(suite.totalGroundedCitations).toBe(1);
    expect(suite.overallGroundingRate).toBe(1);
  });

  it("runs the full golden evaluation suite and verifies 100% grounding and 0 unsupported definitive verdicts", async () => {
    const suite = await runAllGoldenScenarios();

    expect(suite.total).toBe(6);
    expect(suite.passed).toBe(6);
    expect(suite.failed).toBe(0);
    expect(suite.overallGroundingRate).toBe(1.0);
    expect(suite.unsupportedDefinitiveCount).toBe(0);
    expect(suite.results).toHaveLength(6);
  });

  it("reports deterministic harness success while leaving the real-model gate blocked", async () => {
    const suite = await runAllGoldenScenarios();
    const markdown = generateEvalMarkdownReport(suite);

    expect(markdown).toContain("# AI Review Desk - Golden Evaluation Report");
    expect(markdown).toContain("BLOCKED / PREVIEW ONLY");
    expect(markdown).toContain("deterministic harness verification");
    expect(markdown).toContain("candidate quick and balanced models");
    expect(markdown).not.toContain("Gate Cleared");
    expect(markdown).not.toContain("scikit-learn 2024");
    expect(markdown).not.toContain("2 peer-reviewed sources (Guo et al. ICML 2017, scikit-learn");
    expect(markdown).toContain("golden-role-failure");
  });

  it("evaluates Claim 2 (GündemAI) default provider outputs with 100% grounding and supported verdict", async () => {
    const claim2Scenario: GoldenScenario = {
      id: "claim-2-default-eval",
      name: "Claim 2 Default Evaluation",
      description: "GündemAI haber dili analizi varsayılan kanıt değerlendirmesi",
      claimId: "claim-2",
      mode: "quick",
      expectedVerdict: "supported",
      expectedStatus: "completed",
      expectedMinVerifiedFindings: 2,
      expectedMinRejectedFindings: 0,
    };

    const result = await runGoldenScenario(claim2Scenario);
    expect(result.passed, JSON.stringify(result, null, 2)).toBe(true);
    expect(result.verdict).toBe("supported");
    expect(result.citationGroundingRate).toBe(1.0);
    expect(result.unsupportedDefinitiveVerdict).toBe(false);
    expect(result.verifiedFindingsCount).toBeGreaterThanOrEqual(2);
  });

  it("one partial Claim 3 source cannot support all atomic propositions", async () => {
    const partialScenario: GoldenScenario = {
      id: "claim-3-partial-atomic-eval",
      name: "Claim 3 Partial Atomic Evaluation",
      description: "Yalnızca rol ayrımı kanıtı diğer atomik önermeleri destekleyemez.",
      claimId: "claim-3",
      mode: "balanced",
      expectedVerdict: "insufficient_evidence",
      expectedStatus: "completed",
      expectedMinVerifiedFindings: 1,
      expectedMinRejectedFindings: 0,
      mockOutputs: {
        researcher: { role: "researcher", summary: "ignored", findings: [] },
        skeptic: { role: "skeptic", summary: "ignored", findings: [] },
        verifier: {
          role: "verifier",
          summary: "ignored",
          findings: [{
            findingId: "f-partial-role-only",
            propositionId: "prop-portfolio-roles",
            stance: "supports",
            summary: "overbroad provider summary",
            citations: [{
              sourceId: "src-portfolio-run-8a69913",
              url: "https://github.com/cemyildizcy/cemyildiz-portfolio/blob/8a6991310633ec1f758c115ef361fd223edb2123/src/lib/review/run.ts",
              quote: "const roles: RoleName[] = [\"researcher\", \"skeptic\", \"verifier\"];",
              locator: "src/lib/review/run.ts, lines 110-124",
            }],
          }],
        },
      },
    };

    const result = await runGoldenScenario(partialScenario);
    expect(result.passed, JSON.stringify(result, null, 2)).toBe(true);
    expect(result.verdict).toBe("insufficient_evidence");
    expect(result.verifiedFindingsCount).toBe(1);
  });

  it("evaluates Claim 3 default evidence as a nuanced revise verdict", async () => {
    const claim3Scenario: GoldenScenario = {
      id: "claim-3-default-eval",
      name: "Claim 3 Default Evaluation",
      description: "Portfolyo rol ayrımını doğrular ve evrensel çoklu çağrı iddiasını sınırlar",
      claimId: "claim-3",
      mode: "balanced",
      expectedVerdict: "revise",
      expectedStatus: "completed",
      expectedMinVerifiedFindings: 3,
      expectedMinRejectedFindings: 0,
    };

    const result = await runGoldenScenario(claim3Scenario);
    expect(result.passed, JSON.stringify(result, null, 2)).toBe(true);
    expect(result.verdict).toBe("revise");
    expect(result.citationGroundingRate).toBe(1.0);
    expect(result.unsupportedDefinitiveVerdict).toBe(false);
    expect(result.verifiedFindingsCount).toBeGreaterThanOrEqual(4);

    const provider = new FakeReviewProvider();
    const researcherOutput = await provider.executeRole({ claimId: "claim-3", mode: "balanced", role: "researcher" });
    const editorFinding = researcherOutput.findings.find((f) => f.propositionId === "prop-portfolio-editor");
    expect(editorFinding).toBeDefined();
    expect(editorFinding?.citations[0].sourceId).toBe("src-portfolio-editor-8a69913");
    expect(editorFinding?.summary).toBe("Editoryal derleme, yalnızca doğrulanmış bulguları deterministik doğruluk tablosu ve özet kurallarıyla birleştirir.");

    const humanFinding = researcherOutput.findings.find((f) => f.propositionId === "prop-portfolio-human-control");
    expect(humanFinding).toBeDefined();
    expect(humanFinding?.summary).toBe("Tamamlanan sonuçlar, son kontrol sorumluluğunu Cem'e atayan sabit “Son kontrol: Cem.” etiketini gösterir.");
  });

  it("evaluates citation grounding helper directly", () => {
    const groundedResult = verifyCitationGrounding(
      [
        {
          findingId: "f-1",
          propositionId: "prop-ml-1",
          stance: "supports",
          summary: "Properly grounded",
          verified: true,
          citations: [
            {
              sourceId: "src-ml-guo-2017",
              url: "https://arxiv.org/abs/1706.04599v2",
              quote: "We discover that modern neural networks, unlike those from a decade ago, are poorly calibrated.",
              locator: "Abstract, arXiv v2 landing page",
            },
          ],
        },
      ],
      "claim-1",
    );

    expect(groundedResult.total).toBe(1);
    expect(groundedResult.grounded).toBe(1);
    expect(groundedResult.rate).toBe(1.0);

    const ungroundedResult = verifyCitationGrounding(
      [
        {
          findingId: "f-bad",
          propositionId: "prop-ml-1",
          stance: "supports",
          summary: "Fabricated quote",
          verified: true,
          citations: [
            {
              sourceId: "src-ml-guo-2017",
              url: "https://arxiv.org/abs/1706.04599v2",
              quote: "completely fabricated quote not in the paper",
              locator: "Abstract, arXiv v2 landing page",
            },
          ],
        },
      ],
      "claim-1",
    );

    expect(ungroundedResult.grounded).toBe(0);
    expect(ungroundedResult.rate).toBe(0);
  });
});
