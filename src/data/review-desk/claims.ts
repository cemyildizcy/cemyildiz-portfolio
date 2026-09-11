import type { ClaimId, FindingStance } from "../../lib/review/contracts";

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

export interface SemanticEvidenceMapping {
  propositionId: string;
  quote: string;
  allowedStances: readonly FindingStance[];
  displaySummary: string;
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
  semanticMappings: readonly SemanticEvidenceMapping[];
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
        statement: "Yüksek sınıflandırma doğruluğu tek başına bir modelin güvenilir veya kalibre olduğunu kanıtlamaz.",
      },
      {
        id: "prop-ml-2",
        statement: "Modern sinir ağları zayıf kalibre edilmiş olasılıklar üretebilir.",
      },
      {
        id: "prop-ml-3",
        statement: "İyi kalibre edilmiş bir sınıflandırıcının predict_proba çıktısı güven seviyesi olarak yorumlanabilir.",
        description: "Kaynak, Brier skoru veya güvenilirlik eğrisini her sistem için zorunlu kılmaz.",
      },
    ],
    sources: [
      {
        id: "src-ml-guo-2017",
        url: "https://arxiv.org/abs/1706.04599v2",
        title: "On Calibration of Modern Neural Networks",
        publisher: "arXiv / International Conference on Machine Learning (ICML 2017)",
        publishedDate: "2017-08-03",
        retrievedDate: "2026-09-12",
        locator: "Abstract, arXiv v2 landing page",
        locatorBounds: { minPage: 1, maxPage: 1, section: "Abstract" },
        excerpt: "Confidence calibration -- the problem of predicting probability estimates representative of the true correctness likelihood -- is important for classification models in many applications. We discover that modern neural networks, unlike those from a decade ago, are poorly calibrated. Through extensive experiments, we observe that depth, width, weight decay, and Batch Normalization are important factors influencing calibration.",
        checksum: "66659a8ea584d2547166e3b7cb3c6da6a597284d4efdbcb1b1011b6c9245d87f",
        semanticMappings: [
          {
            propositionId: "prop-ml-1",
            quote: "We discover that modern neural networks, unlike those from a decade ago, are poorly calibrated.",
            allowedStances: ["supports"],
            displaySummary: "Modern sinir ağlarının zayıf kalibre edilebilmesi, doğruluğun tek başına güvenilirlik kanıtı olmadığını gösterir.",
          },
          {
            propositionId: "prop-ml-2",
            quote: "We discover that modern neural networks, unlike those from a decade ago, are poorly calibrated.",
            allowedStances: ["supports"],
            displaySummary: "Modern sinir ağlarının zayıf kalibre edilmiş olasılıklar üretebildiği kaynakta açıkça belirtilir.",
          },
        ],
        licenseNote: "Open access arXiv preprint (Guo, Pleiss, Sun, Weinberger)",
      },
      {
        id: "src-ml-scikit-calibration",
        url: "https://scikit-learn.org/1.7/modules/calibration.html",
        title: "Probability calibration",
        publisher: "scikit-learn developers, version 1.7 documentation",
        retrievedDate: "2026-09-12",
        locator: "Section 1.16, Probability calibration",
        locatorBounds: { section: "Section 1.16" },
        excerpt: "Well calibrated classifiers are probabilistic classifiers for which the output of the predict_proba method can be directly interpreted as a confidence level. For instance, a well calibrated (binary) classifier should classify the samples such that among the samples to which it gave a predict_proba value close to 0.8, approximately 80% actually belong to the positive class.",
        checksum: "52f902f35a5ccad64d208fe08bd87052f7c7f38e1f88bd5888e8839e004040e6",
        semanticMappings: [
          {
            propositionId: "prop-ml-3",
            quote: "Well calibrated classifiers are probabilistic classifiers for which the output of the predict_proba method can be directly interpreted as a confidence level.",
            allowedStances: ["supports"],
            displaySummary: "İyi kalibre edilmiş sınıflandırıcılarda predict_proba çıktısı doğrudan güven seviyesi olarak yorumlanabilir.",
          },
        ],
        licenseNote: "Version-pinned scikit-learn technical documentation; BSD-3-Clause",
      },
    ],
  },
  {
    id: "claim-2",
    title: "GündemAI Çok Kaynaklı Habercilik",
    statement: "Farklı kaynaklar aynı olayı aynı şekilde mi anlatır?",
    topic: "gundem-ai",
    reviewStatus: "approved",
    propositions: [
      {
        id: "prop-gundem-1",
        statement: "Haber çerçeveleme, algılanan gerçekliğin bazı yönlerini seçip metinde daha belirgin kılar.",
      },
      {
        id: "prop-gundem-2",
        statement: "Haber çerçeveleri yayın organının türüne ve konuya göre değişebilir.",
      },
    ],
    sources: [
      {
        id: "src-gundem-entman-1993",
        url: "https://doi.org/10.1111/j.1460-2466.1993.tb01304.x",
        title: "Framing: Toward Clarification of a Fractured Paradigm",
        publisher: "Journal of Communication",
        publishedDate: "1993-12-01",
        retrievedDate: "2026-09-12",
        locator: "p. 52",
        locatorBounds: { minPage: 51, maxPage: 58, section: "Defining Framing" },
        excerpt: "To frame is to select some aspects of a perceived reality and make them more salient in a communicating text, in such a way as to promote a particular problem definition, causal interpretation, moral evaluation, and/or treatment recommendation for the item described.",
        checksum: "a510c383f9ab651d3c41c2a1b118f325221a504dad6290b56acdaa41f5a7ccef",
        semanticMappings: [
          {
            propositionId: "prop-gundem-1",
            quote: "To frame is to select some aspects of a perceived reality and make them more salient in a communicating text, in such a way as to promote a particular problem definition, causal interpretation, moral evaluation, and/or treatment recommendation for the item described.",
            allowedStances: ["supports"],
            displaySummary: "Haber çerçeveleme, algılanan gerçekliğin bazı yönlerini seçip metinde daha belirgin hâle getirir.",
          },
        ],
        licenseNote: "Academic citation under fair use (Entman, 1993)",
      },
      {
        id: "src-gundem-semetko-2000",
        url: "https://doi.org/10.1111/j.1460-2466.2000.tb02843.x",
        title: "Framing European Politics: A Content Analysis of Press and Television News",
        publisher: "Journal of Communication",
        publishedDate: "2000-06-01",
        retrievedDate: "2026-09-12",
        locator: "Abstract, p. 93",
        locatorBounds: { minPage: 93, maxPage: 109, section: "Abstract" },
        excerpt: "The use of news frames depended on both the type of outlet and the type of topic. Most significant differences were not between media (television vs. the press) but between sensationalist vs. serious types of news outlets. Sober and serious newspapers and television news programs more often used the responsibility and conflict frames in the presentation of news, whereas sensationalist outlets more often used the human interest frame.",
        checksum: "597283da4abd2cc31ea1c1ff433a35087f3b0d093ba750997297066551729ebb",
        semanticMappings: [
          {
            propositionId: "prop-gundem-2",
            quote: "The use of news frames depended on both the type of outlet and the type of topic.",
            allowedStances: ["supports"],
            displaySummary: "Haber çerçevelerinin kullanımı hem yayın organı türüne hem de konu türüne göre değişir.",
          },
          {
            propositionId: "prop-gundem-2",
            quote: "The use of news frames depended on both the type of outlet and the type of topic. Most significant differences were not between media (television vs. the press) but between sensationalist vs. serious types of news outlets. Sober and serious newspapers and television news programs more often used the responsibility and conflict frames in the presentation of news, whereas sensationalist outlets more often used the human interest frame.",
            allowedStances: ["supports"],
            displaySummary: "Ciddi ve sansasyonel yayın organları farklı haber çerçevelerini daha sık kullanır.",
          },
        ],
        licenseNote: "Academic citation under fair use (Semetko & Valkenburg, 2000)",
      },
    ],
  },
  {
    id: "claim-3",
    title: "Portfolyo AI Üretimi ve Denetimi",
    statement: "Bu projeyi yapay zekâ sadece üretti mi, yoksa eleştirip doğruladı mı?",
    topic: "portfolio",
    reviewStatus: "approved",
    propositions: [
      {
        id: "prop-portfolio-roles",
        statement: "Bu deponun AI Review Desk tasarımı araştırma, eleştiri ve doğrulamayı ayrı roller olarak tanımlar.",
        description: "Kanıt, commit'teki tasarım ve uygulama artefaktlarının kapsamıyla sınırlıdır; canlı model kalitesini kanıtlamaz.",
      },
      {
        id: "prop-portfolio-editor",
        statement: "AI Review Desk kararı yalnızca doğrulanmış bulguları birleştiren deterministik editörde derlenir.",
      },
      {
        id: "prop-portfolio-human-control",
        statement: "AI Review Desk'in tamamlanan sonuçları, son kontrol sorumluluğunu Cem'e atayan sabit “Son kontrol: Cem.” etiketini gösterir.",
      },
      {
        id: "prop-portfolio-2",
        statement: "Ayrıştırılmış çoklu LLM çağrıları her uygulamada tek bir LLM çağrısından daha iyi bir seçimdir.",
        description: "Bu kasıtlı olarak geniş önerme, basit uygulamalarda tek çağrının yeterli olabileceği uyarısıyla sınanır.",
      },
    ],
    sources: [
      {
        id: "src-portfolio-design-8a69913",
        url: "https://github.com/cemyildizcy/cemyildiz-portfolio/blob/8a6991310633ec1f758c115ef361fd223edb2123/docs/superpowers/specs/2026-09-11-ai-review-desk-design.md",
        title: "AI Review Desk Design at commit 8a69913",
        publisher: "cemyildizcy/cemyildiz-portfolio",
        publishedDate: "2026-09-11",
        retrievedDate: "2026-09-12",
        locator: "§2 Visible roles and Verdicts",
        locatorBounds: { section: "Visible roles and Verdicts" },
        excerpt: "Roles are represented by work, not avatars:\n\n- **Researcher:** finds bounded evidence.\n- **Skeptic:** seeks counterexamples and missing assumptions.\n- **Verifier:** checks source identity, excerpt match, scope, and contradiction.\n- **Editor:** deterministic code; combines only verified findings.\n\nThe UI must never show hidden chain-of-thought. It shows short role summaries, evidence, rejection reasons, and verdict rules.\n\n### Verdicts\n\n- Supported\n- Revise\n- Insufficient evidence\n\nEvery completed result includes sources, rejected findings, run ID, duration, live/cache status, and the fixed label **“Son kontrol: Cem.”**",
        checksum: "e7123be2b555dd5aa66fd19e14927b277737f3fa1a63b47bd413a24e4915bb60",
        semanticMappings: [
          {
            propositionId: "prop-portfolio-human-control",
            quote: "Every completed result includes sources, rejected findings, run ID, duration, live/cache status, and the fixed label **“Son kontrol: Cem.”**",
            allowedStances: ["supports"],
            displaySummary: "Tamamlanan sonuçlar, son kontrol sorumluluğunu Cem'e atayan sabit “Son kontrol: Cem.” etiketini gösterir.",
          },
        ],
        licenseNote: "Public repository artifact pinned to an immutable commit",
      },
      {
        id: "src-portfolio-run-8a69913",
        url: "https://github.com/cemyildizcy/cemyildiz-portfolio/blob/8a6991310633ec1f758c115ef361fd223edb2123/src/lib/review/run.ts",
        title: "Review orchestrator implementation at commit 8a69913",
        publisher: "cemyildizcy/cemyildiz-portfolio",
        retrievedDate: "2026-09-12",
        locator: "src/lib/review/run.ts, lines 110-124; lines 186-194",
        locatorBounds: { section: "src/lib/review/run.ts" },
        excerpt: `// 3. Execute all three roles in parallel
        const roles: RoleName[] = ["researcher", "skeptic", "verifier"];
        let roleOutputs;
        try {
          roleOutputs = await Promise.all(
            roles.map((role) =>
              executeRole({
                claimId: request.claimId,
                mode: request.mode,
                role,
                provider,
                signal,
              }),
            ),
          );
        } catch {
          if (signal?.aborted) {
            controller.close();
            return;
          }
          emitError(
            "role_failed",
            "İnceleme rolleri çalıştırılırken bir hata oluştu.",
            true,
          );
          controller.close();
          return;
        }

        if (signal?.aborted) {
          controller.close();
          return;
        }

        const allVerifiedFindings: VerifiedFinding[] = [];
        const allRejectedFindings: RejectedFinding[] = [];

        // 4. Process each role output, verify citations, and emit events
        for (const output of roleOutputs) {
          emit(createEvent("role.completed", output));

          for (const finding of output.findings) {
            const verificationResult = verifier.verifyFinding(
              request.claimId,
              finding,
              output.role,
            );

            if ("verified" in verificationResult && verificationResult.verified === true) {
              allVerifiedFindings.push(verificationResult);
              emit(
                createEvent("finding.verified", {
                  finding: verificationResult,
                }),
              );
            } else {
              const rejected = verificationResult as RejectedFinding;
              allRejectedFindings.push(rejected);
              emit(
                createEvent("finding.rejected", {
                  finding: rejected,
                }),
              );
            }
          }
        }

        // 5. run.status -> editing
        emit(
          createEvent("run.status", {
            status: "editing",
            message: "Bulgular derleniyor ve editoryal karar oluşturuluyor...",
          }),
        );

        // 6. Deterministic compilation
        const compilation = compileReview({
          runId,
          claimId: request.claimId,
          mode: request.mode,
          durationMs: Math.max(0, Date.now() - startTime),
          verifiedFindings: allVerifiedFindings,
          rejectedFindings: allRejectedFindings,
        });`,
        checksum: "fcbef543dbd1a35e7cfd88938710acb5a1c17c2c89a9dc4301aa09824fe6b530",
        semanticMappings: [
          {
            propositionId: "prop-portfolio-roles",
            quote: "const roles: RoleName[] = [\"researcher\", \"skeptic\", \"verifier\"];",
            allowedStances: ["supports"],
            displaySummary: "Orkestratör araştırmacı, kuşkucu ve doğrulayıcı rollerini ayrı ayrı çalıştırır.",
          },
          {
            propositionId: "prop-portfolio-editor",
            quote: "verifiedFindings: allVerifiedFindings,\n          rejectedFindings: allRejectedFindings,",
            allowedStances: ["supports"],
            displaySummary: "Orkestratör derleme aşamasına yalnızca doğrulanmış bulguları aktarır.",
          },
        ],
        licenseNote: "Public repository code pinned to an immutable commit",
      },
      {
        id: "src-portfolio-editor-8a69913",
        url: "https://github.com/cemyildizcy/cemyildiz-portfolio/blob/8a6991310633ec1f758c115ef361fd223edb2123/src/lib/review/editor.ts",
        title: "Deterministic review compiler implementation at commit 8a69913",
        publisher: "cemyildizcy/cemyildiz-portfolio",
        retrievedDate: "2026-09-12",
        locator: "src/lib/review/editor.ts, lines 199-219",
        locatorBounds: { section: "src/lib/review/editor.ts" },
        excerpt: `const verdict = computeVerdict({
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
  });`,
        checksum: "bb3d4f3a63a995bd86f8aa8881b00e6addb276f674680c419b6c4a4703438b9b",
        semanticMappings: [
          {
            propositionId: "prop-portfolio-editor",
            quote: `const verdict = computeVerdict({
    materialPropositionIds,
    verifiedFindings: deduplicatedFindings,
  });`,
            allowedStances: ["supports"],
            displaySummary: "Editoryal derleme, yalnızca doğrulanmış bulguları deterministik doğruluk tablosu ve özet kurallarıyla birleştirir.",
          },
        ],
        licenseNote: "Public repository code pinned to an immutable commit",
      },
      {
        id: "src-portfolio-anthropic-2024",
        url: "https://www.anthropic.com/engineering/building-effective-agents",
        title: "Building Effective Agents",
        publisher: "Anthropic",
        publishedDate: "2024-12-19",
        retrievedDate: "2026-09-12",
        locator: "Section: When (and when not) to use agents",
        locatorBounds: { section: "When (and when not) to use agents" },
        excerpt: "When building applications with LLMs, we recommend finding the simplest solution possible, and only increasing complexity when needed. This might mean not building agentic systems at all. Agentic systems often trade latency and cost for better task performance, and you should consider when this tradeoff makes sense. For many applications, however, optimizing single LLM calls with retrieval and in-context examples is usually enough.",
        checksum: "30dc5afe2d1da708ddd9a4042d2ce1d50e070c40c67309e24a7b76cfdb7d8b8c",
        semanticMappings: [
          {
            propositionId: "prop-portfolio-2",
            quote: "For many applications, however, optimizing single LLM calls with retrieval and in-context examples is usually enough.",
            allowedStances: ["contradicts"],
            displaySummary: "Birçok uygulamada optimize edilmiş tek LLM çağrısı yeterli olduğundan çoklu çağrıların evrensel üstünlüğü desteklenmez.",
          },
        ],
        licenseNote: "Anthropic Engineering citation under fair use",
      },
    ],
  },
];
