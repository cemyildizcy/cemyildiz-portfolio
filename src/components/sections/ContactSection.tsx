'use client';

import { useState } from 'react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { portfolioData } from '@/data/portfolio';
import { Mail, Linkedin as LinkedinIconFallback, Github } from 'lucide-react';

export function ContactSection() {
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('success');
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <section id="iletisim" className="py-24" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="container mx-auto px-4 max-w-5xl">
        <SectionHeading title={portfolioData.contact?.title || 'İletişim'} subtitle="Benimle İletişime Geçin" />
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left Column: Info */}
          <ScrollReveal direction="up" delay={0.1}>
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-medium text-[var(--text-primary)] mb-3">
                  Birlikte Çalışalım
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {portfolioData.contact?.description || "Yeni projeler veya fırsatlar hakkında konuşmak için her zaman hazırım. Bana ulaşmaktan çekinmeyin."}
                </p>
              </div>

              <div className="space-y-4">
                <a href={`mailto:${portfolioData.contact?.email || 'cemyildizcy@hotmail.com'}`} className="flex items-center gap-4 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors p-4 rounded-xl border border-transparent hover:border-[var(--border-color)] bg-[var(--surface)]/50 hover:bg-[var(--surface)]">
                  <div className="bg-[var(--surface)] p-3 rounded-full text-[var(--accent)] border border-[var(--border-color)]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-[var(--text-primary)]">{portfolioData.contact?.email || 'cemyildizcy@hotmail.com'}</span>
                </a>

                {portfolioData.socialLinks?.find(s => s.name === 'LinkedIn')?.url && (
                  <a href={portfolioData.socialLinks.find(s => s.name === 'LinkedIn')?.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors p-4 rounded-xl border border-transparent hover:border-[var(--border-color)] bg-[var(--surface)]/50 hover:bg-[var(--surface)]">
                    <div className="bg-[var(--surface)] p-3 rounded-full text-[var(--accent)] border border-[var(--border-color)]">
                      <LinkedinIconFallback className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-[var(--text-primary)]">LinkedIn</span>
                  </a>
                )}

                {portfolioData.socialLinks?.find(s => s.name === 'GitHub')?.url && (
                  <a href={portfolioData.socialLinks.find(s => s.name === 'GitHub')?.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors p-4 rounded-xl border border-transparent hover:border-[var(--border-color)] bg-[var(--surface)]/50 hover:bg-[var(--surface)]">
                    <div className="bg-[var(--surface)] p-3 rounded-full text-[var(--accent)] border border-[var(--border-color)]">
                      <Github className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-[var(--text-primary)]">GitHub</span>
                  </a>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Right Column: Form */}
          <ScrollReveal direction="up" delay={0.2}>
            <div className="glass bg-[var(--card)]/80 backdrop-blur-md border border-[var(--border-color)] p-8 rounded-2xl shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">İsim</label>
                  <input 
                    type="text" 
                    id="name" 
                    required 
                    className="w-full bg-[var(--surface)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                    placeholder="Adınız Soyadınız"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">E-posta</label>
                  <input 
                    type="email" 
                    id="email" 
                    required 
                    className="w-full bg-[var(--surface)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                    placeholder="ornek@email.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Mesaj</label>
                  <textarea 
                    id="message" 
                    required 
                    rows={4}
                    className="w-full bg-[var(--surface)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all resize-none"
                    placeholder="Mesajınız..."
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-xl px-6 py-3.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
                >
                  {status === 'success' ? 'Mesaj gönderildi!' : 'Mesaj Gönder'}
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
