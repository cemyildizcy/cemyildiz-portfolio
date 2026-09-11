"use client";

import React, { useState, useRef } from "react";
import type { ClaimRecord } from "@/data/review-desk/claims";
import {
  CONTRACT_VERSION,
  type ClaimId,
  type ReviewMode,
  type RoleOutput,
  type VerifiedFinding,
  type RejectedFinding,
  type Verdict,
  type RunReceipt,
  type ReviewEvent,
} from "@/lib/review/contracts";
import { SafeReviewRenderer } from "./SafeReviewRenderer";

export interface ReviewDeskClientProps {
  initialClaims: readonly ClaimRecord[];
}

type DeskState =
  | "idle"
  | "connecting"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export function ReviewDeskClient({ initialClaims }: ReviewDeskClientProps) {
  const [selectedClaimId, setSelectedClaimId] = useState<ClaimId>("claim-1");
  const [selectedMode, setSelectedMode] = useState<ReviewMode>("quick");
  const [deskState, setDeskState] = useState<DeskState>("idle");
  const [statusMessage, setStatusMessage] = useState<string>(
    "İnceleme başlatılmaya hazır. Bir vaka ve mod seçip başlatabilirsiniz.",
  );

  const [roleOutputs, setRoleOutputs] = useState<RoleOutput[]>([]);
  const [verifiedFindings, setVerifiedFindings] = useState<VerifiedFinding[]>([]);
  const [rejectedFindings, setRejectedFindings] = useState<RejectedFinding[]>([]);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [verdictSummary, setVerdictSummary] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<RunReceipt | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const selectedClaim =
    initialClaims.find((c) => c.id === selectedClaimId) ?? initialClaims[0];

  const handleEvent = (event: ReviewEvent) => {
    switch (event.type) {
      case "run.started":
        setDeskState("running");
        setStatusMessage("İnceleme oturumu başlatıldı. Bağımsız roller çalışıyor...");
        break;
      case "run.status":
        setStatusMessage(event.payload.message);
        break;
      case "role.completed":
        setRoleOutputs((prev) => [...prev, event.payload]);
        break;
      case "finding.verified":
        setVerifiedFindings((prev) => [...prev, event.payload.finding]);
        break;
      case "finding.rejected":
        setRejectedFindings((prev) => [...prev, event.payload.finding]);
        break;
      case "run.verdict":
        setVerdict(event.payload.verdict);
        setVerdictSummary(event.payload.summary);
        break;
      case "run.receipt":
        setReceipt(event.payload.receipt);
        break;
      case "run.completed":
        setReceipt(event.payload.receipt);
        setDeskState("completed");
        setStatusMessage("İnceleme başarıyla tamamlandı. Sonuçlar derlendi.");
        break;
      case "run.error":
        setDeskState("failed");
        setErrorMessage(event.payload.message);
        setStatusMessage(`İnceleme durduruldu: ${event.payload.message}`);
        break;
    }
  };

  const startReview = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setDeskState("connecting");
    setStatusMessage("Sunucuya bağlanılıyor ve sözleşme doğrulanıyor...");
    setRoleOutputs([]);
    setVerifiedFindings([]);
    setRejectedFindings([]);
    setVerdict(null);
    setVerdictSummary(null);
    setReceipt(null);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/review/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claimId: selectedClaimId,
          mode: selectedMode,
          clientRequestId: crypto.randomUUID(),
          contractVersion: CONTRACT_VERSION,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let msg = "İnceleme başlatılamadı.";
        try {
          const json = await response.json();
          if (json.error?.message) {
            msg = json.error.message;
          }
        } catch {
          // ignore
        }
        setDeskState("failed");
        setErrorMessage(msg);
        setStatusMessage(msg);
        return;
      }

      if (!response.body) {
        throw new Error("Akış yanıtı alınamadı.");
      }

      setDeskState("running");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split(/\r?\n\r?\n/);
        buffer = blocks.pop() ?? "";

        for (const block of blocks) {
          if (!block.trim()) continue;
          const lines = block.split(/\r?\n/);
          let dataStr = "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              dataStr = line.slice(6).trim();
            }
          }

          if (dataStr) {
            try {
              const event = JSON.parse(dataStr) as ReviewEvent;
              handleEvent(event);
            } catch {
              // ignore parse errors on malformed chunks
            }
          }
        }
      }

      if (controller.signal.aborted) {
        setDeskState("cancelled");
        setStatusMessage("İnceleme iptal edildi.");
      }
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        setDeskState("cancelled");
        setStatusMessage("İnceleme iptal edildi.");
      } else {
        const msg =
          err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu.";
        setDeskState("failed");
        setErrorMessage(msg);
        setStatusMessage(`Hata: ${msg}`);
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const cancelReview = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setDeskState("cancelled");
    setStatusMessage("İnceleme iptal edildi.");
  };

  const resetReview = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setDeskState("idle");
    setStatusMessage("İnceleme sıfırlandı. Yeni bir inceleme başlatabilirsiniz.");
    setRoleOutputs([]);
    setVerifiedFindings([]);
    setRejectedFindings([]);
    setVerdict(null);
    setVerdictSummary(null);
    setReceipt(null);
    setErrorMessage(null);
  };

  const isExecuting = deskState === "connecting" || deskState === "running";

  return (
    <div className="review-desk-shell">
      {/* Header & Editorial Banner */}
      <header className="review-desk-header">
        <p className="review-desk-kicker">Yayımdan önce açılan vaka dosyaları</p>
        <div className="review-desk-title-row">
          <div>
            <h1>AI İnceleme Masası</h1>
            <p className="review-desk-dek">
              Bir cümleyi yayımlamadan önce bağımsız rollerle sınıyor, her
              alıntıyı doğrulanmış kaynaklarla eşleştiriyorum.
            </p>
          </div>
          <div className="review-desk-human-stamp">
            <span aria-hidden="true">✓</span>
            <span>Son kontrol: Cem.</span>
          </div>
        </div>
      </header>

      {/* Main 3-column desk layout */}
      <div className="review-desk-grid">
        {/* Column 1: Case Tray */}
        <aside className="desk-paper desk-tray" aria-label="Vaka Dosyaları">
          <h2>Vaka Dosyaları</h2>
          <div className="claim-list" role="group" aria-label="İncelenecek vaka seçimi">
            {initialClaims.map((claim) => {
              const isSelected = claim.id === selectedClaimId;
              const isDraft = claim.reviewStatus === "draft";
              return (
                <button
                  key={claim.id}
                  type="button"
                  aria-pressed={isSelected}
                  className="claim-button"
                  onClick={() => {
                    if (!isExecuting) {
                      setSelectedClaimId(claim.id);
                      resetReview();
                    }
                  }}
                  disabled={isExecuting}
                >
                  <span className="claim-button-title">{claim.title}</span>
                  <div className="claim-button-meta">
                    <span className="uppercase tracking-wider">{claim.topic}</span>
                    <span
                      className={`status-tag ${
                        isDraft ? "status-tag-draft" : "status-tag-approved"
                      }`}
                    >
                      {isDraft ? "Taslak" : "Onaylı"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Column 2: Workbench / Central Sheet */}
        <section
          className="desk-paper desk-workbench-sheet"
          aria-label="İnceleme Çalışma Alanı"
        >
          {/* Folio info */}
          <div className="sheet-folio">
            <span>DOSYA: AİM-{selectedClaim.id.toUpperCase()}</span>
            <span>
              DURUM:{" "}
              {deskState === "idle"
                ? "İNCELEME BEKLİYOR"
                : deskState === "running" || deskState === "connecting"
                ? "İNCELEME SÜRÜYOR"
                : deskState === "completed"
                ? "TAMAMLANDI"
                : deskState === "cancelled"
                ? "İPTAL EDİLDİ"
                : "HATA"}
            </span>
          </div>

          {/* Mode Selector */}
          <div className="desk-modes">
            <div className="desk-modes-label">İnceleme Modu</div>
            <div className="desk-modes-group" role="group" aria-label="İnceleme modu seçimi">
              <button
                type="button"
                className="mode-button"
                aria-pressed={selectedMode === "quick"}
                onClick={() => {
                  if (!isExecuting) setSelectedMode("quick");
                }}
                disabled={isExecuting}
              >
                Hızlı (Quick)
              </button>
              <button
                type="button"
                className="mode-button"
                aria-pressed={selectedMode === "balanced"}
                onClick={() => {
                  if (!isExecuting) setSelectedMode("balanced");
                }}
                disabled={isExecuting}
              >
                Dengeli (Balanced)
              </button>
            </div>
          </div>

          {/* Hypothesis Card */}
          <article className="hypothesis-card">
            <div className="hypothesis-kicker">HİPOTEZ / ÖNERME</div>
            <h2 className="hypothesis-statement">{selectedClaim.statement}</h2>
            {selectedClaim.propositions.length > 0 && (
              <div>
                <div className="desk-modes-label">Temel Önermeler:</div>
                <ul className="propositions-list">
                  {selectedClaim.propositions.map((p) => (
                    <li key={p.id} className="proposition-item">
                      <strong>{p.statement}</strong>
                      {p.description && <span> — {p.description}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>

          {/* Action Bar */}
          <div className="desk-actions">
            {!isExecuting ? (
              <button
                type="button"
                className="btn-primary"
                onClick={startReview}
              >
                İncelemeyi Başlat
              </button>
            ) : (
              <button
                type="button"
                className="btn-danger"
                onClick={cancelReview}
              >
                İptal Et
              </button>
            )}

            {(deskState === "completed" ||
              deskState === "failed" ||
              deskState === "cancelled") && (
              <button
                type="button"
                className="btn-secondary"
                onClick={resetReview}
              >
                Sıfırla
              </button>
            )}
          </div>

          {/* Status Monitor (aria-live region) */}
          <div
            role="status"
            aria-live="polite"
            className="desk-status-monitor"
          >
            <span
              className={`status-pulse-dot ${
                isExecuting
                  ? "running"
                  : deskState === "completed"
                  ? "completed"
                  : deskState === "failed"
                  ? "failed"
                  : ""
              }`}
              aria-hidden="true"
            />
            <p className="desk-status-text">{statusMessage}</p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="rejected-finding-card mb-4" role="alert">
              <span className="rejected-badge">Bildirim</span>
              <p className="text-sm font-semibold text-red-900 my-1">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Structured Safe Review Renderer */}
          <SafeReviewRenderer
            roleOutputs={roleOutputs}
            verifiedFindings={verifiedFindings}
            rejectedFindings={rejectedFindings}
            verdict={verdict}
            verdictSummary={verdictSummary}
            receipt={receipt}
          />
        </section>

        {/* Column 3: Sources & Evidence Ledger */}
        <aside className="desk-paper desk-ledger" aria-label="Kaynak Havuzu ve Kanıtlar">
          <h2>Kaynak Havuzu ({selectedClaim.sources.length})</h2>
          {selectedClaim.sources.length === 0 ? (
            <p className="text-sm text-slate-500 italic">
              Bu vaka için kaynaklar henüz doğrulanma aşamasındadır.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {selectedClaim.sources.map((source) => (
                <article key={source.id} className="source-item">
                  <h3 className="source-item-title">{source.title}</h3>
                  <div className="source-item-publisher">
                    {source.publisher} · {source.locator}
                  </div>
                  <blockquote className="source-item-excerpt">
                    &ldquo;{source.excerpt}&rdquo;
                  </blockquote>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="source-item-link"
                    data-source-id={source.id}
                    aria-label={`${source.title} kaynağını yeni sekmede aç`}
                  >
                    <span>Orijinal Kaynağı Aç</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </article>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
