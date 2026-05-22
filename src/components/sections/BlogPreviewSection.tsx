import Link from 'next/link';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { getAllPosts } from '@/lib/blog';

export const BlogPreviewSection = () => {
  const posts = getAllPosts().slice(0, 3);

  return (
    <section id="blog-preview" className="py-24 relative bg-[var(--surface)]/30 border-y border-[var(--border-color)]">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex justify-between items-end mb-12">
          <SectionHeading title="Blog" subtitle="Veri bilimi ve kodlama üzerine son yazılarım." />
          <Link 
            href="/blog" 
            className="hidden md:flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--border-color)] hover:border-[var(--accent)] hover:bg-[var(--card)] text-[var(--text-primary)] transition-all mb-4"
          >
            Tüm Yazıları Gör <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <ScrollReveal key={post.slug} delay={index * 0.1}>
              <Link href={`/blog/${post.slug}`} className="block h-full group">
                <article className="h-full bg-[var(--card)] rounded-2xl p-6 border border-[var(--border-color)] hover:border-[var(--accent)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--accent)] to-transparent opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-500"></div>
                  
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 origin-left">
                    {post.coverEmoji}
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3 text-xs text-[var(--text-secondary)] font-medium">
                    <time>{new Date(post.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent)] transition-colors leading-tight">
                    {post.title}
                  </h3>
                  
                  <p className="text-[var(--text-secondary)] text-sm line-clamp-3 mb-6 flex-grow">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center text-[var(--accent)] text-sm font-semibold mt-auto group/link">
                    Oku <span className="ml-1 group-hover/link:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </article>
              </Link>
            </ScrollReveal>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] bg-[var(--card)] w-full justify-center"
          >
            Tüm Yazıları Gör <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
};