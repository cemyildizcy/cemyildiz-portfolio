import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { ViewCounter } from '@/components/blog/ViewCounter';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Cem Yıldız`,
    description: post.excerpt,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── Minimal markdown → HTML renderer ────────────────────── */
function renderMarkdown(content: string): string {
  let html = content;

  // Code blocks — console style
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, _lang, code) => {
    return `<pre class="rounded-[var(--radius-md)] border border-[var(--console-border)] bg-[var(--console-bg)] p-5 overflow-x-auto my-6 text-sm leading-relaxed"><code class="text-[var(--console-text)] font-mono">${escapeHtml(
      code.trim(),
    )}</code></pre>`;
  });

  // Inline code
  html = html.replace(
    /`([^`]+)`/g,
    (_, code) => `<code class="rounded bg-[var(--surface-muted)] border border-[var(--border)] px-1.5 py-0.5 text-sm font-mono text-[var(--accent)]">${escapeHtml(code)}</code>`,
  );

  // Headers
  html = html.replace(
    /^### (.+)$/gm,
    '<h3 class="text-lg font-semibold text-[var(--text)] mt-10 mb-3 tracking-tight">$1</h3>',
  );
  html = html.replace(
    /^## (.+)$/gm,
    '<h2 class="text-xl font-semibold text-[var(--text)] mt-12 mb-4 pb-3 border-b border-[var(--border)] tracking-tight">$1</h2>',
  );
  html = html.replace(/^# (.+)$/gm, '');

  // Bold & italic
  html = html.replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="font-semibold text-[var(--text)]">$1</strong>',
  );
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[var(--accent)] underline underline-offset-2 decoration-[var(--accent)]/30 hover:decoration-[var(--accent)]">$1</a>',
  );

  // Tables
  html = html.replace(
    /\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g,
    (_, header, body) => {
      const headers = header
        .split('|')
        .map((h: string) => h.trim())
        .filter(Boolean);
      const rows = body
        .trim()
        .split('\n')
        .map((row: string) =>
          row
            .split('|')
            .map((cell: string) => cell.trim())
            .filter(Boolean),
        );
      return `<div class="overflow-x-auto my-6 rounded-[var(--radius-sm)] border border-[var(--border)]"><table class="w-full text-sm">
      <thead><tr class="bg-[var(--surface-muted)]">${headers.map((h: string) => `<th class="px-4 py-2.5 text-left font-semibold text-[var(--text)]">${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((row: string[]) => `<tr class="border-t border-[var(--border)]">${row.map((cell: string) => `<td class="px-4 py-2.5 text-[var(--text-muted)]">${cell}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
    },
  );

  // Unordered lists
  html = html.replace(
    /^- (.+)$/gm,
    '<li class="text-[var(--text-muted)] pl-1 mb-1.5">$1</li>',
  );
  html = html.replace(
    /(<li.*<\/li>\n?)+/g,
    (match) => `<ul class="my-4 ml-4 list-disc space-y-0.5">${match}</ul>`,
  );

  // Ordered lists
  html = html.replace(
    /^\d+\. (.+)$/gm,
    '<li class="text-[var(--text-muted)] pl-1 mb-1.5">$1</li>',
  );

  // Paragraphs — skip lines that already start with an HTML tag
  html = html.replace(
    /^(?!<[hudloptca])((?!^\s*$).+)$/gm,
    '<p class="text-[var(--text-muted)] leading-[1.75] mb-4">$1</p>',
  );

  return html;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const contentHtml = renderMarkdown(post.content);

  return (
    <main className="min-h-screen bg-background text-text">
      {/* ── Post header ──────────────────────────────── */}
      <section className="border-b border-border pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="mx-auto max-w-[720px] px-[var(--gutter-mobile)] md:px-[var(--gutter-tablet)]">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-text-soft transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Yazılar
          </Link>

          <div className="mt-8">
            <span className="text-4xl" role="img" aria-hidden="true">
              {post.coverEmoji}
            </span>
            <h1 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.02em] md:text-4xl">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-soft">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <span aria-hidden="true">·</span>
              <span>{post.readTime} okuma</span>
              <span aria-hidden="true">·</span>
              <ViewCounter slug={post.slug} />
            </div>

            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
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
        </div>
      </section>

      {/* ── Post body ────────────────────────────────── */}
      <section className="mx-auto max-w-[720px] px-[var(--gutter-mobile)] py-12 md:px-[var(--gutter-tablet)] md:py-16">
        <article
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* ── Footer CTA ─────────────────────────────── */}
        <div className="mt-16 border-t border-border pt-8 text-center">
          <p className="text-sm text-text-muted">
            Bu yazıyı beğendiyseniz, diğer yazılarıma da göz atın.
          </p>
          <Link
            href="/blog"
            className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
          >
            Tüm Yazılar
          </Link>
        </div>
      </section>
    </main>
  );
}
