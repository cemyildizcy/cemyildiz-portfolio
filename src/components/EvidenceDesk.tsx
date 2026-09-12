"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
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
  const project = projects.find((item) => item.slug === state.projectSlug) ??
    projects.find((item) => item.slug === initialEvidenceDeskState.projectSlug);

  if (!project) return null;

  const layer = project.layers[state.layer];
  const projectTabId = `evidence-project-tab-${project.slug}`;
  const layerTabId = `evidence-layer-tab-${state.layer}`;

  function chooseProject(projectSlug: string, focus = false) {
    setState((current) => selectProject(current, projectSlug));
    if (focus) requestAnimationFrame(() => projectTabs.current[projectSlug]?.focus());
  }

  function chooseLayer(layerKey: LayerKey, focus = false) {
    setState((current) => selectLayer(current, layerKey));
    if (focus) requestAnimationFrame(() => layerTabs.current[layerKey]?.focus());
  }

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

  return (
    <section id="work" className="desk-section" aria-labelledby="work-title">
      <div className="section-head">
        <h2 id="work-title">Seçili projeler.</h2>
        <p>Bir proje seçerek çıktıyı, kararları, yapay zekâ desteğini ve sınırları incele.</p>
      </div>

      <div className="evidence-desk">
        <div className="file-tabs" role="tablist" aria-label="Proje dosyaları">
          {projects.map((item, index) => {
            const selected = item.slug === project.slug;
            return (
              <button
                key={item.slug}
                ref={(element) => { projectTabs.current[item.slug] = element; }}
                role="tab"
                id={`evidence-project-tab-${item.slug}`}
                aria-selected={selected}
                aria-controls="evidence-project-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => chooseProject(item.slug)}
                onKeyDown={(event) => handleProjectKeyDown(event, index)}
              >
                {item.title}<span>{item.status}</span>
              </button>
            );
          })}
        </div>

        <article
          id="evidence-project-panel"
          role="tabpanel"
          aria-labelledby={projectTabId}
          className="proof-sheet"
        >
          <p className="pencil-note">{project.fileLabel} · {project.note}</p>
          <h3>{project.title}</h3>
          <p className="premise">{project.premise}</p>

          <div className="layer-tabs" role="tablist" aria-label="Dosya katmanları">
            {layerOrder.map((layerKey, index) => {
              const selected = state.layer === layerKey;
              return (
                <button
                  key={layerKey}
                  ref={(element) => { layerTabs.current[layerKey] = element; }}
                  role="tab"
                  id={`evidence-layer-tab-${layerKey}`}
                  aria-selected={selected}
                  aria-controls="evidence-layer-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => chooseLayer(layerKey)}
                  onKeyDown={(event) => handleLayerKeyDown(event, index)}
                >
                  {layerLabels[layerKey]}
                </button>
              );
            })}
          </div>

          <div id="evidence-layer-panel" role="tabpanel" aria-labelledby={layerTabId}>
            <p>{layer.label}</p>
            <h4>{layer.title}</h4>
            <p>{layer.body}</p>
            <ul>{layer.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
            <p className="pencil-note">{layer.note}</p>

            {state.layer === "output" && project.image ? (
              <figure>
                <div
                  aria-label={`${project.title} şampiyonluk olasılıkları grafiği, kaydırılabilir bölge`}
                  tabIndex={0}
                >
                  <span>Yana kaydırarak incele</span>
                  <Image src={project.image.src} alt={project.image.alt} width={960} height={540} />
                </div>
                <figcaption>{project.image.alt}</figcaption>
              </figure>
            ) : null}

            {state.layer === "output" && project.links.length > 0 ? (
              <div>
                {project.links.map((link) => (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <Link className="text-link" href={project.caseHref}>Projeyi incele</Link>
        </article>
      </div>
    </section>
  );
}
