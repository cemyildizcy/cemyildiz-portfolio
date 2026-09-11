import type {
  ClaimId,
  PublicErrorCode,
  ReviewMode,
  RoleName,
  RoleOutput,
  Verdict,
} from "../../lib/review/contracts";

export interface GoldenScenario {
  id: string;
  name: string;
  description: string;
  claimId: ClaimId;
  mode: ReviewMode;
  mockOutputs?: Partial<Record<RoleName, RoleOutput>>;
  simulateRoleFailure?: boolean;
  expectedVerdict: Verdict | null;
  expectedStatus: "completed" | "failed";
  expectedErrorCode?: PublicErrorCode;
  expectedMinVerifiedFindings?: number;
  expectedMinRejectedFindings?: number;
}

const EMPTY_ROLES: Pick<Record<RoleName, RoleOutput>, "skeptic" | "verifier"> = {
  skeptic: { role: "skeptic", summary: "Ek bulgu yok.", findings: [] },
  verifier: { role: "verifier", summary: "Ek bulgu yok.", findings: [] },
};

const ANTHROPIC_CONTRADICTION = {
  findingId: "f-portfolio-overbroad-contradiction",
  propositionId: "prop-portfolio-2",
  stance: "contradicts" as const,
  summary: "Birçok uygulamada optimize edilmiş tek LLM çağrısı genellikle yeterlidir; çoklu çağrı evrensel üstünlük değildir.",
  citations: [
    {
      sourceId: "src-portfolio-anthropic-2024",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      quote: "For many applications, however, optimizing single LLM calls with retrieval and in-context examples is usually enough.",
      locator: "Section: When (and when not) to use agents",
    },
  ],
};

export const GOLDEN_SCENARIOS: readonly GoldenScenario[] = [
  {
    id: "golden-supported",
    name: "Desteklenen İnceleme (Supported)",
    description: "Tüm temel önermeler doğrulanmış kanıtlarla desteklenir.",
    claimId: "claim-2",
    mode: "quick",
    expectedVerdict: "supported",
    expectedStatus: "completed",
    expectedMinVerifiedFindings: 2,
    expectedMinRejectedFindings: 0,
  },
  {
    id: "golden-revise",
    name: "Düzeltme Gerektiren İnceleme (Revise)",
    description: "Portfolyo sorusuna nüanslı yanıt verir: rol ayrımı depoda doğrulanır, fakat çoklu çağrının her zaman üstün olduğu geniş önerme Anthropic'in uyarısıyla çelişir.",
    claimId: "claim-3",
    mode: "quick",
    mockOutputs: {
      researcher: {
        role: "researcher",
        summary: "İddianın evrensel kısmı daraltılmalıdır.",
        findings: [ANTHROPIC_CONTRADICTION],
      },
      ...EMPTY_ROLES,
    },
    expectedVerdict: "revise",
    expectedStatus: "completed",
    expectedMinVerifiedFindings: 1,
    expectedMinRejectedFindings: 0,
  },
  {
    id: "golden-insufficient",
    name: "Yetersiz Kanıt (Insufficient Evidence)",
    description: "Doğrulanmış bulgu olmadığında kesin karar verilmez.",
    claimId: "claim-1",
    mode: "quick",
    mockOutputs: {
      researcher: { role: "researcher", summary: "Kanıt yok.", findings: [] },
      skeptic: { role: "skeptic", summary: "Kanıt yok.", findings: [] },
      verifier: { role: "verifier", summary: "Kanıt yok.", findings: [] },
    },
    expectedVerdict: "insufficient_evidence",
    expectedStatus: "completed",
    expectedMinVerifiedFindings: 0,
    expectedMinRejectedFindings: 0,
  },
  {
    id: "golden-quote-mismatch",
    name: "Alıntı Uyuşmazlığı Reddi (Quote Mismatch)",
    description: "Külliyatta olmayan alıntı reddedilir.",
    claimId: "claim-1",
    mode: "quick",
    mockOutputs: {
      researcher: {
        role: "researcher",
        summary: "Uydurma alıntı.",
        findings: [
          {
            findingId: "f-res-mismatch-1",
            propositionId: "prop-ml-1",
            stance: "supports",
            summary: "Model uydurma alıntı sunuyor.",
            citations: [
              {
                sourceId: "src-ml-guo-2017",
                url: "https://arxiv.org/abs/1706.04599v2",
                quote: "Modern neural networks always predict perfectly.",
                locator: "Abstract, arXiv v2 landing page",
              },
            ],
          },
        ],
      },
      ...EMPTY_ROLES,
    },
    expectedVerdict: "insufficient_evidence",
    expectedStatus: "completed",
    expectedMinVerifiedFindings: 0,
    expectedMinRejectedFindings: 1,
  },
  {
    id: "golden-role-failure",
    name: "Rol Hatası ve Güvenli Durma (Role Failure)",
    description: "Gerçek orkestratör provider hatasını role_failed olayına eşler ve karar üretmez.",
    claimId: "claim-1",
    mode: "quick",
    simulateRoleFailure: true,
    expectedVerdict: null,
    expectedStatus: "failed",
    expectedErrorCode: "role_failed",
    expectedMinVerifiedFindings: 0,
    expectedMinRejectedFindings: 0,
  },
  {
    id: "golden-contradiction",
    name: "Çelişkili Bulgular (Contradiction)",
    description: "Balanced modda depo rol ayrımını desteklerken Anthropic evrensel çoklu çağrı önermesini sınırlar; sonuç şeffaf biçimde revise olur.",
    claimId: "claim-3",
    mode: "balanced",
    mockOutputs: {
      researcher: {
        role: "researcher",
        summary: "Depo, ayrıştırılmış rolleri uyguladığını gösterir.",
        findings: [
          {
            findingId: "f-portfolio-project-support",
            propositionId: "prop-portfolio-editor",
            stance: "supports",
            summary: "Commit'e sabitlenmiş uygulama deterministik editör derleme sürecini gösterir.",
            citations: [
              {
                sourceId: "src-portfolio-editor-8a69913",
                url: "https://github.com/cemyildizcy/cemyildiz-portfolio/blob/8a6991310633ec1f758c115ef361fd223edb2123/src/lib/review/editor.ts",
                quote: "const verdict = computeVerdict({\n    materialPropositionIds,\n    verifiedFindings: deduplicatedFindings,\n  });",
                locator: "src/lib/review/editor.ts, lines 199-219",
              },
            ],
          },
        ],
      },
      skeptic: {
        role: "skeptic",
        summary: "Evrensel üstünlük iddiası fazla geniştir.",
        findings: [ANTHROPIC_CONTRADICTION],
      },
      verifier: { role: "verifier", summary: "Her iki alıntının kapsamı denetlendi.", findings: [] },
    },
    expectedVerdict: "revise",
    expectedStatus: "completed",
    expectedMinVerifiedFindings: 2,
    expectedMinRejectedFindings: 0,
  },
];

export function getGoldenScenarioById(id: string): GoldenScenario | undefined {
  return GOLDEN_SCENARIOS.find((scenario) => scenario.id === id);
}
