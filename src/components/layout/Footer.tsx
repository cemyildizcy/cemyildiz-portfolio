import Link from 'next/link';
import { Mail } from 'lucide-react';
import { FaGithub, FaLinkedinIn, FaInstagram, FaXTwitter } from 'react-icons/fa6';

const SOCIAL_LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com/cemyildizcy',
    icon: FaGithub,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/cemyildizcy/',
    icon: FaLinkedinIn,
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/cemyildizcy',
    icon: FaInstagram,
  },
  {
    label: 'X',
    href: 'https://x.com/cemyildizcy',
    icon: FaXTwitter,
  },
];

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-[var(--container)] px-[var(--gutter-mobile)] md:px-[var(--gutter-tablet)] lg:px-[var(--gutter-desktop)] py-12 md:py-16">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Left — bio */}
          <div className="max-w-sm">
            <p className="text-base font-semibold text-text">Cem Yıldız</p>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              Matematik &amp; Bilgisayar Bilimleri öğrencisi. Veri bilimi,
              makine öğrenmesi ve spor analitiği projeleri geliştiriyorum.
            </p>
          </div>

          {/* Right — links */}
          <div className="flex flex-col items-start gap-4 md:items-end">
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border text-text-muted transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <social.icon className="h-[16px] w-[16px]" />
                </Link>
              ))}
            </div>

            {/* Email */}
            <Link
              href="mailto:cem@cemyildiz.net"
              className="flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
            >
              <Mail className="h-4 w-4" strokeWidth={2} />
              cem@cemyildiz.net
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-border pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-soft">
            © {new Date().getFullYear()} Cem Yıldız. Tüm hakları saklıdır.
          </p>
          <p className="text-xs text-text-soft">
            Next.js &amp; Tailwind CSS ile geliştirildi.
          </p>
        </div>
      </div>
    </footer>
  );
};
