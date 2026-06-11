import { portfolioData, type Project } from './portfolio';

export function slugifyProject(title: string) {
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const projectCaseStudies = portfolioData.projects.map((project) => ({
  ...project,
  slug: project.id === 7 ? 'wc2026-ai-simulator' : slugifyProject(project.title),
  category: inferCategory(project),
  result: project.highlights[0] ?? 'Uçtan uca proje çıktısı',
  timeline: project.id === 7 ? 'Hafta 6' : `Proje ${project.id}`,
}));

export type ProjectCaseStudy = Project & {
  slug: string;
  category: string;
  result: string;
  timeline: string;
};

export function getProjectBySlug(slug: string) {
  return projectCaseStudies.find((project) => project.slug === slug);
}

function inferCategory(project: Project) {
  const text = `${project.title} ${project.description} ${project.technologies.join(' ')}`.toLowerCase();
  if (text.includes('simülatör') || text.includes('monte carlo')) return 'Sports Analytics / Simulation';
  if (text.includes('deprem')) return 'Risk Analytics';
  if (text.includes('uyku') || text.includes('sleep')) return 'Health AI';
  if (text.includes('churn')) return 'Business Analytics';
  if (text.includes('asteroid')) return 'API Data Product';
  if (text.includes('oyun')) return 'Web Product';
  return 'Machine Learning';
}
