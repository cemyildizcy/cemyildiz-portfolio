import { HeroSection } from '@/components/sections/HeroSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { BlogPreviewSection } from '@/components/sections/BlogPreviewSection';
import { ContactSection } from '@/components/sections/ContactSection';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ProjectsSection />
      <AboutSection />
      <BlogPreviewSection />
      <ContactSection />
    </main>
  );
}
