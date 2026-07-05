import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center bg-background px-[var(--gutter-mobile)] text-center text-text">
      {/* Big 404 */}
      <p className="font-mono text-8xl font-bold tracking-tighter text-border-strong md:text-[10rem]">
        404
      </p>

      {/* Fun message */}
      <h1 className="mt-4 text-xl font-semibold tracking-tight md:text-2xl">
        Bu sayfa kayıp — veri setinde yok.
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
        Aradığınız sayfa silinmiş, taşınmış veya hiç olmamış olabilir.
        NaN döndük, ama sorun değil.
      </p>

      {/* CTA */}
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
      >
        <ArrowLeft className="h-4 w-4" />
        Ana sayfaya dön
      </Link>
    </main>
  );
}
