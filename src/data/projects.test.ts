import { describe, expect, it } from "vitest";
import { getProject, projects } from "./projects";

const expectedLinks: Record<string, { label: string; href: string }[]> = {
  "gundem-ai": [
    {
      label: "Google Play'de aç",
      href: "https://play.google.com/store/apps/details?id=com.gundemai.app",
    },
  ],
  sleepinfo: [
    { label: "Ürünü aç", href: "https://sleepinfo.com.tr" },
    {
      label: "GitHub deposunu aç",
      href: "https://github.com/cemyildizcy/uyku-sagligi-tahmincisi",
    },
  ],
  "wc2026-ai-simulator": [
    {
      label: "GitHub deposunu aç",
      href: "https://github.com/cemyildizcy/wc2026-ai-simulator",
    },
  ],
};

describe("project catalog", () => {
  it("keeps the three projects in their intended visual priority", () => {
    expect(projects.map((project) => project.slug)).toEqual([
      "gundem-ai",
      "sleepinfo",
      "wc2026-ai-simulator",
    ]);
  });

  it("records truthful status, links, and real product imagery", () => {
    expect(getProject("gundem-ai")).toMatchObject({
      status: "Google Play'de yayında",
      image: {
        src: "/images/projects/gundemai/bugunun-gundemi.png",
        alt: expect.stringContaining("gerçek Google Play ekran görüntüsü"),
      },
    });
    expect(getProject("sleepinfo")?.image).toMatchObject({
      src: "/images/projects/sleepinfo/hero.png",
      alt: expect.stringContaining("ürün deposundaki özgün hero illüstrasyonu"),
    });
    expect(getProject("wc2026-ai-simulator")?.image).toMatchObject({
      src: "/images/projects/wc2026/champion-probabilities.png",
      alt: expect.stringContaining("çıktı grafiği"),
    });

    for (const project of projects) {
      expect(project.links).toEqual(expectedLinks[project.slug]);
      expect(project.caseHref).toBe(`/work/${project.slug}`);
      expect(project.evidence.length).toBeGreaterThan(0);
      expect(project.contribution.length).toBeGreaterThan(0);
      expect(project.limits).toBeTruthy();
      expect(getProject(project.slug)).toBe(project);
    }
  });

  it("does not expose agent-orchestration theater or a broken WC2026 demo", () => {
    const serialized = JSON.stringify(projects);
    expect(serialized).not.toMatch(/orchestration|Nolan|Marcus|Liam|Felix|Ethan/i);
    expect(serialized).not.toContain("wc2026-ai-simulator.streamlit.app");
    expect(serialized).not.toMatch(/Geliştiriliyor|herkese açık depo veya demo hazır olduğunda/i);
  });

  it("describes WC2026 as statistical simulation rather than trained ML", () => {
    const wc2026 = getProject("wc2026-ai-simulator");
    expect(`${wc2026?.short} ${wc2026?.premise}`).toMatch(/Poisson/);
    expect(`${wc2026?.short} ${wc2026?.premise}`).toMatch(/Monte Carlo/);
    expect(`${wc2026?.short} ${wc2026?.premise}`).toMatch(/eğitim/i);
    expect(`${wc2026?.short} ${wc2026?.premise}`).not.toMatch(/eğitilmiş makine öğrenmesi/i);
  });

  it("returns undefined for unknown work", () => {
    expect(getProject("missing")).toBeUndefined();
  });
});
