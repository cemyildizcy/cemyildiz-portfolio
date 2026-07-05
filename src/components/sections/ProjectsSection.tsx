'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { projectCaseStudies, getFeaturedProjects } from '@/data/projectHelpers';
import { ExternalLink } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';

export function ProjectsSection() {
  const prefersReducedMotion = useReducedMotion();
  const featured = getFeaturedProjects();
  const rest = projectCaseStudies.filter((p) => !p.featured);

  return (
    <section
      id="projects"
      className="py-20 sm:py-24 md:py-[96px]"
    >
      <div className="mx-auto max-w-[var(--container)] px-[var(--gutter-mobile)] sm:px-[var(--gutter-tablet)] lg:px-[var(--gutter-desktop)]">
        <SectionHeading
          title="Seçili projeler"
          subtitle="Notebook değil; problem, veri, model ve çıktısıyla anlatılan işler."
          align="left"
        />

        {/* ─── Featured projects ─── */}
        <div className="grid gap-6 md:grid-cols-2">
          {featured.map((project, i) => (
            <ScrollReveal key={project.id} delay={i * 0.1}>
              <ProjectCard project={project} featured />
            </ScrollReveal>
          ))}
        </div>

        {/* ─── Other projects ─── */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((project, i) => (
            <ScrollReveal key={project.id} delay={i * 0.08}>
              <ProjectCard project={project} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Project Card ─── */

interface ProjectCardProps {
  project: (typeof projectCaseStudies)[number];
  featured?: boolean;
}

function ProjectCard({ project, featured = false }: ProjectCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-[var(--radius-lg)] border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-[3px] hover:border-accent hover:shadow-[var(--shadow-md)] md:p-7">
      {/* Category + title */}
      <p className="mb-2 font-mono text-xs text-text-soft">{project.category}</p>
      <h3 className="text-xl font-semibold tracking-[-0.02em] text-text">
        {project.title}
      </h3>

      {/* Description */}
      <p className="mt-3 flex-grow text-sm leading-relaxed text-text-muted line-clamp-3">
        {project.description}
      </p>

      {/* Tech badges */}
      <div className="mt-4 flex flex-wrap gap-2">
        {project.technologies.slice(0, featured ? 5 : 4).map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs text-text-muted"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Links */}
      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-sm">
        <Link
          href={`/projects/${project.slug}`}
          className="font-semibold text-accent transition-colors hover:text-accent/80"
        >
          Case study →
        </Link>
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-text-muted transition-colors hover:text-text"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Demo
          </a>
        )}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-text-muted transition-colors hover:text-text"
          >
            <FaGithub className="h-3.5 w-3.5" aria-hidden="true" />
            GitHub
          </a>
        )}
      </div>
    </article>
  );
}
