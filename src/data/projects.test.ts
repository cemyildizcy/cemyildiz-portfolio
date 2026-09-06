import { describe, expect, it } from "vitest";
import { getProject, projects } from "./projects";

describe("evidence catalog", () => {
  it("contains exactly the three approved projects", () => {
    expect(projects.map((project) => project.slug)).toEqual(["gundem-ai", "wc2026-ai-simulator", "sleepinfo"]);
  });
  it("keeps authorship and evidence explicit", () => {
    for (const project of projects) {
      expect(project.contribution.length).toBeGreaterThan(0);
      expect(project.aiRole.length).toBeGreaterThan(0);
      expect(project.evidence.length).toBeGreaterThan(0);
      expect(getProject(project.slug)).toBe(project);
    }
  });
  it("returns undefined for unknown work", () => expect(getProject("missing")).toBeUndefined());
});
