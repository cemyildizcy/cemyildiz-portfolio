'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const prefersReducedMotion = useReducedMotion();

  // Reduced motion → render immediately, no transform
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const initial = (() => {
    switch (direction) {
      case 'left':
        return { opacity: 0, x: -20, y: 0 };
      case 'right':
        return { opacity: 0, x: 20, y: 0 };
      case 'up':
      default:
        return { opacity: 0, x: 0, y: 12 };
    }
  })();

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : initial}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
