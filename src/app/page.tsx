import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { EducationSection } from '@/components/sections/EducationSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { LinkedinSection } from '@/components/sections/LinkedinSection';
import { BlogPreviewSection } from '@/components/sections/BlogPreviewSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <BlogPreviewSection />
      <LinkedinSection />
      <SkillsSection />
      <EducationSection />
      <ContactSection />
    </>
  );
}