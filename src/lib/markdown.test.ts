import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";

const articlePath = path.join(
  process.cwd(),
  "content/blog/cross-validation-stratejisi-nasil-secilir.md",
);
const article = fs.readFileSync(articlePath, "utf8").replace(/\r\n?/g, "\n");

describe("automated blog Markdown quality", () => {
  it("uses language-qualified fences without collapsed Python statements", () => {
    expect(article).not.toMatch(/^```\s*\npython$/m);
    expect(article).not.toMatch(/[^\n]\n```python/g);
    expect(article.match(/^```python$/gm)).toHaveLength(7);
    expect(article).not.toMatch(/\)[ \t]{4,}[a-z_]+\s*=/i);
    expect(article).toContain("results = cross_validate(\n");
    expect(article).toContain(
      "for train_idx, valid_idx in cv.split(X, y, groups):\n    train_groups",
    );
  });

  it("keeps the selection table as one valid three-column Markdown table", () => {
    const rows = article
      .split("\n")
      .filter((line) => line.startsWith("| ") && line.endsWith(" |"));

    expect(rows).toContain("| Veri yapısı | Uygun başlangıç | Temel kontrol |");
    expect(article).toContain("| --- | --- | --- |");
    expect(rows).toHaveLength(7);
    for (const row of rows) expect(row.split("|")).toHaveLength(5);
  });

  it("keeps every source link on one line with a complete HTTPS URL", () => {
    const sources = article
      .split("\n")
      .filter((line) => /^\d+\. \[/.test(line));

    expect(sources).toHaveLength(6);
    for (const source of sources) {
      expect(source).toMatch(/^\d+\. \[[^\]]+\]\(https:\/\/[^\s)]+\)$/);
    }
    expect(article).not.toMatch(/\]\(https:\/\/\s*$/m);
  });
});

describe("renderMarkdown", () => {
  it("renders safe external links, fenced code, and tables", () => {
    const html = renderMarkdown(`## Kaynaklar

1. [scikit-learn](https://scikit-learn.org/stable/)

\`\`\`python
value = "<unsafe>"
\`\`\`

| Yöntem | Kontrol |
| --- | --- |
| \`KFold\` | **Sıralama** |
`);

    expect(html).toContain(
      '<a href="https://scikit-learn.org/stable/" rel="noopener noreferrer">scikit-learn</a>',
    );
    expect(html).toContain('<pre><code class="language-python">');
    expect(html).toContain('value = &quot;&lt;unsafe&gt;&quot;');
    expect(html).toContain("<table>");
    expect(html).toContain("<thead>");
    expect(html).toContain("<tbody>");
    expect(html).toContain("<code>KFold</code>");
    expect(html).toContain("<strong>Sıralama</strong>");
  });

  it("escapes unsafe HTML and rejects unsafe link protocols", () => {
    const html = renderMarkdown(
      '<img src=x onerror=alert(1)> [kötü](javascript:alert(1))',
    );

    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).not.toContain("<img");
    expect(html).not.toContain('href="javascript:');
  });
});

const calibrationPath = path.join(
  process.cwd(),
  "content/blog/siniflandirici-kalibrasyonu-predict-proba-guvenilirligi.md",
);
const calibrationArticle = fs.readFileSync(calibrationPath, "utf8").replace(/\r\n?/g, "\n");

describe("calibration article Markdown quality", () => {
  it("uses language-qualified fences without collapsed Python statements", () => {
    expect(calibrationArticle).not.toMatch(/^\`\`\`\s*\npython$/m);
    expect(calibrationArticle).not.toMatch(/[^\n]\n\`\`\`python/g);
    expect(calibrationArticle.match(/^\`\`\`python$/gm)).toHaveLength(4);
    expect(calibrationArticle).toContain("from sklearn.calibration import calibration_curve");
    expect(calibrationArticle).toContain("from sklearn.metrics import brier_score_loss");
  });

  it("keeps the comparison table as one valid five-column Markdown table", () => {
    const rows = calibrationArticle
      .split("\n")
      .filter((line) => line.startsWith("| ") && line.endsWith(" |"));

    expect(rows).toContain("| Model türü | Tipik bozulma | Önerilen kalibrasyon | Asgari doğrulama boyutu | Temel risk |");
    expect(calibrationArticle).toContain("| --- | --- | --- | --- | --- |");
    expect(rows).toHaveLength(7);
    for (const row of rows) expect(row.split("|")).toHaveLength(7);
  });

  it("keeps every source link on one line with a complete HTTPS URL", () => {
    const sources = calibrationArticle
      .split("\n")
      .filter((line) => /^\d+\. \[/.test(line));

    expect(sources).toHaveLength(6);
    for (const source of sources) {
      expect(source).toMatch(/^\d+\. \[[^\]]+\]\(https:\/\/[^\s)]+\)$/);
    }
    expect(calibrationArticle).not.toMatch(/\]\(https:\/\/\s*$/m);
  });

  it("renders safe HTML without unescaped tags or broken blocks", () => {
    const html = renderMarkdown(calibrationArticle);
    expect(html).toContain('<pre><code class="language-python">');
    expect(html).toContain("<table><thead><tr>");
    expect(html).toContain('<a href="https://scikit-learn.org/stable/modules/calibration.html" rel="noopener noreferrer">scikit-learn: Probability calibration</a>');
    expect(html).toContain('<a href="https://arxiv.org/abs/1706.04599" rel="noopener noreferrer">Guo et al. (2017): On Calibration of Modern Neural Networks</a>');
  });
});
