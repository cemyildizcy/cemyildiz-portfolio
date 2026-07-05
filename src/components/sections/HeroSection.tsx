'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { portfolioData } from '@/data/portfolio';
import { Download } from 'lucide-react';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa6';

const workflowSteps = portfolioData.workflow;

export function HeroSection() {
  const [activeStep, setActiveStep] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' as const, delay: i * 0.1 },
    }),
  };

  return (
    <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24 md:pt-[128px] md:pb-[96px]">
      {/* subtle grid bg */}
      <div className="lab-grid absolute inset-0 opacity-60" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-[var(--container)] gap-12 px-[var(--gutter-mobile)] sm:px-[var(--gutter-tablet)] lg:grid-cols-[55fr_45fr] lg:items-start lg:gap-16 lg:px-[var(--gutter-desktop)]">
        {/* ─── Left: text ─── */}
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-5 inline-block font-mono text-sm tracking-wide text-accent"
          >
            {portfolioData.hero.eyebrow}
          </motion.p>

          {/* H1 */}
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-balance text-4xl font-semibold tracking-[-0.04em] text-text sm:text-5xl md:text-6xl"
          >
            {portfolioData.hero.title}
          </motion.h1>

          {/* Body */}
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-6 max-w-xl text-pretty text-lg leading-[1.65] text-text-muted"
          >
            {portfolioData.hero.description}
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              href="#projects"
              className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {portfolioData.hero.cta}
            </Link>
            <a
              href="/documents/Cem_Yildiz_CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold text-text transition hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              CV
            </a>
            <a
              href="https://github.com/cemyildizcy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold text-text transition hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <FaGithub className="h-4 w-4" aria-hidden="true" />
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/cemyildizcy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold text-text transition hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <FaLinkedinIn className="h-4 w-4" aria-hidden="true" />
              LinkedIn
            </a>
          </motion.div>
        </div>

        {/* ─── Right: Workflow card ─── */}
        <motion.aside
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-md)]"
          aria-label="Çalışma akışı"
        >
          <p className="mb-5 font-mono text-xs uppercase tracking-widest text-accent">
            Workflow
          </p>
          <ol className="grid gap-3">
            {workflowSteps.map((step, i) => (
              <li
                key={step.step}
                className={`flex items-start gap-4 rounded-[var(--radius-md)] border p-4 transition-colors duration-300 ${
                  activeStep === i
                    ? 'border-accent bg-accent-soft'
                    : 'border-border bg-surface-muted'
                }`}
              >
                <span className="mt-0.5 font-mono text-xs text-accent">
                  {String(step.step).padStart(2, '0')}
                </span>
                <div>
                  <p className="font-semibold tracking-[-0.01em] text-text">
                    {step.label}
                  </p>
                  <p className="mt-1 text-sm text-text-muted">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </motion.aside>
      </div>

      {/* ─── Proof strip ─── */}
      <motion.div
        custom={4}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mx-auto mt-12 grid max-w-[var(--container)] grid-cols-2 gap-3 px-[var(--gutter-mobile)] sm:grid-cols-4 sm:px-[var(--gutter-tablet)] lg:px-[var(--gutter-desktop)]"
      >
        {['3. sınıf / ESOGÜ Mat-Bil', 'Python + ML', 'Veri bilimi', 'Next.js projeleri'].map(
          (label) => (
            <div
              key={label}
              className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3 text-center text-sm font-medium text-text"
            >
              {label}
            </div>
          ),
        )}
      </motion.div>
    </section>
  );
}
