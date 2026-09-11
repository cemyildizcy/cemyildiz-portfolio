import React from "react";
import type {
  RoleOutput,
  VerifiedFinding,
  RejectedFinding,
  Verdict,
  RunReceipt,
  RejectionCode,
  RoleName,
  FindingStance,
} from "@/lib/review/contracts";

export interface SafeReviewRendererProps {
  roleOutputs: RoleOutput[];
  verifiedFindings: VerifiedFinding[];
  rejectedFindings: RejectedFinding[];
  verdict: Verdict | null;
  verdictSummary: string | null;
  receipt: RunReceipt | null;
}

const ROLE_LABELS: Record<RoleName, string> = {
  researcher: "Araştırmacı",
  skeptic: "Kuşkucu",
  verifier: "Doğrulayıcı",
};

const STANCE_LABELS: Record<FindingStance, { label: string; className: string }> = {
  supports: {
    label: "Destekliyor",
    className: "finding-stance-supports",
  },
  contradicts: {
    label: "Çelişiyor",
    className: "finding-stance-contradicts",
  },
  context: {
    label: "Bağlam",
    className: "finding-stance-context",
  },
};

const REJECTION_EXPLANATIONS: Record<RejectionCode, string> = {
  unknown_source: "Kaynak onaylı korpusta bulunamadı.",
  missing_quote: "Doğrulanabilir alıntı metni eksik.",
  quote_mismatch: "Alıntı metni, kaynak belgedeki orijinal ifadeyle birebir uyuşmuyor.",
  locator_mismatch: "Belirtilen sayfa veya bölüm konumu kaynakla eşleşmiyor.",
  unsafe_url: "Güvenli olmayan harici bağlantı protokolü.",
  unsupported_component: "Desteklenmeyen veya izin verilmeyen model bileşeni.",
  duplicate_finding: "Mükerrer bulgu tespit edildi ve derleme sırasında elendi.",
  oversized_field: "Metin uzunluğu izin verilen editoryal sınırları aşıyor.",
};

const VERDICT_DETAILS: Record<
  Verdict,
  { label: string; className: string }
> = {
  supported: {
    label: "Desteklendi",
    className: "verdict-supported",
  },
  revise: {
    label: "Düzeltilmeli",
    className: "verdict-revise",
  },
  insufficient_evidence: {
    label: "Yetersiz Kanıt",
    className: "verdict-insufficient",
  },
};

export function SafeReviewRenderer({
  roleOutputs,
  verifiedFindings,
  rejectedFindings,
  verdict,
  verdictSummary,
  receipt,
}: SafeReviewRendererProps) {
  const hasContent =
    roleOutputs.length > 0 ||
    verifiedFindings.length > 0 ||
    rejectedFindings.length > 0 ||
    verdict !== null ||
    receipt !== null;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="review-results-flow">
      {/* 1. Verified Findings */}
      {verifiedFindings.length > 0 && (
        <section aria-labelledby="verified-findings-heading">
          <h3 id="verified-findings-heading" className="desk-modes-label">
            Doğrulanmış Bulgular ({verifiedFindings.length})
          </h3>
          <div className="findings-list">
            {verifiedFindings.map((finding) => {
              const stance = STANCE_LABELS[finding.stance];
              return (
                <article key={finding.findingId} className="finding-item">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`finding-stance-badge ${stance.className}`}>
                      {stance.label}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {finding.propositionId}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 my-1">
                    {finding.summary}
                  </p>
                  {finding.citations.map((citation) => (
                    <div key={`${citation.sourceId}-${citation.locator}`} className="mt-2">
                      <blockquote className="finding-quote">
                        &ldquo;{citation.quote}&rdquo;
                      </blockquote>
                      <a
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-source-id={citation.sourceId}
                        className="source-citation-link"
                        aria-label={`${citation.sourceId} (${citation.locator}) kaynağını yeni sekmede aç`}
                      >
                        <span>Kaynak: {citation.sourceId}</span>
                        <span>· {citation.locator}</span>
                        <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  ))}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. Rejected Findings */}
      {rejectedFindings.length > 0 && (
        <section aria-labelledby="rejected-findings-heading">
          <h3 id="rejected-findings-heading" className="desk-modes-label">
            Elenen Zayıf ve Uyuşmayan İfadeler ({rejectedFindings.length})
          </h3>
          <div className="flex flex-col gap-3 mt-2">
            {rejectedFindings.map((finding) => (
              <article key={finding.findingId} className="rejected-finding-card">
                <span className="rejected-badge">Elenen Cümle</span>
                <del className="rejected-quote">&ldquo;{finding.summary}&rdquo;</del>
                <p className="rejection-reason">
                  <strong>Elenme Gerekçesi ({finding.code}):</strong>{" "}
                  {REJECTION_EXPLANATIONS[finding.code] ?? "Standartlara uymadığı için elendi."}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 3. Role Summaries */}
      {roleOutputs.length > 0 && (
        <section aria-labelledby="role-summaries-heading">
          <h3 id="role-summaries-heading" className="desk-modes-label">
            Rol İnceleme Çıktıları
          </h3>
          <div className="flex flex-col gap-3 mt-2">
            {roleOutputs.map((output) => (
              <article key={output.role} className="role-card">
                <div className="role-card-header">
                  <span className="role-name-tag">
                    {ROLE_LABELS[output.role] ?? output.role}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {output.findings.length} bulgu bildirildi
                  </span>
                </div>
                <p className="role-summary">{output.summary}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 4. Final Verdict */}
      {verdict && (
        <section aria-labelledby="verdict-heading" className="verdict-card">
          <div className="verdict-header">
            <h3 id="verdict-heading" className="text-xs font-mono uppercase tracking-wider text-slate-500 m-0">
              Editoryal Nihai Karar
            </h3>
            <div
              data-testid="verdict-badge"
              className={`verdict-badge ${VERDICT_DETAILS[verdict].className}`}
            >
              {VERDICT_DETAILS[verdict].label}
            </div>
          </div>
          {verdictSummary && <p className="verdict-summary">{verdictSummary}</p>}
        </section>
      )}

      {/* 5. Run Receipt */}
      {receipt && (
        <section
          aria-labelledby="receipt-heading"
          data-testid="receipt-card"
          className="receipt-card"
        >
          <h3 id="receipt-heading" className="receipt-title">
            Çalışma Makbuzu ve Denetim İzi
          </h3>
          <div className="receipt-grid">
            <div className="receipt-item">
              <span className="receipt-label">Çalışma Kimliği:</span>
              <span className="receipt-val">{receipt.runId}</span>
            </div>
            <div className="receipt-item">
              <span className="receipt-label">İnceleme Süresi:</span>
              <span className="receipt-val">{receipt.durationMs} ms</span>
            </div>
            <div className="receipt-item">
              <span className="receipt-label">Sonuç Kaynağı:</span>
              <span className="receipt-val">
                {receipt.resultSource === "live" ? "Canlı İnceleme" : "Doğrulanmış Önbellek"}
              </span>
            </div>
            <div className="receipt-item">
              <span className="receipt-label">Kullanılan Kaynaklar:</span>
              <span className="receipt-val">{receipt.sourceIds.join(", ") || "Yok"}</span>
            </div>
            <div className="receipt-item">
              <span className="receipt-label">Özet Doğrulama Kodu:</span>
              <span className="receipt-val">{receipt.resultHash}</span>
            </div>
            <div className="receipt-item">
              <span className="receipt-label">Tamamlanma Zamanı:</span>
              <span className="receipt-val">{receipt.completedAt}</span>
            </div>
          </div>
          <div className="receipt-stamp">
            <span>{receipt.humanReviewLabel}</span>
          </div>
        </section>
      )}
    </div>
  );
}
