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
                whileHover={{ 
                  scale: 1.02,
                  y: -4,
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 8px 16px -8px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.05)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group rounded-[12px] p-6 bg-[var(--card)] border-none backdrop-blur-md transition-all duration-300"
                style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 2px 2px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-color)]">
                  <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border-color)] group-hover:border-[var(--accent)] transition-colors">
                    {getCategoryIcon(category.category)}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    {category.category}
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