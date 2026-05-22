'use client';

import { motion } from 'framer-motion';
import { portfolioData } from '@/data/portfolio';
import { Github, Linkedin as LinkedinIconFallback, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

const roles = [
  portfolioData.hero.title,
  portfolioData.hero.subtitle
];

export function HeroSection() {
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--bg)]">
      {/* Grid background with radial gradient */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--accent)_0%,transparent_50%)] opacity-10" />

      <motion.div 
        className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <span className="px-4 py-2 rounded-full border border-[var(--accent)] text-[var(--accent)] text-sm font-medium tracking-wide">
            {portfolioData.hero.cta.replace('Projelerimi Gör', 'Merhaba')} {/* Adapting missing greeting */}
          </span>
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-[-0.04em] text-[var(--text-primary)] font-geist mb-4"
        >
          {portfolioData.hero.name}
        </motion.h1>

        <motion.div variants={itemVariants} className="h-10 md:h-12 mb-6">
          <motion.p 
            key={roleIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xl md:text-3xl text-[var(--accent)] font-medium"
          >
            {roles[roleIndex]}
          </motion.p>
        </motion.div>

        <motion.p 
          variants={itemVariants}
          className="text-lg text-[var(--text-secondary)] max-w-2xl mb-10 leading-relaxed"
        >
          {portfolioData.hero.description}
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-center mb-12">
          <a 
            href="#projects" 
            className="px-8 py-3 rounded-lg bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors w-full sm:w-auto"
          >
            {portfolioData.hero.cta}
          </a>
          <a 
            href="#contact" 
            className="px-8 py-3 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] font-medium hover:bg-[var(--surface)] transition-colors w-full sm:w-auto"
          >
            İletişim
          </a>
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-6">
          <a href={portfolioData.socialLinks.find(s => s.name === 'GitHub')?.url} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <Github size={24} />
            <span className="sr-only">GitHub</span>
          </a>
          <a href={portfolioData.socialLinks.find(s => s.name === 'LinkedIn')?.url} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <LinkedinIconFallback size={24} />
            <span className="sr-only">LinkedIn</span>
          </a>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="text-[var(--text-secondary)] opacity-50" size={32} />
        </motion.div>
      </motion.div>
    </section>
  );
}
