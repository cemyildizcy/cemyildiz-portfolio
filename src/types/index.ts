export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface Project {
  title: string;
  description: string;
  longDescription: string;
  tech: string[];
  github?: string;
  live?: string;
  image?: string;
  featured: boolean;
  date: string;
}

export interface SkillCategory {
  title: string;
  icon: string;
  skills: { name: string; level: number }[];
}

export interface Education {
  degree: string;
  school: string;
  location: string;
  year: string;
  description: string;
}

export interface HeroData {
  greeting: string;
  name: string;
  roles: string[];
  description: string;
  resumeUrl?: string;
}

export interface AboutData {
  title: string;
  description: string[];
  stats: { value: string; label: string }[];
}

export interface ContactData {
  title: string;
  description: string;
  email: string;
  formspreeId?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  content?: string;
}

export interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
}

export interface PortfolioData {
  hero: HeroData;
  about: AboutData;
  projects: Project[];
  skills: SkillCategory[];
  education: Education[];
  contact: ContactData;
  navigation: NavItem[];
  socialLinks: SocialLink[];
}
