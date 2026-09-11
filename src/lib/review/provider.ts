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

const DEFAULT_CLAIM_1_OUTPUTS: Record<RoleName, RoleOutput> = {
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
          "Modern ağlar yüzde 99 güvenle yanlış sınıflandırma yapabilmekte, doğruluk güvenilirlik garantisi sunmamaktadır.",
        citations: [
          {
            sourceId: "src-ml-guo-2017",
            url: "https://arxiv.org/abs/1706.04599",
            quote:
              "In reality, a network may make a misclassification with 99% confidence.",
            locator: "Abstract, p. 1",
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
            url: "https://arxiv.org/abs/1706.04599",
            quote:
              "We observe that modern neural networks, unlike those from a decade ago, are poorly calibrated.",
            locator: "Abstract, p. 1",
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
            url: "https://scikit-learn.org/stable/modules/calibration.html",
            quote:
              "Well calibrated classifiers are probabilistic classifiers for which the output of the predict_proba method can be directly interpreted as a confidence level.",
            locator: "Section 1.16",
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

    return {
      role: request.role,
      summary: `Rol ${request.role} tamamlandı (${request.claimId}).`,
      findings: [],
    };
  }
}
