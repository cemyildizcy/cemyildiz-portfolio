import { describe, expect, it } from "vitest";
import { getProject, projects } from "./projects";

const expectedLinks: Record<string, { label: string; href: string }[]> = {
  "gundem-ai": [
    {
      label: "Google Play'de görüntüle",
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
  "bike-demand-temporal-ml": [
    { label: "GitHub deposunu aç", href: "https://github.com/cemyildizcy/bike-demand-temporal-ml" },
    {
      label: "Test sonuçlarını gör",
      href: "https://github.com/cemyildizcy/bike-demand-temporal-ml/blob/main/reports/2026-09-22-bike-demand-results.md",
    },
    { label: "UCI veri kaynağını gör", href: "https://doi.org/10.24432/C5W894" },
  ],
  "fashion-mnist-numpy-capacity": [
    {
      label: "GitHub deposunu aç",
      href: "https://github.com/cemyildizcy/fashion-mnist-numpy-capacity",
    },
    {
      label: "Dondurulmuş sonuç raporunu gör",
      href: "https://github.com/cemyildizcy/fashion-mnist-numpy-capacity/blob/36ac847/reports/results.json",
    },
    {
      label: "Deney yöntemini oku",
      href: "https://github.com/cemyildizcy/fashion-mnist-numpy-capacity/blob/36ac847/README.md",
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
  it("keeps the project catalog routes available", () => {
    expect(new Set(projects.map((project) => project.slug))).toEqual(new Set([
      "gundem-ai",
      "sleepinfo",
      "wc2026-ai-simulator",
      "bike-demand-temporal-ml",
      "fashion-mnist-numpy-capacity",
    ]));
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
    expect(getProject("sleepinfo")?.limits).toMatch(/model metriklerini bağımsız doğrulamadım/i);
    expect(getProject("wc2026-ai-simulator")?.image).toMatchObject({
      src: "/images/projects/wc2026/champion-probabilities.png",
      alt: expect.stringContaining("çıktı grafiği"),
    });
    expect(getProject("bike-demand-temporal-ml")?.image).toMatchObject({
      src: "/images/projects/bike-demand/temporal-test-mae.svg",
      alt: expect.stringContaining("77.79"),
    });
    expect(getProject("fashion-mnist-numpy-capacity")?.image).toMatchObject({
      src: "/images/projects/fashion-mnist/clean-test-accuracy.svg",
      alt: expect.stringContaining("%87.03"),
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

  it("reports Bike Demand metrics with the temporal holdout limits", () => {
    const bike = getProject("bike-demand-temporal-ml");
    expect(bike?.evidence.join(" ")).toContain("MAE 77.79");
    expect(bike?.evidence.join(" ")).toContain("103.54");
    expect(bike?.limits).toMatch(/iki yıllık veri/i);
    expect(bike?.limits).toMatch(/geçmiş gözlemler/i);
    expect(bike?.short).toMatch(/gözlenen hava durumu Ridge/);
  });

  it("reports the Fashion-MNIST NumPy comparison with its test and reproducibility limits", () => {
    const fashionMnist = getProject("fashion-mnist-numpy-capacity");
    expect(fashionMnist?.evidence.join(" ")).toContain("%87.03");
    expect(fashionMnist?.evidence.join(" ")).toContain("%83.56");
    expect(fashionMnist?.evidence.join(" ")).toContain("10.000");
    expect(fashionMnist?.limits).toMatch(/tek seed/i);
    expect(fashionMnist?.limits).toMatch(/tek.*split/i);
    expect(fashionMnist?.limits).toMatch(/sentetik/i);
    expect(fashionMnist?.aiRole).toMatch(/AI desteği/i);
  });

  it("returns undefined for unknown work", () => {
    expect(getProject("missing")).toBeUndefined();
  });
});
