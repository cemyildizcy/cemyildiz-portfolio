'use client';

import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { portfolioData } from '@/data/portfolio';

// Adapting the mock shape requested to the actual data found
const stats = [
  { value: "2+", label: "Yıl Deneyim" },
  { value: "10+", label: "Proje" },
  { value: "4+", label: "Sertifika" },
  { value: "100%", label: "Motivasyon" }
];

export function AboutSection() {
  return (
    <section id="hakkimda" className="py-24 px-4 bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <SectionHeading title={portfolioData.about.title} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left Column: Text */}
            <div className="space-y-6 text-[var(--text-secondary)] text-lg leading-relaxed">
              <p>{portfolioData.about.description}</p>
            </div>

            {/* Right Column: Visual/Image Placeholder */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-[200px] h-[200px] rounded-full bg-gradient-to-tr from-[var(--accent)] to-[var(--surface)] flex items-center justify-center border-4 border-[var(--card)] shadow-2xl">
                <span className="text-6xl font-bold text-white font-geist tracking-tighter">CY</span>
                {/* Decorative outer ring */}
                <div className="absolute inset-[-10px] rounded-full border border-[var(--border-color)] opacity-50" />
                <div className="absolute inset-[-20px] rounded-full border border-[var(--border-color)] opacity-20" />
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-[var(--card)] border border-[var(--border-color)] rounded-xl p-6 text-center backdrop-blur-sm"
              >
                <div className="text-3xl font-bold text-[var(--accent)] mb-2 font-geist">
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--text-secondary)] font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
