import type {
  ClaimId,
  ReviewMode,
  RoleName,
  RoleOutput,
} from "./contracts";

export interface ProviderRoleRequest {
  claimId: ClaimId;
  mode: ReviewMode;
  role: RoleName;
  signal?: AbortSignal;
}

export interface ReviewModelProvider {
  executeRole(request: ProviderRoleRequest): Promise<RoleOutput>;
}

export interface FakeReviewProviderOptions {
  delayMs?: number;
  customOutputs?: Partial<Record<RoleName, RoleOutput>>;
}

export const DEFAULT_CLAIM_1_OUTPUTS: Record<RoleName, RoleOutput> = {
  researcher: {
    role: "researcher",
    summary:
      "Modern derin öğrenme modellerinde yüksek doğruluk oranına rağmen kalibrasyon eksikliği ve aşırı özgüven gözlenmektedir.",
    findings: [
      {
        findingId: "f-res-ml-1",
        propositionId: "prop-ml-1",
        stance: "supports",
        summary:
          "Modern sinir ağlarının zayıf kalibrasyonu, yüksek doğruluğun tek başına güvenilirliği kanıtlamadığını gösterir.",
        citations: [
          {
            sourceId: "src-ml-guo-2017",
            url: "https://arxiv.org/abs/1706.04599v2",
            quote:
              "We discover that modern neural networks, unlike those from a decade ago, are poorly calibrated.",
            locator: "Abstract, arXiv v2 landing page",
          },
        ],
      },
    ],
  },
  skeptic: {
    role: "skeptic",
    summary:
      "Tarihsel ağlara kıyasla modern sinir ağlarının kalibrasyon kalitesinde belirgin bir gerileme ve aşırı özgüven mevcuttur.",
    findings: [
      {
        findingId: "f-skep-ml-2",
        propositionId: "prop-ml-2",
        stance: "supports",
        summary:
          "Modern derin ağlar on yıl önceki ağlara göre daha zayıf kalibre edilmiştir.",
        citations: [
          {
            sourceId: "src-ml-guo-2017",
            url: "https://arxiv.org/abs/1706.04599v2",
            quote:
              "We discover that modern neural networks, unlike those from a decade ago, are poorly calibrated.",
            locator: "Abstract, arXiv v2 landing page",
          },
        ],
      },
    ],
  },
  verifier: {
    role: "verifier",
    summary:
      "Olasılıksal sınıflandırıcılarda çıktıların doğrudan güven seviyesi olarak yorumlanabilmesi için kalibrasyon şarttır.",
    findings: [
      {
        findingId: "f-ver-ml-3",
        propositionId: "prop-ml-3",
        stance: "supports",
        summary:
          "İyi kalibre edilmiş sınıflandırıcıda predict_proba değeri örneklerin gerçek pozitif sıklığını yansıtmalıdır.",
        citations: [
          {
            sourceId: "src-ml-scikit-calibration",
            url: "https://scikit-learn.org/1.7/modules/calibration.html",
            quote:
              "Well calibrated classifiers are probabilistic classifiers for which the output of the predict_proba method can be directly interpreted as a confidence level.",
            locator: "Section 1.16",
          },
        ],
      },
    ],
  },
};

export const DEFAULT_CLAIM_2_OUTPUTS: Record<RoleName, RoleOutput> = {
  researcher: {
    role: "researcher",
    summary:
      "Haber metinlerinde çerçeveleme, belirli problem tanımlarını ve nedensellikleri öne çıkararak algıyı şekillendirir.",
    findings: [
      {
        findingId: "f-res-gundem-1",
        propositionId: "prop-gundem-1",
        stance: "supports",
        summary:
          "Çerçeveleme, gerçekliğin belirli yönlerini seçip metinde daha belirgin kılarak nedensel yorumları teşvik eder.",
        citations: [
          {
            sourceId: "src-gundem-entman-1993",
            url: "https://doi.org/10.1111/j.1460-2466.1993.tb01304.x",
            quote:
              "To frame is to select some aspects of a perceived reality and make them more salient in a communicating text, in such a way as to promote a particular problem definition, causal interpretation, moral evaluation, and/or treatment recommendation for the item described.",
            locator: "p. 52",
          },
        ],
      },
    ],
  },
  skeptic: {
    role: "skeptic",
    summary:
      "Medya organının kurumsal türü ve habercilik çizgisi kullanılan çerçeve kalıplarını belirgin şekilde farklılaştırır.",
    findings: [
      {
        findingId: "f-skep-gundem-2",
        propositionId: "prop-gundem-2",
        stance: "supports",
        summary:
          "Ciddi basın organları sorumluluk ve çatışma çerçevelerini öne çıkarırken sansasyonel yayınlar insani ilgi boyutuna odaklanır.",
        citations: [
          {
            sourceId: "src-gundem-semetko-2000",
            url: "https://doi.org/10.1111/j.1460-2466.2000.tb02843.x",
            quote:
              "The use of news frames depended on both the type of outlet and the type of topic. Most significant differences were not between media (television vs. the press) but between sensationalist vs. serious types of news outlets. Sober and serious newspapers and television news programs more often used the responsibility and conflict frames in the presentation of news, whereas sensationalist outlets more often used the human interest frame.",
            locator: "Abstract, p. 93",
          },
        ],
      },
    ],
  },
  verifier: {
    role: "verifier",
    summary:
      "Farklı yayın organlarının aynı olayı farklı çerçevelerle sunması kuramsal ve ampirik olarak doğrulanmıştır.",
    findings: [],
  },
};

export const DEFAULT_CLAIM_3_OUTPUTS: Record<RoleName, RoleOutput> = {
  researcher: {
    role: "researcher",
    summary: "Depodaki tasarım belgesi bağımsız araştırma, şüphecilik ve doğrulama rollerini açıkça tanımlar.",
    findings: [
      {
        findingId: "f-res-portfolio-1",
        propositionId: "prop-portfolio-editor",
        stance: "supports",
        summary: "Editoryal derleme, yalnızca doğrulanmış bulguları deterministik doğruluk tablosu ve özet kurallarıyla birleştirir.",
        citations: [
          {
            sourceId: "src-portfolio-editor-8a69913",
            url: "https://github.com/cemyildizcy/cemyildiz-portfolio/blob/8a6991310633ec1f758c115ef361fd223edb2123/src/lib/review/editor.ts",
            quote: "const verdict = computeVerdict({\n    materialPropositionIds,\n    verifiedFindings: deduplicatedFindings,\n  });",
            locator: "src/lib/review/editor.ts, lines 199-219",
          },
        ],
      },
      {
        findingId: "f-res-portfolio-human-control",
        propositionId: "prop-portfolio-human-control",
        stance: "supports",
        summary: "Tamamlanan sonuçlar, son kontrol sorumluluğunu Cem'e atayan sabit “Son kontrol: Cem.” etiketini gösterir.",
        citations: [
          {
            sourceId: "src-portfolio-design-8a69913",
            url: "https://github.com/cemyildizcy/cemyildiz-portfolio/blob/8a6991310633ec1f758c115ef361fd223edb2123/docs/superpowers/specs/2026-09-11-ai-review-desk-design.md",
            quote: "Every completed result includes sources, rejected findings, run ID, duration, live/cache status, and the fixed label **“Son kontrol: Cem.”**",
            locator: "§2 Visible roles and Verdicts",
          },
        ],
      },
    ],
  },
  skeptic: {
    role: "skeptic",
    summary: "Çoklu çağrıların her durumda üstün olduğu iddiası Anthropic'in basitlik uyarısıyla çelişir.",
    findings: [
      {
        findingId: "f-skep-portfolio-2",
        propositionId: "prop-portfolio-2",
        stance: "contradicts",
        summary: "Birçok uygulamada retrieval ve bağlam içi örneklerle iyileştirilmiş tek çağrı genellikle yeterlidir.",
        citations: [
          {
            sourceId: "src-portfolio-anthropic-2024",
            url: "https://www.anthropic.com/engineering/building-effective-agents",
            quote: "For many applications, however, optimizing single LLM calls with retrieval and in-context examples is usually enough.",
            locator: "Section: When (and when not) to use agents",
          },
        ],
      },
    ],
  },
  verifier: {
    role: "verifier",
    summary: "Commit'e sabitlenmiş uygulama üç rolü Promise.all ile çalıştırdığını gösterir; bu yalnızca uygulama yapısını doğrular.",
    findings: [
      {
        findingId: "f-ver-portfolio-roles",
        propositionId: "prop-portfolio-roles",
        stance: "supports",
        summary: "Orkestratör araştırmacı, kuşkucu ve doğrulayıcı rollerini ayrı ayrı çalıştırır.",
        citations: [
          {
            sourceId: "src-portfolio-run-8a69913",
            url: "https://github.com/cemyildizcy/cemyildiz-portfolio/blob/8a6991310633ec1f758c115ef361fd223edb2123/src/lib/review/run.ts",
            quote: "const roles: RoleName[] = [\"researcher\", \"skeptic\", \"verifier\"];",
            locator: "src/lib/review/run.ts, lines 110-124; lines 186-194",
          },
        ],
      },
    ],
  },
};

export class FakeReviewProvider implements ReviewModelProvider {
  private readonly delayMs: number;
  private readonly customOutputs: Partial<Record<RoleName, RoleOutput>>;

  constructor(options: FakeReviewProviderOptions = {}) {
    this.delayMs = options.delayMs ?? 0;
    this.customOutputs = options.customOutputs ?? {};
  }

  public async executeRole(request: ProviderRoleRequest): Promise<RoleOutput> {
    if (request.signal?.aborted) {
      throw request.signal.reason || new DOMException("Aborted", "AbortError");
    }

    if (this.delayMs > 0) {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          if (request.signal) {
            request.signal.removeEventListener("abort", onAbort);
          }
          resolve();
        }, this.delayMs);

        const onAbort = () => {
          clearTimeout(timer);
          reject(request.signal?.reason || new DOMException("Aborted", "AbortError"));
        };

        if (request.signal) {
          request.signal.addEventListener("abort", onAbort, { once: true });
        }
      });
    }

    if (this.customOutputs[request.role]) {
      return this.customOutputs[request.role]!;
    }

    if (request.claimId === "claim-1") {
      return DEFAULT_CLAIM_1_OUTPUTS[request.role];
    }
    if (request.claimId === "claim-2") {
      return DEFAULT_CLAIM_2_OUTPUTS[request.role];
    }
    if (request.claimId === "claim-3") {
      return DEFAULT_CLAIM_3_OUTPUTS[request.role];
    }

    return {
      role: request.role,
      summary: `Rol ${request.role} tamamlandı (${request.claimId}).`,
      findings: [],
    };
  }
}
