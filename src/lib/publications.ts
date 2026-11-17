import projection from "../../content/updates.json";
import type { Project } from "@/data/projects";

export type Publication = {
  id: string; type: string; title: string; summary: string; date: string;
  status: string; tags: string[]; problem: string; outcomes: string[];
  contribution: string[]; aiRole: string; limitations: string;
  paragraphs: string[]; links: { label: string; href: string }[];
};
export function getPublications(): Publication[] {
  return [...projection.entries].sort((a, b) => b.date.localeCompare(a.date));
}
export function getPublication(id: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)
    ? getPublications().find((entry) => entry.id === id) : undefined;
}
export const statusLabel = (status: string) => ({
  "in-progress": "Geliştiriliyor", completed: "Tamamlandı", published: "Yayında",
}[status] ?? "Çalışma notu");
export function publicProject(entry: Publication): Project {
  return {
    slug: entry.id, title: entry.title, short: entry.summary,
    status: statusLabel(entry.status), premise: entry.problem,
    evidence: entry.outcomes, contribution: entry.contribution,
    aiRole: entry.aiRole, limits: entry.limitations, links: entry.links,
    note: entry.paragraphs.join("\n\n"), caseHref: `/work/${entry.id}`,
    image: { src: "/images/profile.jpg", alt: "Cem Yıldız", width: 400, height: 400 },
  };
}
