import Link from "next/link";

export function Navbar() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/">
        Cem Yıldız<span>ürünler ve teknik yazılar</span>
      </Link>
      <nav aria-label="Ana gezinme">
        <Link href="/#work">Projeler</Link>
        <Link href="/blog">Yazılar</Link>
        <Link href="/ai-inceleme-masasi">İnceleme Masası</Link>
        <Link href="/#about">Hakkımda</Link>
      </nav>
    </header>
  );
}
