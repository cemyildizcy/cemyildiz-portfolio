'use client';

import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Download, Mail } from 'lucide-react';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa6';

export function ContactSection() {
  return (
    <section
      id="contact"
      className="py-20 sm:py-24 md:py-[96px]"
    >
      <div className="mx-auto max-w-[var(--container)] px-[var(--gutter-mobile)] sm:px-[var(--gutter-tablet)] lg:px-[var(--gutter-desktop)]">
        <ScrollReveal>
          <div className="rounded-[var(--radius-lg)] bg-text p-8 text-text-inverse sm:p-12">
            <p className="font-mono text-xs uppercase tracking-widest opacity-70">
              İletişim
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Bir proje, staj veya fikir konuşalım.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed opacity-80">
              Birlikte çalışabileceğimiz bir fikriniz varsa, staj fırsatı sunmak
              istiyorsanız veya sadece merhaba demek isterseniz — yazın.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="mailto:cemyildizcy@hotmail.com"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-background px-6 text-sm font-semibold text-text transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Mail at
              </a>
              <a
                href="https://linkedin.com/in/cemyildizcy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-text-inverse/20 px-6 text-sm font-semibold text-text-inverse transition hover:bg-text-inverse/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <FaLinkedinIn className="h-4 w-4" aria-hidden="true" />
                LinkedIn&apos;de yaz
              </a>
              <a
                href="/documents/Cem_Yildiz_CV.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-text-inverse/20 px-6 text-sm font-semibold text-text-inverse transition hover:bg-text-inverse/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                CV görüntüle
              </a>
              <a
                href="https://github.com/cemyildizcy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-text-inverse/20 px-6 text-sm font-semibold text-text-inverse transition hover:bg-text-inverse/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <FaGithub className="h-4 w-4" aria-hidden="true" />
                GitHub&apos;da aç
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
