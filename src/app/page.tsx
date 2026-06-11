import Image from 'next/image';
import Link from 'next/link';
import { portfolioData } from '@/data/portfolio';
import { projectCaseStudies } from '@/data/projectHelpers';

const featuredProject = projectCaseStudies[0];
const selectedProjects = projectCaseStudies;

const metrics = [
  { label: 'Yayınlanan proje', value: `${portfolioData.projects.length}+` },
  { label: 'Canlı demo / dashboard', value: '3' },
  { label: 'Ana odak', value: 'DS / ML' },
  { label: 'Proje serisi', value: 'Haftalık' },
];

const labNotes = [
  {
    title: 'Önce problem, sonra model',
    text: 'Model seçimini ezbere yapmıyorum. Önce veri seti, hedef değişken, hata metriği ve kullanıcıya dönecek çıktı netleşiyor.',
  },
  {
    title: 'Notebook’tan ürüne',
    text: 'Bir proje sadece notebook olarak kalmasın diye README, dashboard, görsel çıktı ve case study akışıyla sunulabilir hale getiriyorum.',
  },
  {
    title: 'Öğrenme süreci açık',
    text: 'Haftalık proje serisinde sadece sonucu değil; veri temizleme, model denemeleri, hatalar ve çıkarımları da paylaşmaya çalışıyorum.',
  },
];

const latestPosts = [
  {
    title: '2026 Dünya Kupası AI Simülatörü',
    meta: 'W6 LinkedIn postu',
    url: 'https://www.linkedin.com/posts/cemyildizcy_datascience-machinelearning-python-ugcPost-7470769047601664000-OO0G/',
  },
  {
    title: 'Öğrenci Alışkanlıkları ve Akademik Başarı',
    meta: 'W5 proje postu',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7467981878382465024/',
  },
  {
    title: 'Türkiye Deprem Risk Analizi',
    meta: 'W4 proje postu',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7465489993902411776/',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <section className="relative overflow-hidden border-b border-[var(--border-color)] pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="absolute inset-0 lab-grid opacity-70" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-[var(--border-color)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text-secondary)]">
              Cem Yıldız · Matematik & Bilgisayar Bilimleri · Data Lab
            </p>
            <h1 className="text-balance text-5xl font-semibold tracking-[-0.05em] text-[var(--text-primary)] sm:text-6xl lg:text-7xl">
                          Veri projelerini görülebilir ürünlere çeviriyorum.
                        </h1>
            <p className="mt-8 max-w-2xl text-pretty text-lg leading-8 text-[var(--text-secondary)]">
              Python, makine öğrenmesi ve modern web araçlarıyla veri projeleri geliştiriyorum. Amacım sadece model eğitmek değil; fikri veri setinden canlı dashboard'a, case study'den kullanıcıya kadar taşımak.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="#projeler" className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--text-primary)] px-6 text-sm font-semibold text-[var(--bg)] transition hover:opacity-85">
                Projeleri gör
              </Link>
              <Link href={`/${'projects'}/${featuredProject.slug}`} className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--surface)] px-6 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent)]">
                WC2026 case study
              </Link>
            </div>
          </div>

          <aside className="grid gap-5">
            <div className="overflow-hidden rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface)] p-4 shadow-2xl shadow-black/10">
              <div className="grid gap-5 sm:grid-cols-[0.72fr_1fr] lg:grid-cols-1 xl:grid-cols-[0.72fr_1fr]">
                <div className="relative min-h-80 overflow-hidden rounded-[1.5rem] bg-[var(--panel)]">
                  <Image src="/images/profile.jpg" alt="Cem Yıldız profil fotoğrafı" fill priority sizes="(min-width: 1280px) 260px, 100vw" className="object-cover" />
                </div>
                <div className="flex flex-col justify-between rounded-[1.5rem] bg-[var(--panel)] p-5">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Şu an çalıştığım alan</p>
                                        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Data Science + ML + canlı demo</h2>
                    <p className="mt-4 leading-7 text-[var(--text-secondary)]">Haftalık proje serisiyle her projeyi GitHub, LinkedIn ve demo çıktısıyla tamamlıyorum.</p>
                  </div>
                  <Link href="#hakkimda" className="mt-6 text-sm font-semibold text-[var(--accent)]">Hakkımda →</Link>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--panel)] p-5">
              <div className="rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--surface)] p-5">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Öne çıkan proje</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">WC2026 AI Simulator</h2>
                  </div>
                  <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">Canlı</span>
                </div>
                <div className="grid grid-cols-2 gap-3 py-5">
                  <Stat label="Takım" value="48" />
                  <Stat label="Maç" value="104" />
                  <Stat label="Simülasyon" value="10K" />
                  <Stat label="Model" value="xG" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-[var(--border-color)] py-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-6 sm:grid-cols-4 lg:px-8">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5">
              <p className="text-3xl font-semibold tracking-tight">{metric.value}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="hakkimda" className="border-b border-[var(--border-color)] bg-[var(--panel)] py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">About</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Hakkımda</h2>
          </div>
          <div className="grid gap-5">
            <p className="text-pretty text-xl leading-9 text-[var(--text-secondary)]">{portfolioData.about.description}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniCard title="Okul" text="ESOGÜ · MatBil 2. sınıf" />
              <MiniCard title="Odak" text="Data Science, ML, Full-Stack" />
              <MiniCard title="Konum" text="Eskişehir, Türkiye" />
            </div>
          </div>
        </div>
      </section>

      <section id="projeler" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">SEÇİLİ İŞLER</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Projeler</h2>
          </div>
          <p className="max-w-xl text-[var(--text-secondary)]">
            Her proje artık ayrı case study sayfasına bağlanıyor: problem, yaklaşım, stack, sonuç ve linkler tek yerde.
          </p>
        </div>

        <div className="grid gap-5">
          {selectedProjects.map((project, index) => (
            <article key={project.id} className="group grid gap-6 rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--surface)] p-6 transition hover:-translate-y-0.5 hover:border-[var(--accent)] md:grid-cols-[0.62fr_1.38fr]">
              <div className="flex flex-col justify-between rounded-[1.25rem] bg-[var(--bg)] p-5">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">{String(index + 1).padStart(2, '0')} · {project.category}</p>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight">{project.title}</h3>
                </div>
                <div className="mt-8 flex flex-wrap gap-2">
                  {project.technologies.slice(0, 4).map((tech) => (
                    <span key={tech} className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs text-[var(--text-secondary)]">{tech}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-between gap-8 py-1">
                <p className="text-pretty text-lg leading-8 text-[var(--text-secondary)]">{project.description}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {project.highlights.slice(0, 4).map((item) => (
                    <p key={item} className="rounded-2xl border border-[var(--border-color)] bg-[var(--panel)] p-4 text-sm text-[var(--text-secondary)]">{item}</p>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/projects/${project.slug}`} className="text-sm font-semibold text-[var(--accent)]">Detaylı inceleme →</Link>
                  {project.liveUrl && <Link href={project.liveUrl} target="_blank" className="text-sm font-semibold text-[var(--text-primary)]">Canlı demo →</Link>}
                  {project.githubUrl && <Link href={project.githubUrl} target="_blank" className="text-sm font-semibold text-[var(--text-primary)]">GitHub →</Link>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="yaklasim" className="border-y border-[var(--border-color)] bg-[var(--panel)] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">DATA LAB</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Çalışma şeklim</h2>
            </div>
            <div className="grid gap-4">
              {labNotes.map((note) => (
                <div key={note.title} className="rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--surface)] p-6">
                  <h3 className="text-xl font-semibold">{note.title}</h3>
                  <p className="mt-3 leading-7 text-[var(--text-secondary)]">{note.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="paylasimlar" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">AÇIKTA ÜRETİM</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Son paylaşımlar</h2>
          </div>
          <Link href="https://www.linkedin.com/in/cemyildizcy/" target="_blank" className="text-sm font-semibold text-[var(--accent)]">LinkedIn profilim →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {latestPosts.map((post) => (
            <Link key={post.url} href={post.url} target="_blank" className="rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--surface)] p-6 transition hover:border-[var(--accent)]">
              <p className="text-sm text-[var(--text-secondary)]">{post.meta}</p>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">{post.title}</h3>
              <p className="mt-6 text-sm font-semibold text-[var(--accent)]">Gönderiyi oku →</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="iletisim" className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--text-primary)] p-8 text-[var(--bg)] sm:p-12">
          <p className="text-sm font-medium uppercase tracking-[0.24em] opacity-70">İLETİŞİM</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Yeni veri projesi, staj fırsatı veya teknik sohbet için ulaşabilirsin.</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="mailto:cemyildizcy@hotmail.com" className="rounded-full bg-[var(--bg)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)]">Mail gönder</Link>
            <Link href="https://github.com/cemyildizcy" target="_blank" className="rounded-full border border-[var(--bg)]/20 px-5 py-3 text-sm font-semibold">GitHub</Link>
            <Link href="https://www.linkedin.com/in/cemyildizcy/" target="_blank" className="rounded-full border border-[var(--bg)]/20 px-5 py-3 text-sm font-semibold">LinkedIn</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--panel)] p-4">
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

function MiniCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5">
      <p className="text-sm text-[var(--text-secondary)]">{title}</p>
      <p className="mt-2 font-semibold tracking-tight">{text}</p>
    </div>
  );
}
