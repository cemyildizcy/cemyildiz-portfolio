import { describe, expect, it } from "vitest";
import { getProject, layerOrder, projects } from "./projects";

const approvedLinks: Record<string, { label: string; href: string }[]> = {
  "gundem-ai": [],
  "wc2026-ai-simulator": [
    { label: "GitHub deposunu aç", href: "https://github.com/cemyildizcy/wc2026-ai-simulator" },
    { label: "Canlı demoyu aç", href: "https://wc2026-ai-simulator.streamlit.app" },
  ],
  sleepinfo: [
    { label: "GitHub deposunu aç", href: "https://github.com/cemyildizcy/uyku-sagligi-tahmincisi" },
    { label: "Ürünü aç", href: "https://sleepinfo.com.tr" },
  ],
};

const approvedLimits: Record<string, string> = {
  "gundem-ai":
    "Proje geliştirme aşamasında. Bu nedenle henüz teknik performans veya kullanım sonucu iddiasında bulunmuyorum.",
  "wc2026-ai-simulator":
    "Sonuçlar olasılık tahminidir; maç sonucu garantisi değildir. Veri kalitesi ve model varsayımları tahminleri sınırlar.",
  sleepinfo:
    "Bu bir eğitim projesidir ve tıbbi tavsiye vermez. Model sonucu klinik değerlendirme yerine kullanılamaz.",
};

describe("evidence catalog", () => {
  it("contains exactly the three approved projects", () => {
    expect(projects.map((project) => project.slug)).toEqual(["gundem-ai", "wc2026-ai-simulator", "sleepinfo"]);
  });

  it("models every truthful evidence layer", () => {
    expect(layerOrder).toEqual(["output", "decision", "ai", "limits"]);

    for (const project of projects) {
      expect(Object.keys(project.layers)).toEqual(["output", "decision", "ai", "limits"]);
      for (const key of layerOrder) {
        const layer = project.layers[key];
        expect(layer.title).toBeTruthy();
        expect(layer.body).toBeTruthy();
        expect(layer.facts.length).toBeGreaterThan(0);
        expect(layer.facts.every(Boolean)).toBe(true);
        expect(layer.note).toBeTruthy();
      }
      expect(project.caseHref).toBe(`/work/${project.slug}`);
    }
  });

  it("keeps authorship, evidence, links, and limitations explicit", () => {
    for (const project of projects) {
      expect(project.contribution.length).toBeGreaterThan(0);
      expect(project.aiRole.length).toBeGreaterThan(0);
      expect(project.evidence.length).toBeGreaterThan(0);
      expect(project.links).toEqual(approvedLinks[project.slug]);
      expect(project.limits).toBe(approvedLimits[project.slug]);
      expect(getProject(project.slug)).toBe(project);
    }
  });

  it("keeps the approved WC2026 evidence image", () => {
    expect(getProject("wc2026-ai-simulator")?.image?.src).toBe(
      "/images/projects/wc2026/champion-probabilities.png",
    );
  });

  it("returns undefined for unknown work", () => expect(getProject("missing")).toBeUndefined());
});
