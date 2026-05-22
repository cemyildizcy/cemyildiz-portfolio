import Link from 'next/link';

export default function BlogPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-20">
      <h1 className="text-4xl font-bold mb-4">Blog</h1>
      <h2 className="text-2xl font-semibold mb-6 text-muted-foreground">Çok Yakında</h2>
      <p className="text-lg mb-8 max-w-md text-muted-foreground">
        Veri bilimi, yazılım geliştirme ve teknoloji üzerine yazılarım çok yakında burada olacak.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}