"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { layerOrder, projects, type LayerKey } from "@/data/projects";
import {
  initialEvidenceDeskState,
  selectLayer,
  selectProject,
} from "./evidenceDeskState";

const layerLabels: Record<LayerKey, string> = {
  output: "Çıktı",
  decision: "Karar",
  ai: "AI desteği",
  orchestration: "Orkestrasyon",
  limits: "Sınırlar",
};

type TabKey = string;

function nextTabIndex(key: string, index: number, length: number) {
  if (key === "ArrowRight" || key === "ArrowDown") return (index + 1) % length;
  if (key === "ArrowLeft" || key === "ArrowUp") return (index - 1 + length) % length;
  if (key === "Home") return 0;
  if (key === "End") return length - 1;
  return undefined;
}

export function EvidenceDesk() {
  const [state, setState] = useState(initialEvidenceDeskState);
  const projectTabs = useRef<Record<TabKey, HTMLButtonElement | null>>({});
  const layerTabs = useRef<Record<TabKey, HTMLButtonElement | null>>({});

  function chooseProject(projectSlug: string, focus = false) {
    setState((current) => selectProject(current, projectSlug));
    if (focus) projectTabs.current[projectSlug]?.focus();
  }

  function chooseLayer(layerKey: LayerKey, focus = false) {
    setState((current) => selectLayer(current, layerKey));
    if (focus) layerTabs.current[layerKey]?.focus();
  }

  useEffect(() => {
    function handleSelect(event: Event) {
      const customEvent = event as CustomEvent<{ slug: string }>;
      const rawSlug = customEvent.detail?.slug;
      if (!rawSlug) return;
      const targetProject =
        projects.find((p) => p.slug === rawSlug) ??
        projects.find((p) => p.slug.includes(rawSlug) || rawSlug.includes(p.slug));
      if (targetProject) {
        chooseProject(targetProject.slug, true);
      }
    }
    window.addEventListener("select-evidence-project", handleSelect);
    return () => window.removeEventListener("select-evidence-project", handleSelect);
  }, []);

  const project =
    projects.find((item) => item.slug === state.projectSlug) ??
    projects.find((item) => item.slug === initialEvidenceDeskState.projectSlug) ??
    projects[0];

  if (!project) return null;

  const layer = project.layers[state.layer];
  const projectTabId = `evidence-project-tab-${project.slug}`;
  const layerTabId = `evidence-layer-tab-${state.layer}`;

  function handleProjectKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = nextTabIndex(event.key, index, projects.length);
    if (next === undefined) return;
    event.preventDefault();
    chooseProject(projects[next].slug, true);
  }

  function handleLayerKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = nextTabIndex(event.key, index, layerOrder.length);
    if (next === undefined) return;
    event.preventDefault();
    chooseLayer(layerOrder[next], true);
  }

  const formattedStatus = project.status.replace(/\bve\b/g, "+").toUpperCase();

  return (
    <section id="work" className="desk-section live-cutaway-section" aria-labelledby="work-title">
      <div className="section-head">
        <h2 id="work-title">Seçili projeler.</h2>
        <p>Bir proje seçerek çıktıyı, kararları, yapay zekâ desteğini ve sınırları incele.</p>
      </div>

      <div className="evidence-desk live-cutaway">
        <div className="project-tabs file-tabs" role="tablist" aria-label="Proje dosyaları">
          {projects.map((item, index) => {
            const selected = item.slug === project.slug;
            return (
              <button
                key={item.slug}
                ref={(element) => {
                  projectTabs.current[item.slug] = element;
                }}
                type="button"
                role="tab"
                id={`evidence-project-tab-${item.slug}`}
                aria-selected={selected}
                aria-controls="evidence-project-panel"
                tabIndex={selected ? 0 : -1}
                className="project-tab"
                onClick={() => chooseProject(item.slug)}
                onKeyDown={(event) => handleProjectKeyDown(event, index)}
              >
                <span className="project-tab-title">{item.title}</span>
                <span className="project-tab-status">{item.status}</span>
              </button>
            );
          })}
        </div>

        <div
          id="evidence-project-panel"
          role="tabpanel"
          aria-labelledby={projectTabId}
          className="proof-sheet file"
          aria-live="polite"
        >
          <header className="file-head">
            <div>
              <p className="file-kicker" id="file-kicker">
                DOSYA {project.fileLabel} / CANLI KESİT
              </p>
              <h3 id="project-file-title" className="file-title">
                {project.title}
              </h3>
            </div>
            <span className="status" id="file-status">
              {formattedStatus}
            </span>
          </header>

          <p className="premise file-premise">{project.premise}</p>

          <div className="layer-tabs" role="tablist" aria-label="Dosya katmanları">
            {layerOrder.map((layerKey, index) => {
              const selected = state.layer === layerKey;
              return (
                <button
                  key={layerKey}
                  ref={(element) => {
                    layerTabs.current[layerKey] = element;
                  }}
                  type="button"
                  role="tab"
                  id={`evidence-layer-tab-${layerKey}`}
                  aria-selected={selected}
                  aria-controls="evidence-layer-panel"
                  tabIndex={selected ? 0 : -1}
                  className="layer-tab"
                  onClick={() => chooseLayer(layerKey)}
                  onKeyDown={(event) => handleLayerKeyDown(event, index)}
                >
                  {layerLabels[layerKey]}
                </button>
              );
            })}
          </div>

          <div
            id="evidence-layer-panel"
            className="file-body"
            role="tabpanel"
            aria-labelledby={layerTabId}
          >
            <div className="proof-grid">
              <div className="proof-copy">
                <p className="layer-label">{layer.label}</p>
                <h4 className="layer-title">{layer.title}</h4>
                <p className="layer-body">{layer.body}</p>

                {state.layer === "orchestration" ? (
                  <div className="orchestration-presentation" aria-label="Ajan filosu ve doğrulama kapıları">
                    <div className="agent-fleet-tags" role="list" aria-label="Görevli Ajan Filosu">
                      <span className="agent-tag" role="listitem">
                        <strong className="agent-name">Nolan</strong>
                        <span className="agent-role">Mimari</span>
                      </span>
                      <span className="agent-tag" role="listitem">
                        <strong className="agent-name">Marcus</strong>
                        <span className="agent-role">Arayüz</span>
                      </span>
                      <span className="agent-tag" role="listitem">
                        <strong className="agent-name">Liam</strong>
                        <span className="agent-role">Veri</span>
                      </span>
                      <span className="agent-tag" role="listitem">
                        <strong className="agent-name">Felix</strong>
                        <span className="agent-role">TDD</span>
                      </span>
                      <span className="agent-tag" role="listitem">
                        <strong className="agent-name">Ethan</strong>
                        <span className="agent-role">Denetim</span>
                      </span>
                    </div>

                    <div className="verification-badges" role="list" aria-label="Doğrulama Kapıları">
                      <span className="v-badge v-badge-tdd" role="listitem">
                        ✓ TDD Protokolü: RED &rarr; GREEN
                      </span>
                      <span className="v-badge v-badge-audit" role="listitem">
                        ✓ Hasmane Denetim Kapısı
                      </span>
                      <span className="v-badge v-badge-drift" role="listitem">
                        ✓ Sıfır Şartname Sapması
                      </span>
                    </div>
                  </div>
                ) : null}

                <ul className="facts">
                  {layer.facts.map((fact) => (
                    <li key={fact}>{fact}</li>
                  ))}
                </ul>

                {state.layer === "output" && project.links.length > 0 ? (
                  <div className="file-links">
                    {project.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                ) : null}

                <div className="case-link-wrap">
                  <Link className="text-link" href={project.caseHref}>
                    Projeyi incele ↗
                  </Link>
                </div>
              </div>

              {state.layer === "output" && project.image ? (
                <figure className="figure">
                  <div
                    role="region"
                    className="chart-scroll-region"
                    aria-label="WC2026 şampiyonluk olasılıkları grafiği, kaydırılabilir bölge"
                    tabIndex={0}
                  >
                    <span className="chart-hint" aria-hidden="true">
                      Yana kaydırarak incele →
                    </span>
                    <Image
                      src={project.image.src}
                      alt={project.image.alt}
                      width={1000}
                      height={562}
                      className="chart-image"
                      priority
                    />
                  </div>
                  <figcaption>{project.image.alt}</figcaption>
                </figure>
              ) : null}

              {state.layer === "orchestration" ? (
                <div className="orchestration-card" aria-label="Orkestrasyon Protokolü Özeti">
                  <div className="orchestration-card-head">
                    <span className="card-kicker">PROTOKOL // MULTI_AGENT_TDD</span>
                    <span className="card-badge">ONAYLANDI (0 VETO)</span>
                  </div>
                  <div className="orchestration-flow">
                    <div className="flow-step">
                      <span className="flow-phase phase-red">1. RED TEST</span>
                      <p className="flow-text">Felix başarısız e2e/birim testini yazdı.</p>
                    </div>
                    <div className="flow-step">
                      <span className="flow-phase phase-green">2. GREEN KOD</span>
                      <p className="flow-text">Marcus &amp; Liam şartnameye göre kodu yeşile çevirdi.</p>
                    </div>
                    <div className="flow-step">
                      <span className="flow-phase phase-audit">3. HASMANE DENETİM</span>
                      <p className="flow-text">Ethan kontrast, erişilebilirlik ve sızıntı denetimi yaptı.</p>
                    </div>
                    <div className="flow-step">
                      <span className="flow-phase phase-pass">4. KABUL &amp; PUSH</span>
                      <p className="flow-text">Tüm kapılar geçildi, ana dala temiz kayıt sağlandı.</p>
                    </div>
                  </div>
                  <div className="orchestration-card-footer">
                    <span>Mühendis: Cem Yıldız (Nihai Onay)</span>
                  </div>
                </div>
              ) : null}
            </div>

            <p className="record-note pencil-note">{layer.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
