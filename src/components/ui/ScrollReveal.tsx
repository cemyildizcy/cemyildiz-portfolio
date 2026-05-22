'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

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

  const getInitialVariants = () => {
    switch (direction) {
      case 'left':
        return { opacity: 0, x: -50, y: 0 };
      case 'right':
        return { opacity: 0, x: 50, y: 0 };
      case 'up':
      default:
        return { opacity: 0, y: 50, x: 0 };
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={getInitialVariants()}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : getInitialVariants()}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
