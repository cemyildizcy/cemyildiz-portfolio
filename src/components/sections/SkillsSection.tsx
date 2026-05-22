'use client';

import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { portfolioData } from '@/data/portfolio';
import { Code, Brain, Wrench } from 'lucide-react';

const getCategoryIcon = (categoryName: string = '') => {
  const lowerName = categoryName.toLowerCase();
  if (lowerName.includes('veri') || lowerName.includes('ai') || lowerName.includes('yapay')) {
    return <Brain className="w-5 h-5 text-[var(--text-primary)]" />;
  }
  if (lowerName.includes('araç') || lowerName.includes('tool') || lowerName.includes('devops')) {
    return <Wrench className="w-5 h-5 text-[var(--text-primary)]" />;
  }
  return <Code className="w-5 h-5 text-[var(--text-primary)]" />;
};

export const SkillsSection = () => {
  return (
    <section id="yetenekler" className="py-24 relative">
      <div className="container mx-auto px-6">
        <SectionHeading title="Yetenekler" subtitle="Kullandığım teknolojiler ve yetkinliklerim." />
        
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioData.skills.map((category: any, index: number) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="group rounded-2xl p-6 bg-[var(--card)] border border-[var(--border-color)] backdrop-blur-md hover:border-[var(--accent)] transition-colors duration-300"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-color)]">
                  <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border-color)] group-hover:border-[var(--accent)] transition-colors">
                    {getCategoryIcon(category.name)}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    {category.name}
                  </h3>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {category.items.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};