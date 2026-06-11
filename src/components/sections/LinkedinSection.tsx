'use client';

import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const linkedinPosts = [
  {
    title: '2026 Dünya Kupası AI Simülatörü',
    meta: '6. Hafta Projesi',
    description:
      '48 takımlı 2026 Dünya Kupası formatını EA FC 25, StatsBomb ve Poisson xG modeliyle 10.000 kez simüle ettiğim proje paylaşımı.',
    url: 'https://www.linkedin.com/posts/cemyildizcy_datascience-machinelearning-python-ugcPost-7470769047601664000-OO0G/',
    tags: ['DataScience', 'WorldCup2026', 'Streamlit'],
  },
  {
    title: 'Öğrenci Alışkanlıkları ve Akademik Başarı',
    meta: '5. Hafta Projesi',
    description:
      '1.000 öğrencinin günlük alışkanlıkları üzerinden akademik başarıyı analiz ettiğim K-Means, DBSCAN ve SVM tabanlı proje paylaşımı.',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7467981878382465024/',
    tags: ['MachineLearning', 'SVM', 'StudentLife'],
  },
  {
    title: 'Türkiye Deprem Risk Analizi',
    meta: '4. Hafta Projesi',
    description:
      'USGS verileriyle Türkiye deprem kayıtlarını analiz edip K-Means ve Random Forest ile risk sınıflandırması yaptığım proje paylaşımı.',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7465489993902411776/',
    tags: ['Python', 'KMeans', 'RandomForest'],
  },
];

export const LinkedinSection = () => {
  return (
    <section id="paylasimlar" className="py-24 relative bg-[var(--surface)]/30">
      <div className="container mx-auto px-6 max-w-6xl">
        <SectionHeading title="LinkedIn" subtitle="Son paylaşımlarım ve yazılarım." />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          {linkedinPosts.map((post, index) => (
            <ScrollReveal key={post.url} delay={index * 0.1}>
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full bg-[var(--card)] rounded-2xl border border-[var(--border-color)] shadow-lg p-6 group hover:border-[var(--accent)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-4 mb-5">
                  <span className="text-sm text-[var(--accent)] font-medium">
                    {post.meta}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                    LinkedIn
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-4 group-hover:text-[var(--accent)] transition-colors">
                  {post.title}
                </h3>

                <p className="text-[var(--muted-foreground)] leading-relaxed mb-6">
                  {post.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full bg-[var(--surface)] text-[var(--muted-foreground)] border border-[var(--border-color)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <span className="inline-flex items-center text-sm font-medium text-[var(--accent)]">
                  Gönderiyi aç →
                </span>
              </a>
            </ScrollReveal>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://www.linkedin.com/in/cemyildizcy/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors"
          >
            Tüm Paylaşımlarımı Gör
          </a>
        </div>
      </div>
    </section>
  );
};
