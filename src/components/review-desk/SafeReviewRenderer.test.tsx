import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SafeReviewRenderer } from "./SafeReviewRenderer";

const baseProps = {
  verifiedFindings: [],
  rejectedFindings: [],
  verdict: null,
  verdictSummary: null,
  receipt: null,
};

describe("SafeReviewRenderer", () => {
  it("does not render raw provider role summaries", () => {
    const maliciousSummary = "<script>role-provider-summary-leak</script>";
    const html = renderToStaticMarkup(
      <SafeReviewRenderer
        {...baseProps}
        roleOutputs={[
          { role: "researcher", summary: maliciousSummary, findings: [] },
        ]}
      />,
    );

    expect(html).not.toContain("role-provider-summary-leak");
    expect(html).not.toContain(maliciousSummary);
    expect(html).toContain("Araştırmacı");
    expect(html).toContain("Rol tamamlandı");
  });

  it("renders only server-owned finding presentation text", () => {
    const maliciousSummary = "<img src=x onerror=finding-provider-summary-leak>";
    const html = renderToStaticMarkup(
      <SafeReviewRenderer
        {...baseProps}
        roleOutputs={[]}
        verifiedFindings={[
          {
            findingId: "f-safe-render",
            propositionId: "prop-ml-1",
            stance: "supports",
            summary: "Modern sinir ağlarının zayıf kalibre edilebilmesi, doğruluğun tek başına güvenilirlik kanıtı olmadığını gösterir.",
            verified: true,
            citations: [{
              sourceId: "src-ml-guo-2017",
              url: "https://arxiv.org/abs/1706.04599v2",
              quote: "We discover that modern neural networks, unlike those from a decade ago, are poorly calibrated.",
              locator: "Abstract, arXiv v2 landing page",
            }],
          },
        ]}
      />,
    );

    expect(html).not.toContain(maliciousSummary);
    expect(html).not.toContain("finding-provider-summary-leak");
    expect(html).toContain("Modern sinir ağlarının zayıf kalibre edilebilmesi");
  });
});
