import Image from 'next/image';
import Link from 'next/link';
import { portfolioData } from '@/data/portfolio';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa6';
import { Mail, MapPin, GraduationCap, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Hakkımda | Cem Yıldız',
  description:
    'Cem Yıldız — ESOGÜ Mat-Bil öğrencisi. Veri bilimi, makine öğrenimi ve spor analitiği.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-text">
      {/* ── Hero: portrait + story ───────────────────── */}
      <section className="border-b border-border pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="mx-auto grid max-w-[var(--container)] gap-10 px-[var(--gutter-mobile)] md:px-[var(--gutter-tablet)] lg:grid-cols-[320px_1fr] lg:items-start lg:gap-16 lg:px-[var(--gutter-desktop)]">
          {/* Portrait */}
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface p-2.5 shadow-[var(--shadow-md)] lg:mx-0">
            <Image
              src="/images/profile.jpg"
              alt="Cem Yıldız profil fotoğrafı"
              fill
              priority
              sizes="(min-width: 1024px) 320px, 280px"
              className="rounded-[var(--radius-md)] object-cover object-center"
            />
          </div>

          {/* Story */}
          <div className="flex flex-col justify-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              Hakkımda
            </p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] md:text-4xl lg:text-5xl">
              Model kuran, anlatan ve ürüne çeviren öğrenci.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-text-muted md:text-lg md:leading-relaxed">
              {portfolioData.about.description}
            </p>

            {/* Quick info chips */}
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-text-soft">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {portfolioData.about.location}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                {portfolioData.education[0].institution}
              </span>
            </div>

            {/* CTA row */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/#projects"
                className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-text px-5 py-2.5 text-sm font-semibold text-text-inverse transition-transform hover:-translate-y-0.5"
              >
                Projeler
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={`mailto:${portfolioData.about.email}`}
                className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-border-strong px-5 py-2.5 text-sm font-semibold transition-all hover:border-accent hover:-translate-y-0.5"
              >
                <Mail className="h-3.5 w-3.5" />
                Mail gönder
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Current focus ────────────────────────────── */}
      <section className="border-b border-border py-12 md:py-16">
        <div className="mx-auto max-w-[var(--container)] px-[var(--gutter-mobile)] md:px-[var(--gutter-tablet)] lg:px-[var(--gutter-desktop)]">
          <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-text-soft">
            Şu an neye odaklanıyorum?
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {portfolioData.about.currentFocus.map((focus) => (
              <div
                key={focus}
                className="rounded-[var(--radius-md)] border border-border bg-surface p-5 text-center"
              >
                <p className="font-medium tracking-tight">{focus}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Skills matrix ────────────────────────────── */}
      <section className="border-b border-border py-12 md:py-16">
        <div className="mx-auto max-w-[var(--container)] px-[var(--gutter-mobile)] md:px-[var(--gutter-tablet)] lg:px-[var(--gutter-desktop)]">
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            Yetenekler
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portfolioData.skills.map((skill) => (
              <div
                key={skill.category}
                className="rounded-[var(--radius-md)] border border-border bg-surface p-6"
              >
                <h3 className="font-semibold tracking-tight">
                  {skill.category}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  {skill.items.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────── */}
      <section className="border-b border-border py-12 md:py-16">
        <div className="mx-auto max-w-[var(--container)] px-[var(--gutter-mobile)] md:px-[var(--gutter-tablet)] lg:px-[var(--gutter-desktop)]">
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            Eğitim
          </h2>
          <div className="mt-6 grid gap-4">
            {portfolioData.education.map((edu) => (
              <div
                key={edu.institution}
                className="rounded-[var(--radius-md)] border border-border bg-surface p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{edu.institution}</h3>
                    <p className="mt-1 text-sm text-text-muted">
                      {edu.degree} — {edu.field}
                    </p>
                  </div>
                  <span className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-text-soft">
                    {edu.year}
                  </span>
                </div>
                {edu.description && (
                  <p className="mt-3 text-sm leading-relaxed text-text-muted">
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Working style / values ───────────────────── */}
      <section className="border-b border-border py-12 md:py-16">
        <div className="mx-auto max-w-[var(--container)] px-[var(--gutter-mobile)] md:px-[var(--gutter-tablet)] lg:px-[var(--gutter-desktop)]">
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            Nasıl çalışıyorum?
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Veriyle başla',
                desc: 'Her projede ilk adım veriyi anlamak. Temiz veri olmadan sağlam model olmaz.',
              },
              {
                title: 'Ürüne çevir',
                desc: 'Notebook\'ta kalan analiz yarım iş. Dashboard, API veya case study ile tamamlanır.',
              },
              {
                title: 'Öğrenmeye devam',
                desc: 'Her proje yeni bir araç veya yöntem öğretir. Süreç kendisi kadar çıktı da önemli.',
              },
            ].map((v) => (
              <div
                key={v.title}
                className="rounded-[var(--radius-md)] border border-border bg-surface p-6"
              >
                <h3 className="font-semibold tracking-tight">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Links / contact ──────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-[var(--container)] px-[var(--gutter-mobile)] text-center md:px-[var(--gutter-tablet)] lg:px-[var(--gutter-desktop)]">
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            Bağlantılar
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="https://github.com/cemyildizcy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-border-strong px-5 py-2.5 text-sm font-semibold transition-all hover:border-accent hover:-translate-y-0.5"
            >
              <FaGithub className="h-4 w-4" />
              GitHub
            </Link>
            <Link
              href="https://www.linkedin.com/in/cemyildizcy/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-border-strong px-5 py-2.5 text-sm font-semibold transition-all hover:border-accent hover:-translate-y-0.5"
            >
              <FaLinkedinIn className="h-4 w-4" />
              LinkedIn
            </Link>
            <Link
              href={`mailto:${portfolioData.about.email}`}
              className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
            >
              <Mail className="h-3.5 w-3.5" />
              Mail gönder
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
