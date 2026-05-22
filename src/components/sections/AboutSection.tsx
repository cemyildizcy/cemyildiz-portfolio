'use client';

import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { portfolioData } from '@/data/portfolio';
import Image from 'next/image';

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
            
            <ScrollReveal direction="right" delay={0.1}>
              <div className="relative w-full aspect-square max-w-sm mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-hover)] rounded-3xl opacity-20 blur-2xl"></div>
                <div className="relative h-full w-full rounded-3xl overflow-hidden border border-[var(--border-color)] bg-[var(--surface)] shadow-2xl">
                  <Image 
                    src="/images/profile.jpg" 
                    alt="Cem Yıldız" 
                    fill
                    className="object-cover object-center grayscale hover:grayscale-0 transition-all duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" delay={0.2}>
              <div className="space-y-6 text-[var(--text-secondary)] text-lg leading-relaxed">
                <p>{portfolioData.about.description}</p>
                <div className="pt-6 border-t border-[var(--border-color)]">
                   <p className="font-medium text-[var(--text-primary)] mb-2">🎓 Eskişehir Osmangazi Üniversitesi</p>
                   <p className="text-sm">Matematik ve Bilgisayar Bilimleri (2028)</p>
                </div>
              </div>
            </ScrollReveal>
            
          </div>

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