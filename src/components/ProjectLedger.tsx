"use client";

import Link from "next/link";
import { projects } from "@/data/projects";

export function ProjectLedger() {
  function handleOpenProject(slug: string) {
    window.dispatchEvent(
      new CustomEvent("select-evidence-project", { detail: { slug } }),
    );
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = document.getElementById("work") || document.querySelector(".live-cutaway");
    target?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <section id="projects-ledger" className="ledger-section" aria-labelledby="ledger-title">
      <div className="ledger-intro">
        <h2 id="ledger-title">Üç dosya. Tek ölçüt: kanıt.</h2>
        <p>
          Teknoloji listesi yerine çalışan çıktıyı, aldığım kararları ve öğrenirken karşılaştığım sınırları açıyorum. Her dosyada yapay zekâ desteği ayrıca görünür.
        </p>
      </div>

      <div className="project-ledger">
        {projects.map((project) => (
          <article key={project.slug} className="ledger-row">
            <div className="ledger-info">
              <h3>{project.title}</h3>
              <p>{project.short}</p>
            </div>
            <div className="ledger-actions">
              <button
                type="button"
                className="ledger-open-btn"
                data-open={project.slug}
                onClick={() => handleOpenProject(project.slug)}
                aria-label={`${project.title} dosyasını aç`}
              >
                Dosyayı aç
              </button>
              <Link
                href={project.caseHref}
                className="ledger-case-link"
                aria-label={`${project.title} vaka analizi`}
              >
                Vaka analizi ↗
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
