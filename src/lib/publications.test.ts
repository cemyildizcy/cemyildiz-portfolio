import { describe, expect, it } from "vitest";
import { getPublication, getPublications, publicProject } from "./publications";

describe("public portfolio publications", () => {
  it("loads only the public projection, newest first, with stable IDs", () => {
    const entries = getPublications();
    expect(entries.length).toBeGreaterThan(0);
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(entries.length);
    expect(entries.map((entry) => entry.date)).toEqual(entries.map((entry) => entry.date).sort().reverse());
    expect(JSON.stringify(entries)).not.toMatch(/\/home\/|109\.236\.|source_ref|sha256|api_key/i);
  });
  it("resolves the portfolio rebuild as work in progress, not a finished deployment", () => {
    const entry = getPublication("portfolio-yenileme");
    expect(entry?.status).toBe("in-progress");
    expect(getPublication("../private")).toBeUndefined();
  });
  it("adapts a published project without inventing evidence or contribution", () => {
    const entry = getPublication("portfolio-yenileme")!;
    const project = publicProject(entry);
    expect(project.slug).toBe(entry.id);
    expect(project.evidence).toEqual(entry.outcomes);
    expect(project.contribution).toEqual(entry.contribution);
    expect(project.limits).toBe(entry.limitations);
  });
});
