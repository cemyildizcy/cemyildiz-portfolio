'use client';

import { useState } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Hakkımda', href: '/about' },
  { label: 'Projeler', href: '/#projeler' },
  { label: 'Yaklaşım', href: '/#yaklasim' },
  { label: 'Paylaşımlar', href: '/#paylasimlar' },
  { label: 'Blog', href: '/blog' },
  { label: 'İletişim', href: '/#iletisim' },
];

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg)]/88 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--text-primary)] text-sm text-[var(--bg)]">CY</span>
          <span className="hidden sm:inline">Cem Yıldız</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="https://github.com/cemyildizcy" target="_blank" className="text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
            GitHub
          </Link>
          <Link href="https://www.linkedin.com/in/cemyildizcy/" target="_blank" className="rounded-full bg-[var(--text-primary)] px-4 py-2 text-sm font-semibold text-[var(--bg)] transition hover:opacity-85">
            LinkedIn
          </Link>
        </div>

        <button
          type="button"
          aria-label="Menüyü aç"
          onClick={() => setMobileMenuOpen((value) => !value)}
          className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border-color)] md:hidden"
        >
          <span className="text-xl leading-none">{mobileMenuOpen ? '×' : '≡'}</span>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[var(--border-color)] bg-[var(--surface)] px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--panel)] hover:text-[var(--text-primary)]">
                {link.label}
              </Link>
            ))}
            <Link href="https://github.com/cemyildizcy" target="_blank" className="rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--panel)]">GitHub</Link>
            <Link href="https://www.linkedin.com/in/cemyildizcy/" target="_blank" className="rounded-xl px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--panel)]">LinkedIn</Link>
          </div>
        </div>
      )}
    </header>
  );
};
