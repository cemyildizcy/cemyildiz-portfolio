'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { portfolioData } from '@/data/portfolio';
import { Github, Star, GitFork, ExternalLink } from 'lucide-react';

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {portfolioData.projects.map((project: any, index: number) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="h-full rounded-2xl p-6 bg-[var(--surface)] border border-[var(--border-color)] flex flex-col backdrop-blur-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">{project.title}</h3>
                  {project.date && (
                    <span className="text-xs text-[var(--text-secondary)] font-medium bg-[var(--bg)] px-2 py-1 rounded-full border border-[var(--border-color)]">
                      {project.date}
                    </span>
                  )}
                </div>
                
                <p className="text-[var(--text-secondary)] text-sm mb-6 flex-grow">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies?.map((tech: string, i: number) => (
                    <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-md bg-[var(--bg)] text-[var(--text-primary)] border border-[var(--border-color)]">
                      {tech}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-4 mt-auto pt-4 border-t border-[var(--border-color)]">
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-center gap-2 text-sm font-medium">
                      <Github className="w-4 h-4" /> GitHub
                    </a>
                  )}
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-center gap-2 text-sm font-medium">
                      <ExternalLink className="w-4 h-4" /> Canlı İzle
                    </a>
                  )}
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* GitHub Repositories Grid */}
        <SectionHeading title="Açık Kaynak" subtitle="GitHub üzerinde en çok yıldız alan depolarım." />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {repos.map((repo, index) => (
            <ScrollReveal key={repo.id} delay={index * 0.1}>
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="block h-full">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="h-full rounded-xl p-5 bg-[var(--card)] border border-[var(--border-color)] flex flex-col hover:border-[var(--accent)] transition-colors duration-300"
                >
                  <div className="flex items-center gap-2 mb-3 text-[var(--text-primary)]">
                    <Github className="w-5 h-5 text-[var(--text-primary)]" />
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
          ))}
        </div>
      </div>
    </section>
  );
};