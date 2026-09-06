"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { projects } from "@/data/projects";

export function EvidenceDesk() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const project = projects[active];

  function selectAndFocus(index: number) {
    setActive(index);
    tabs.current[index]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number | undefined;
    if (event.key === "ArrowRight") next = (index + 1) % projects.length;
    if (event.key === "ArrowLeft") next = (index - 1 + projects.length) % projects.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = projects.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectAndFocus(next);
  }

  return <section id="work" className="desk-section" aria-labelledby="work-title">
    <div className="section-head"><h2 id="work-title">Seçili projeler.</h2><p>Bir proje seçerek problemi, katkımı ve yapay zekâyı nasıl kullandığımı incele.</p></div>
    <div className="evidence-desk">
      <div className="file-tabs" role="tablist" aria-label="Projeler">
        {projects.map((item, index) => <button
          key={item.slug}
          ref={(element) => { tabs.current[index] = element; }}
          role="tab"
          aria-selected={active === index}
          aria-controls="project-panel"
          id={`tab-${item.slug}`}
          tabIndex={active === index ? 0 : -1}
          onClick={() => setActive(index)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >{item.title}<span>{item.status}</span></button>)}
      </div>
      <article id="project-panel" role="tabpanel" aria-labelledby={`tab-${project.slug}`} className="proof-sheet">
        <p className="pencil-note">{project.note}</p><h3>{project.title}</h3><p className="premise">{project.premise}</p>
        <dl><div><dt>Proje ne yapıyor?</dt><dd>{project.evidence[0]}</dd></div><div><dt>Ben ne yaptım?</dt><dd>{project.contribution[0]}</dd></div><div><dt>Yapay zekânın katkısı</dt><dd>{project.aiRole}</dd></div></dl>
        <Link className="text-link" href={`/work/${project.slug}`}>Projeyi incele</Link>
      </article>
    </div>
  </section>;
}
