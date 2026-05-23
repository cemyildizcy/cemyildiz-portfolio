'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { portfolioData } from '@/data/portfolio';
import { Star, GitFork, ExternalLink } from 'lucide-react';
import { GithubIcon } from '@/components/icons/BrandIcons';

interface Repo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
}

export const ProjectsSection = () => {
  const [repos, setRepos] = useState<Repo[]>([]);

  useEffect(() => {
    fetch('https://api.github.com/users/cemyildizcy/repos?sort=stars&per_page=4')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRepos(data);
      })
      .catch((err) => console.error('Failed to fetch repos', err));
  }, []);

  return (
    <section id="projeler" className="py-24 relative">
      <div className="container mx-auto px-6">
        <SectionHeading title="Projeler" subtitle="Geliştirdiğim uygulamalar ve çalışmalar." />

        {/* Portfolio Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {portfolioData.projects.map((project: any, index: number) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <motion.div
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 8px 16px -8px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.05)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative h-full rounded-[12px] p-8 bg-[var(--surface)] border-none flex flex-col overflow-hidden backdrop-blur-xl transition-all duration-300"
                style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 2px 2px rgba(0,0,0,0.04)" }}
              >
                {/* Glow Overlay */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-[var(--accent)] to-transparent opacity-10 rounded-full blur-3xl group-hover:opacity-30 transition-opacity duration-500"></div>
                
                <div className="flex justify-between items-start mb-6 z-10">
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{project.title}</h3>
                  {project.date && (
                    <span className="text-xs text-[var(--text-secondary)] font-semibold bg-[var(--bg)] px-3 py-1.5 rounded-full border border-[var(--border-color)]">
                      {project.date}
                    </span>
                  )}
                </div>
                
                <p className="text-[var(--text-secondary)] leading-relaxed mb-8 flex-grow z-10">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-8 z-10">
                  {project.technologies?.map((tech: string, i: number) => (
                    <span key={i} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[var(--bg)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm">
                      {tech}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-6 mt-auto pt-6 border-t border-[var(--border-color)] z-10">
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 text-sm font-semibold group/link">
                      <GithubIcon className="w-5 h-5 group-hover/link:text-[var(--accent)] transition-colors" /> 
                      <span className="group-hover/link:underline">GitHub</span>
                    </a>
                  )}
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 text-sm font-semibold group/link">
                      <ExternalLink className="w-5 h-5 group-hover/link:text-[var(--accent)] transition-colors" /> 
                      <span className="group-hover/link:underline">Canlı İzle</span>
                    </a>
                  )}
                  {project.link && !project.liveUrl && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 text-sm font-semibold group/link">
                      <ExternalLink className="w-5 h-5 group-hover/link:text-[var(--accent)] transition-colors" /> 
                      <span className="group-hover/link:underline">İncele</span>
                    </a>
                  )}
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* GitHub Repositories Grid */}
        <SectionHeading title="Açık Kaynak" subtitle="GitHub üzerinde paylaştığım projeler." />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {repos.length > 0 ? repos.map((repo, index) => (
            <ScrollReveal key={repo.id} delay={index * 0.1}>
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="block h-full">
                <motion.div
                  whileHover={{ 
                    scale: 1.02,
                    y: -4,
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 8px 16px -8px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.05)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="h-full rounded-[8px] p-5 bg-[var(--card)] border-none flex flex-col transition-all duration-300"
                  style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 2px 2px rgba(0,0,0,0.04)" }}
                >
                  <div className="flex items-center gap-2 mb-3 text-[var(--text-primary)]">
                    <GithubIcon className="w-5 h-5 text-[var(--text-primary)]" />
                    <h4 className="font-bold truncate text-sm" title={repo.name}>{repo.name}</h4>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mb-4 flex-grow line-clamp-3">
                    {repo.description || 'Açıklama bulunmuyor.'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mt-auto">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {repo.stargazers_count}</span>
                      <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" /> {repo.forks_count}</span>
                    </div>
                    {repo.language && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]"></span>
                        <span>{repo.language}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </a>
            </ScrollReveal>
          )) : (
            <div className="col-span-full text-center text-[var(--text-secondary)] py-8">
              Projeler yükleniyor...
            </div>
          )}
        </div>
      </div>
    </section>
  );
};