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
    <div className="section-head"><h2 id="work-title">Üç çalışma dosyası.</h2><p>Bir sekme seç. Kanıt sayfası değişir; ölçüt değişmez.</p></div>
    <div className="evidence-desk">
      <div className="file-tabs" role="tablist" aria-label="Proje dosyaları">
        {projects.map((item, index) => <button
          key={item.slug}
          ref={(element) => { tabs.current[index] = element; }}
          role="tab"
          aria-selected={active === index}
          aria-controls="evidence-panel"
          id={`tab-${item.slug}`}
          tabIndex={active === index ? 0 : -1}
          onClick={() => setActive(index)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >{item.title}<span>{item.status}</span></button>)}
      </div>
      <article id="evidence-panel" role="tabpanel" aria-labelledby={`tab-${project.slug}`} className="proof-sheet">
        <p className="pencil-note">{project.note}</p><h3>{project.title}</h3><p className="premise">{project.premise}</p>
        <dl><div><dt>Ortada ne var?</dt><dd>{project.evidence[0]}</dd></div><div><dt>Cem&apos;in katkısı</dt><dd>{project.contribution[0]}</dd></div><div><dt>Yapay zekânın katkısı</dt><dd>{project.aiRole}</dd></div></dl>
        <Link className="text-link" href={`/work/${project.slug}`}>Kanıt notunu oku</Link>
      </article>
    </div>
  </section>;
}
