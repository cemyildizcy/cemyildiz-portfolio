import type { ClaimId } from "../../lib/review/contracts";

export type ReviewStatus = "draft" | "approved";

export interface AtomicProposition {
  id: string;
  statement: string;
  description?: string;
}

export interface LocatorBounds {
  minPage?: number;
  maxPage?: number;
  section?: string;
}

export interface CorpusSource {
  id: string;
  url: string;
  title: string;
  publisher: string;
  publishedDate?: string;
  retrievedDate?: string;
  locator: string;
  locatorBounds?: LocatorBounds;
  excerpt: string;
  checksum: string;
  licenseNote?: string;
}

export interface ClaimRecord {
  id: ClaimId;
  title: string;
  statement: string;
  topic: string;
  reviewStatus: ReviewStatus;
  propositions: AtomicProposition[];
  sources: CorpusSource[];
}

export const CLAIMS: readonly ClaimRecord[] = [
  {
    id: "claim-1",
    title: "Model Doğruluğu ve Güvenilirlik",
    statement: "Yüksek doğruluk (accuracy), modelin güvenilir olduğunu kanıtlar mı?",
    topic: "ml",
    reviewStatus: "approved",
    propositions: [
      {
        id: "prop-ml-1",
        statement: "Yüksek sınıflandırma doğruluğu tek başına bir modelin gerçek dünya dağılımlarında güvenilir veya kalibre olduğunu kanıtlamaz.",
        description: "Doğruluk metriği sınıf dengesizliği veya aşırı özgüven durumlarında aldatıcı olabilir.",
      },
      {
        id: "prop-ml-2",
        statement: "Modern derin öğrenme modelleri yüksek doğruluğa ulaşırken aşırı özgüvenli ve kalibrasyonsuz olasılıklar üretebilir.",
        description: "Büyük kapasiteli modeller eğitim hatasını sıfırlarken tahmin güvenlerini orantısız yükseltir.",
      },
      {
        id: "prop-ml-3",
        statement: "Olasılık temelli karar sistemlerinde Brier skoru ve güvenilirlik eğrileri gibi kalibrasyon ölçümleri zorunludur.",
        description: "predict_proba çıktısının gerçek frekansları yansıtması için kalibrasyon doğrulaması gerekir.",
      },
    ],
    sources: [
      {
        id: "src-ml-guo-2017",
        url: "https://arxiv.org/abs/1706.04599",
        title: "On Calibration of Modern Neural Networks",
        publisher: "arXiv / International Conference on Machine Learning (ICML 2017)",
        publishedDate: "2017-06-14",
        retrievedDate: "2026-09-11",
        locator: "Abstract, p. 1",
        locatorBounds: {
          minPage: 1,
          maxPage: 10,
          section: "Abstract",
        },
        excerpt:
          "Confidence calibration—the problem of predicting probability estimates representative of the true correctness likelihood—is important for classification systems in practical applications. In reality, a network may make a misclassification with 99% confidence. We observe that modern neural networks, unlike those from a decade ago, are poorly calibrated.",
        checksum: "971d15a824b8221db169779d9b6ed1b794a95db7f902088cabe48e9b9fbf832b",
        licenseNote: "Open access arXiv preprint (Guo, Pleiss, Sun, Weinberger)",
      },
      {
        id: "src-ml-scikit-calibration",
        url: "https://scikit-learn.org/stable/modules/calibration.html",
        title: "Probability calibration",
        publisher: "scikit-learn developers",
        publishedDate: "2024-01-01",
        retrievedDate: "2026-09-11",
        locator: "Section 1.16",
        locatorBounds: {
          section: "Section 1.16",
        },
        excerpt:
          "Well calibrated classifiers are probabilistic classifiers for which the output of the predict_proba method can be directly interpreted as a confidence level. For instance, a well calibrated (binary) classifier should classify the samples such that among the samples to which it gave a predict_proba value close to 0.8, approximately 80% actually belong to the positive class.",
        checksum: "52f902f35a5ccad64d208fe08bd87052f7c7f38e1f88bd5888e8839e004040e6",
        licenseNote: "BSD-3-Clause",
      },
    ],
  },
  {
    id: "claim-2",
    title: "GündemAI Çok Kaynaklı Habercilik",
    statement: "Farklı kaynaklar aynı olayı aynı şekilde mi anlatır?",
    topic: "gundem-ai",
    reviewStatus: "draft",
    propositions: [
      {
        id: "prop-gundem-1",
        statement: "Farklı haber kaynakları aynı olayı farklı editoryal çerçeveleme ve vurgularla sunar.",
      },
    ],
    sources: [],
  },
  {
    id: "claim-3",
    title: "Portfolyo AI Üretimi ve Denetimi",
    statement: "Bu projeyi yapay zekâ sadece üretti mi, yoksa eleştirip doğruladı mı?",
    topic: "portfolio",
    reviewStatus: "draft",
    propositions: [
      {
        id: "prop-portfolio-1",
        statement: "Portfolyo yapay zekâyı tek yazar yapmak yerine araştırma, eleştiri ve doğrulama aşamalarını insana raporlayan bir ortak olarak konumlandırır.",
      },
    ],
    sources: [],
  },
];
