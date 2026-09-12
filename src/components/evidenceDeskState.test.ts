import { describe, expect, it } from "vitest";
import {
  initialEvidenceDeskState,
  selectLayer,
  selectProject,
} from "./evidenceDeskState";

describe("evidence desk state", () => {
  it("starts with the WC2026 output layer", () => {
    expect(initialEvidenceDeskState).toEqual({
      projectSlug: "wc2026-ai-simulator",
      layer: "output",
    });
  });

  it("changes only the active layer", () => {
    expect(selectLayer(initialEvidenceDeskState, "limits")).toEqual({
      projectSlug: "wc2026-ai-simulator",
      layer: "limits",
    });
  });

  it("resets the layer to output whenever the project changes", () => {
    const current = selectLayer(initialEvidenceDeskState, "ai");

    expect(selectProject(current, "sleepinfo")).toEqual({
      projectSlug: "sleepinfo",
      layer: "output",
    });
  });

  it("ignores unknown project slug and keeps valid projectSlug without diverging", () => {
    const current = selectLayer(initialEvidenceDeskState, "ai");

    expect(selectProject(current, "unknown-project-slug")).toEqual({
      projectSlug: "wc2026-ai-simulator",
      layer: "output",
    });

    const sleepinfoState = selectProject(initialEvidenceDeskState, "sleepinfo");
    expect(selectProject(sleepinfoState, "another-invalid-slug")).toEqual({
      projectSlug: "sleepinfo",
      layer: "output",
    });
  });
});
