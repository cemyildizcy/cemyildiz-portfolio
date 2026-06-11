import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectBySlug, projectCaseStudies } from '@/data/projectHelpers';

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
    title: `${project.title} | Cem Yıldız`,
    description: project.description,
  };
}

export default async function ProjectCaseStudyPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] pt-28">
      <section className="border-b border-[var(--border-color)]">
        <div className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
          <Link href="/#projeler" className="text-sm font-semibold text-[var(--accent)]">← Projelere dön</Link>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">{project.category}</p>
              <h1 className="mt-4 max-w-5xl text-balance text-5xl font-semibold tracking-[-0.05em] sm:text-7xl">
                {project.title}
              </h1>
              <p className="mt-7 max-w-3xl text-pretty text-lg leading-8 text-[var(--text-secondary)]">
                {project.description}
              </p>
            </div>
            <aside className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface)] p-6">
              <p className="text-sm text-[var(--text-secondary)]">Öne çıkan sonuç</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight">{project.result}</p>
              <div className="mt-8 grid gap-3">
                {project.liveUrl && <Link href={project.liveUrl} target="_blank" className="rounded-full bg-[var(--text-primary)] px-5 py-3 text-center text-sm font-semibold text-[var(--bg)]">Canlı demo / dashboard</Link>}
                {project.githubUrl && <Link href={project.githubUrl} target="_blank" className="rounded-full border border-[var(--border-color)] px-5 py-3 text-center text-sm font-semibold">GitHub reposu</Link>}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-12 sm:grid-cols-3 lg:px-8">
        <InfoCard label="Dönem" value={project.timeline} />
        <InfoCard label="Stack" value={`${project.technologies.length} teknoloji`} />
        <InfoCard label="Format" value="Case study" />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        {project.visual && (
          <div className="mb-6 overflow-hidden rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface)] p-4">
            <div className="relative aspect-[16/7] overflow-hidden rounded-[1.5rem] bg-[var(--panel)]">
              <Image src={project.visual} alt={`${project.title} görsel çıktısı`} fill sizes="(min-width: 1024px) 1120px, 100vw" className="object-cover" />
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--panel)] p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">Problem</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Neyi çözmeye çalıştı?</h2>
            <p className="mt-5 leading-8 text-[var(--text-secondary)]">{project.problem}</p>
          </div>
          <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface)] p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">Yaklaşım</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Veriden çıktıya giden yol</h2>
            <p className="mt-5 leading-8 text-[var(--text-secondary)]">{project.approach}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface)] p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">Highlights</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {project.highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg)] p-5 text-sm leading-6 text-[var(--text-secondary)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--panel)] p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">Tech stack</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span key={tech} className="rounded-full border border-[var(--border-color)] bg-[var(--surface)] px-3 py-1 text-sm text-[var(--text-secondary)]">{tech}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <CaseList title="Çıktılar" items={project.outputs} />
          <CaseList title="Öğrendiklerim" items={project.learnings} />
          <CaseList title="Sonraki iyileştirme" items={project.nextSteps} />
        </div>

        {project.linkedinPostId && (
          <div className="mt-12 rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface)] p-8">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">BUILD IN PUBLIC</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Proje süreci</h2>
              </div>
              <Link href="https://www.linkedin.com/in/cemyildizcy/" target="_blank" className="rounded-full bg-[#0a66c2] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
                LinkedIn'de takip et
              </Link>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-white h-[460px] w-full max-w-3xl mx-auto shadow-sm">
              <iframe 
                src={`https://www.linkedin.com/embed/feed/update/urn:li:${project.linkedinPostId}`} 
                height="100%" 
                width="100%" 
                frameBorder="0" 
                allowFullScreen 
                title={`${project.title} LinkedIn gönderisi`}
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function CaseList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface)] p-7">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <p key={item} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg)] p-4 text-sm leading-6 text-[var(--text-secondary)]">{item}</p>
        ))}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--surface)] p-6">
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
