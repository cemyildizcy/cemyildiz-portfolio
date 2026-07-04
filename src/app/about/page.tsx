import Image from 'next/image';
import Link from 'next/link';
import { portfolioData } from '@/data/portfolio';

export const metadata = {
  title: 'Hakkımda',
  description: 'Cem Yıldız hakkında: veri bilimi, makine öğrenimi ve full-stack projeler.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] pt-28 text-[var(--text-primary)]">
      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-24 lg:grid-cols-[0.55fr_1.45fr] lg:items-start lg:px-8">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[340px] overflow-hidden rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface)] p-3 shadow-2xl shadow-black/10">
          <Image src="/images/profile.jpg" alt="Cem Yıldız profil fotoğrafı" fill priority sizes="(min-width: 1024px) 320px, 86vw" className="rounded-[1.5rem] object-cover object-center" />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">HAKKIMDA</p>
          <h1 className="mt-4 text-balance text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">Model kuran, anlatan ve ürüne çeviren öğrenci.</h1>
          <p className="mt-7 text-pretty text-lg leading-8 text-[var(--text-secondary)]">{portfolioData.about.description}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {portfolioData.skills.map((skill) => (
              <div key={skill.category} className="rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--surface)] p-5">
                <h2 className="font-semibold tracking-tight">{skill.category}</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{skill.items.join(' · ')}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/#projeler" className="rounded-full bg-[var(--text-primary)] px-5 py-3 text-sm font-semibold text-[var(--bg)]">Projeler</Link>
            <Link href="mailto:cemyildizcy@hotmail.com" className="rounded-full border border-[var(--border-color)] px-5 py-3 text-sm font-semibold">Mail gönder</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
