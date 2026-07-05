import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectBySlug, projectCaseStudies } from '@/data/projectHelpers';
import { ArrowLeft, ExternalLink, ChevronRight } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';

export function generateStaticParams() {
  return projectCaseStudies.map((project) => ({ slug: project.slug }));
}

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Case Study | Cem Yıldız`,
    description: project.description,
  };
}

export default async function ProjectCaseStudyPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  // Find next project for CTA
  const currentIndex = projectCaseStudies.findIndex((p) => p.slug === slug);
  const nextProject =
    projectCaseStudies[(currentIndex + 1) % projectCaseStudies.length];

  return (
    <main className="min-h-screen bg-background text-text">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="border-b border-border pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="mx-auto max-w-[var(--container)] px-[var(--gutter-mobile)] md:px-[var(--gutter-tablet)] lg:px-[var(--gutter-desktop)]">
          {/* Back link */}
          <Link
            href="/#projects"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Projelere dön
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
            {/* Left: title & description */}
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                {project.category}
              </p>
              <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
                {project.title}
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-text-muted">
                {project.description}
              </p>

              {/* Link row */}
              <div className="mt-8 flex flex-wrap gap-3">
                {project.liveUrl && (
                  <Link
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
                  >
                    Canlı Demo
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
                {project.githubUrl && (
                  <Link
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-border-strong bg-surface px-5 py-2.5 text-sm font-semibold transition-all hover:border-accent hover:-translate-y-0.5"
                  >
                    <FaGithub className="h-4 w-4" />
                    GitHub
                  </Link>
                )}
              </div>
            </div>

            {/* Right: sticky aside */}
            <aside className="top-28 rounded-[var(--radius-md)] border border-border bg-surface p-6 lg:sticky">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-text-soft">
                Öne çıkan sonuç
              </p>
              <p className="mt-3 text-xl font-semibold tracking-tight">
                {project.result}
              </p>

              <hr className="my-5 border-border" />

              <dl className="grid gap-4 text-sm">
                <div>
                  <dt className="text-text-soft">Dönem</dt>
                  <dd className="mt-1 font-medium">{project.timeline}</dd>
                </div>
                <div>
                  <dt className="text-text-soft">Stack</dt>
                  <dd className="mt-1 font-medium">
                    {project.technologies.length} teknoloji
                  </dd>
                </div>
                <div>
                  <dt className="text-text-soft">Format</dt>
                  <dd className="mt-1 font-medium">Case study</dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Outcome bar ──────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[var(--container)] gap-px bg-border sm:grid-cols-4 px-0">
          {project.highlights.slice(0, 4).map((h) => (
            <div
              key={h}
              className="bg-background px-6 py-5 text-center text-sm font-medium text-text-muted"
            >
              {h}
            </div>
          ))}
        </div>
      </section>

      {/* ── Visual ───────────────────────────────────── */}
      <section className="mx-auto max-w-[var(--container)] px-[var(--gutter-mobile)] pt-12 md:px-[var(--gutter-tablet)] lg:px-[var(--gutter-desktop)]">
        {project.visual && (
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface p-3 md:p-4">
            <div className="relative aspect-[16/8] overflow-hidden rounded-[var(--radius-md)] bg-surface-muted">
              <Image
                src={project.visual}
                alt={`${project.title} — proje çıktısı görseli`}
                fill
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}
      </section>

      {/* ── Case study sections ──────────────────────── */}
      <section className="mx-auto max-w-[var(--container)] px-[var(--gutter-mobile)] py-12 md:px-[var(--gutter-tablet)] md:py-16 lg:px-[var(--gutter-desktop)]">
        {/* Problem & Approach — two columns */}
        <div className="grid gap-6 lg:grid-cols-2">
          <CaseCard
            eyebrow="Problem"
            title="Neyi çözmeye çalıştı?"
            body={project.problem}
          />
          <CaseCard
            eyebrow="Yaklaşım"
            title="Veriden çıktıya giden yol"
            body={project.approach}
          />
        </div>

        {/* Highlights & Tech stack */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[var(--radius-md)] border border-border bg-surface p-7">
            <h2 className="text-lg font-semibold tracking-tight">
              Öne Çıkanlar
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {project.highlights.map((h) => (
                <div
                  key={h}
                  className="rounded-[var(--radius-sm)] border border-border bg-surface-muted p-4 text-sm leading-relaxed text-text-muted"
                >
                  {h}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-md)] border border-border bg-surface p-7">
            <h2 className="text-lg font-semibold tracking-tight">
              Teknoloji Stack&apos;i
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.technologies.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-surface-muted px-3.5 py-1.5 text-xs font-medium text-text-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Outputs / Learnings / Next steps */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <BulletCard title="Çıktılar" items={project.outputs} />
          <BulletCard title="Öğrendiklerim" items={project.learnings} />
          <BulletCard title="Sonraki İyileştirme" items={project.nextSteps} />
        </div>
      </section>

      {/* ── Next project CTA ─────────────────────────── */}
      {nextProject && nextProject.slug !== slug && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-[var(--container)] px-[var(--gutter-mobile)] py-16 md:px-[var(--gutter-tablet)] md:py-20 lg:px-[var(--gutter-desktop)]">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-text-soft">
              Sonraki Proje
            </p>
            <Link
              href={`/projects/${nextProject.slug}`}
              className="group mt-4 flex items-center justify-between gap-4"
            >
              <div>
                <h3 className="text-2xl font-semibold tracking-tight transition-colors group-hover:text-accent md:text-3xl">
                  {nextProject.title}
                </h3>
                <p className="mt-2 max-w-xl text-sm text-text-muted">
                  {nextProject.category}
                </p>
              </div>
              <ChevronRight className="h-6 w-6 flex-shrink-0 text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

/* ── Helper components ────────────────────────────────────── */

function CaseCard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-surface p-7 md:p-8">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-xl font-semibold tracking-tight md:text-2xl">
        {title}
      </h2>
      <p className="mt-4 leading-relaxed text-text-muted">{body}</p>
    </div>
  );
}

function BulletCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-surface p-6">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <ul className="mt-4 grid gap-2.5">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-[var(--radius-sm)] border border-border bg-surface-muted p-3.5 text-sm leading-relaxed text-text-muted"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
