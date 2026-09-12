import type { LayerKey } from "@/data/projects";

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
  _state: EvidenceDeskState,
  projectSlug: string,
): EvidenceDeskState {
  return { projectSlug, layer: "output" };
}
