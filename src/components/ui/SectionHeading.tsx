'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export function SectionHeading({
  title,
  subtitle,
  align = 'center',
}: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const prefersReducedMotion = useReducedMotion();

  const alignClass = align === 'left' ? 'text-left' : 'text-center';

  const content = (
    <>
      <h2 className="text-2xl font-semibold tracking-[-0.02em] text-text md:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-text-muted md:text-lg">
          {subtitle}
        </p>
      )}
    </>
  );

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={`mb-12 md:mb-16 ${alignClass}`}>
        {content}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`mb-12 md:mb-16 ${alignClass}`}
    >
      {content}
    </motion.div>
  );
}
