'use client';

import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { portfolioData } from '@/data/portfolio';
import { Calendar } from 'lucide-react';

export function EducationSection() {
  return (
    <section id="egitim" className="py-24" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="container mx-auto px-4 max-w-4xl">
        <SectionHeading title="Eğitim" subtitle="Akademik Geçmişim" />
        
        <div className="mt-12 relative border-l border-[var(--border-color)] ml-3 md:ml-6">
          {portfolioData.education.map((item, index) => (
            <ScrollReveal key={index} direction="left" delay={index * 0.1}>
              <div className="mb-10 ml-8 md:ml-12 relative group">
                {/* Timeline Marker */}
                <span className="absolute -left-[41px] md:-left-[57px] top-1.5 h-4 w-4 rounded-full bg-[var(--bg)] border-2 border-[var(--accent)] transition-colors group-hover:bg-[var(--accent)]" />
                
                {/* Content Card */}
                <div className="bg-[var(--card)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm transition-all hover:border-[var(--accent)]/50">
                  <h3 className="text-xl font-medium text-[var(--text-primary)] mb-1">
                    {item.degree}
                  </h3>
                  <div className="text-lg text-[var(--accent)] mb-4 font-medium">
                    {item.institution} - {item.field}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)] mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{item.year} (Mezuniyet: {item.graduationYear})</span>
                    </div>
                  </div>

                  
                  {item.description && (
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
