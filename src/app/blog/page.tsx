import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const metadata = {
  title: 'Blog',
  description: 'Veri bilimi, makine öğrenimi ve web geliştirme üzerine yazılarım.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <section className="min-h-screen py-32 px-4 bg-[var(--bg)]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">Blog</h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Veri bilimi, makine öğrenimi ve web geliştirme üzerine deneyimlerimi ve öğrendiklerimi paylaşıyorum.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--text-secondary)] text-lg">Henüz yazı yok. Çok yakında!</p>
            <Link href="/" className="inline-block mt-6 px-6 py-3 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--accent-hover)] transition-colors font-medium">
              Ana Sayfaya Dön
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post, index) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                <article className="relative rounded-2xl p-8 bg-[var(--surface)] border border-[var(--border-color)] hover:border-[var(--accent)] hover:shadow-[0_0_40px_-10px_var(--accent)] transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-[var(--accent)] to-transparent opacity-10 rounded-full blur-3xl group-hover:opacity-30 transition-opacity duration-500"></div>
                  
                  <div className="flex items-start gap-6">
                    <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--bg)] border border-[var(--border-color)] text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      {post.coverEmoji}
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-3 mb-3 text-sm text-[var(--text-secondary)]">
                        <time>{new Date(post.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                        <span>·</span>
                        <span>{post.readTime}</span>
                      </div>
                      
                      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent)] transition-colors tracking-tight">
                        {post.title}
                      </h2>
                      
                      <p className="text-[var(--text-secondary)] leading-relaxed mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span key={tag} className="text-xs font-semibold px-3 py-1 rounded-lg bg-[var(--bg)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
