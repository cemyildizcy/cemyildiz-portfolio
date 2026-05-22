import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

function renderMarkdown(content: string): string {
  let html = content;
  
  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="bg-[#0d0d0d] border border-[var(--border-color)] rounded-xl p-6 overflow-x-auto my-6 text-sm leading-relaxed"><code class="text-[var(--text-primary)]">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()}</code></pre>`;
  });
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-[var(--surface)] px-2 py-0.5 rounded text-sm text-[var(--accent)] font-mono border border-[var(--border-color)]">$1</code>');
  
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-[var(--text-primary)] mt-10 mb-4">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-[var(--text-primary)] mt-12 mb-6 pb-3 border-b border-[var(--border-color)]">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '');
  
  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[var(--text-primary)] font-semibold">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[var(--accent)] hover:underline">$1</a>');
  
  // Tables
  html = html.replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g, (_, header, body) => {
    const headers = header.split('|').map((h: string) => h.trim()).filter(Boolean);
    const rows = body.trim().split('\n').map((row: string) => 
      row.split('|').map((cell: string) => cell.trim()).filter(Boolean)
    );
    return `<div class="overflow-x-auto my-6"><table class="w-full border border-[var(--border-color)] rounded-xl overflow-hidden text-sm">
      <thead><tr class="bg-[var(--surface)]">${headers.map((h: string) => `<th class="px-4 py-3 text-left font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)]">${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((row: string[]) => `<tr class="border-b border-[var(--border-color)] hover:bg-[var(--surface)]/50">${row.map((cell: string) => `<td class="px-4 py-3 text-[var(--text-secondary)]">${cell}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
  });
  
  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="text-[var(--text-secondary)] ml-4 mb-2 list-disc">$1</li>');
  html = html.replace(/(<li.*<\/li>\n?)+/g, (match) => `<ul class="my-4 space-y-1">${match}</ul>`);
  
  // Ordered lists  
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="text-[var(--text-secondary)] ml-4 mb-2 list-decimal">$1</li>');
  
  // Paragraphs
  html = html.replace(/^(?!<[hudloptc])((?!^\s*$).+)$/gm, '<p class="text-[var(--text-secondary)] leading-relaxed mb-4">$1</p>');
  
  return html;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) notFound();

  const contentHtml = renderMarkdown(post.content);

  return (
    <section className="min-h-screen py-32 px-4 bg-[var(--bg)]">
      <div className="max-w-3xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-12 text-sm font-medium">
          ← Blog&apos;a Dön
        </Link>

        <article>
          <header className="mb-12">
            <div className="text-5xl mb-6">{post.coverEmoji}</div>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6 tracking-tight leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] mb-6">
              <time>{new Date(post.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
              <span>·</span>
              <span>{post.readTime} okuma</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs font-semibold px-3 py-1 rounded-lg bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div 
            className="prose-custom"
            dangerouslySetInnerHTML={{ __html: contentHtml }} 
          />
        </article>

        <div className="mt-16 pt-8 border-t border-[var(--border-color)] text-center">
          <p className="text-[var(--text-secondary)] mb-4">Bu yazıyı beğendiyseniz, diğer yazılarıma da göz atın.</p>
          <Link href="/blog" className="inline-block px-6 py-3 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--accent-hover)] transition-colors font-medium">
            Tüm Yazılar
          </Link>
        </div>
      </div>
    </section>
  );
}
