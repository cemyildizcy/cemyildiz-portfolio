import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getAllPosts } from '@/lib/blog';

export function BlogPreviewSection() {
  const posts = getAllPosts().slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <section
      id="blog"
      className="border-y border-border bg-surface-muted/40 py-20 sm:py-24 md:py-[96px]"
    >
      <div className="mx-auto max-w-[var(--container)] px-[var(--gutter-mobile)] sm:px-[var(--gutter-tablet)] lg:px-[var(--gutter-desktop)]">
        <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            title="Notlar / Yazılar"
            subtitle="Projelerde öğrendiklerimi, veri temizleme notlarını ve makine öğrenimi denemelerimi burada topluyorum."
            align="left"
          />
          <Link
            href="/blog"
            className="shrink-0 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
          >
            Tüm yazılar →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <ScrollReveal key={post.slug} delay={index * 0.08}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block h-full"
              >
                <article className="flex h-full flex-col rounded-[var(--radius-lg)] border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-[3px] hover:border-accent hover:shadow-[var(--shadow-md)]">
                  <span className="text-3xl" aria-hidden="true">
                    {post.coverEmoji}
                  </span>

                  <h3 className="mt-4 text-lg font-semibold tracking-[-0.01em] text-text group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>

                  <p className="mt-2 flex-grow text-sm leading-relaxed text-text-muted line-clamp-3">
                    {post.excerpt}
                  </p>

                  <p className="mt-4 text-sm font-medium text-accent">
                    {post.readTime} · Oku →
                  </p>
                </article>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
