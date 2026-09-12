import { projects, type LayerKey } from "@/data/projects";

export type EvidenceDeskState = {
  projectSlug: string;
  layer: LayerKey;
};

export const initialEvidenceDeskState: EvidenceDeskState = {
  projectSlug: "wc2026-ai-simulator",
  layer: "output",
};

export function selectLayer(
  state: EvidenceDeskState,
  layer: LayerKey,
): EvidenceDeskState {
  return { ...state, layer };
}

export function selectProject(
  current: EvidenceDeskState,
  projectSlug: string,
): EvidenceDeskState {
  const isKnown = projects.some((project) => project.slug === projectSlug);
  return {
    projectSlug: isKnown ? projectSlug : current.projectSlug,
    layer: "output",
  };
}
