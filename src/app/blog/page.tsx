import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Yazılar / Notlar | Cem Yıldız',
  description:
    'Projelerde öğrendiklerimi, veri temizleme notlarını ve spor analitiği denemelerimi burada topluyorum.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-background text-text">
      {/* ── Header ───────────────────────────────────── */}
      <section className="border-b border-border pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="mx-auto max-w-[720px] px-[var(--gutter-mobile)] md:px-[var(--gutter-tablet)]">
          <h1 className="text-3xl font-semibold tracking-[-0.02em] md:text-4xl">
            Yazılar / Notlar
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted md:text-lg">
            Projelerde öğrendiklerimi, veri temizleme notlarını ve spor
            analitiği denemelerimi burada topluyorum.
          </p>
        </div>
      </section>

      {/* ── Post list ────────────────────────────────── */}
      <section className="mx-auto max-w-[720px] px-[var(--gutter-mobile)] py-12 md:px-[var(--gutter-tablet)] md:py-16">
        {posts.length === 0 ? (
          <div className="rounded-[var(--radius-md)] border border-border bg-surface p-10 text-center">
            <p className="text-4xl">📝</p>
            <p className="mt-4 text-text-muted">
              Henüz yazı yok — ilk notlar çok yakında.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
            >
              Ana sayfaya dön
            </Link>
          </div>
        ) : (
          <div className="grid gap-2">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group -mx-3 flex items-start gap-4 rounded-[var(--radius-md)] p-4 transition-colors hover:bg-surface md:-mx-4 md:p-5"
              >
                {/* Emoji */}
                <span
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-border bg-surface-muted text-xl transition-transform group-hover:scale-105"
                  aria-hidden="true"
                >
                  {post.coverEmoji}
                </span>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-soft">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h2 className="mt-1.5 text-base font-semibold tracking-tight transition-colors group-hover:text-accent md:text-lg">
                    {post.title}
                  </h2>

                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-text-muted">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-xs text-text-soft"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <ArrowRight
                  className="mt-2 h-4 w-4 flex-shrink-0 text-text-soft opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-accent group-hover:opacity-100"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
