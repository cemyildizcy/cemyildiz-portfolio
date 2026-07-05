'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const aboutPreview =
  "ESOGÜ Matematik & Bilgisayar Bilimleri 3. sınıf öğrencisiyim. Veriyle başlayıp çalışan bir arayüze kadar götürdüğüm projeleri seviyorum.";

const currentFocusItems = [
  'Model evaluation',
  'Dashboard design',
  'Case-study writing',
  'ML projects',
];

export function AboutSection() {
  return (
    <section
      id="about"
      className="border-y border-border bg-surface-muted py-20 sm:py-24 md:py-[96px]"
    >
      <div className="mx-auto grid max-w-[var(--container)] gap-10 px-[var(--gutter-mobile)] sm:px-[var(--gutter-tablet)] lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-16 lg:px-[var(--gutter-desktop)]">
        {/* ─── Photo ─── */}
        <ScrollReveal direction="up">
          <div className="relative mx-auto max-w-[320px] lg:max-w-none">
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface p-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-md)]">
                <Image
                  src="/images/profile.jpg"
                  alt="Cem Yıldız profil fotoğrafı"
                  fill
                  sizes="(min-width: 1024px) 360px, 280px"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ─── Text ─── */}
        <ScrollReveal direction="up" delay={0.1}>
          <div>
            <SectionHeading title="Hakkımda" align="left" />

            <p className="text-lg leading-[1.65] text-text-muted">
              {aboutPreview}
            </p>

            {/* Current focus chips */}
            <div className="mt-6 flex flex-wrap gap-2">
              {currentFocusItems.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-text"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/about"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold text-text transition hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Detaylı hakkımda →
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
