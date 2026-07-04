import Image from 'next/image';
import Link from 'next/link';
import { portfolioData } from '@/data/portfolio';
import { projectCaseStudies } from '@/data/projectHelpers';
import { getAllPosts } from '@/lib/blog';

const featuredProject = projectCaseStudies[0];
const selectedProjects = projectCaseStudies;

const heroRotations = [
  {
    eyebrow: '01 · Sports analytics',
    title: 'Turnuva simülasyonları kuruyorum.',
    text: 'WC2026 projesinde takım gücü, ELO, oyuncu verisi ve Poisson xG modelini birleştirip 10.000 Monte Carlo turnuvası çalıştırdım.',
  },
  {
    eyebrow: '02 · Machine learning',
    title: 'Davranıştan tahmin modelleri çıkarıyorum.',
    text: 'Öğrenci alışkanlıkları, churn ve sağlık verilerinde feature engineering, sınıflandırma ve model açıklanabilirliği üzerine çalışıyorum.',
  },
  {
    eyebrow: '03 · Data product',
    title: 'Notebook çıktısını canlı ürüne taşıyorum.',
    text: 'Projeleri README, dashboard, case study, GitHub ve LinkedIn anlatısıyla paylaşılabilir ürün haline getiriyorum.',
  },
];

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



export default function Home() {
  const blogPosts = getAllPosts().slice(0, 3);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <section className="relative overflow-hidden border-b border-[var(--border-color)] pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="absolute inset-0 lab-grid opacity-70" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)]">
              Veri Bilimi / ML stajı için müsaitim · CV + projeler hazır
            </p>
            <h1 className="text-balance text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">
              Veri bilimi ve makine öğrenimi projelerini canlı ürüne çeviren öğrenci geliştirici.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-xl leading-9 text-[var(--text-secondary)]">
              ESOGÜ Matematik ve Bilgisayar Bilimleri 2. sınıf öğrencisiyim. Python, pandas, scikit-learn ve modern web araçlarıyla veri temizlemeden modellemeye, dashboard’dan case study’ye kadar uçtan uca projeler geliştiriyorum.
            </p>
            <p className="mt-4 max-w-2xl rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
              EN: Data Science / ML intern candidate building end-to-end Python projects: data cleaning, modeling, dashboards, and public case studies.
            </p>
            <div className="hero-console mt-8 rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface)] p-4 shadow-2xl shadow-black/10">
              <div className="mb-4 flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <div className="flex gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-xs text-[var(--text-secondary)]">cem-data-lab/run</span>
              </div>
              <div className="grid gap-3 text-sm sm:text-base">
                <div className="console-line"><span>01</span><strong>Veriyi oku</strong><em>ham veri → temiz tablo</em></div>
                <div className="console-line"><span>02</span><strong>Modeli kur</strong><em>feature → deney → metrik</em></div>
                <div className="console-line"><span>03</span><strong>Ürüne taşı</strong><em>dashboard → case study → paylaşım</em></div>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="#projeler" className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--text-primary)] px-6 text-sm font-semibold text-[var(--bg)] transition hover:opacity-85">
                Projeleri gör
              </Link>
              <a href="/documents/Cem_Yildiz_CV.pdf" download="Cem_Yildiz_CV.pdf" className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--surface)] px-6 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent)]">
                CV İndir
              </a>
              <Link href="mailto:cemyildizcy@hotmail.com?subject=Staj%20F%C4%B1rsat%C4%B1%20-%20Cem%20Y%C4%B1ld%C4%B1z" className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--surface)] px-6 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent)]">
                Staj için mail at
              </Link>
            </div>
          </div>

          <aside className="grid gap-5">
            <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface)] p-5 shadow-2xl shadow-black/10">
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[var(--accent-soft)] blur-3xl" aria-hidden="true" />
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">Dönen işler</p>
              <div className="hero-rotator mt-6 min-h-[15rem]">
                {heroRotations.map((item, index) => (
                  <div key={item.title} className="hero-rotator-item rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--panel)] p-6" style={{ animationDelay: `${index * 4}s` }}>
                    <p className="text-sm text-[var(--text-secondary)]">{item.eyebrow}</p>
                    <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">{item.title}</h2>
                    <p className="mt-5 leading-7 text-[var(--text-secondary)]">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--panel)] p-5 transition duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10">
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
                <Link href={`/projects/${featuredProject.slug}`} className="inline-flex w-full justify-center rounded-full bg-[var(--text-primary)] px-5 py-3 text-sm font-semibold text-[var(--bg)] transition hover:opacity-85">
                  Case study’yi aç →
                </Link>
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

      <section className="border-b border-[var(--border-color)] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-5 rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface)] p-6 lg:grid-cols-[0.55fr_1.45fr] lg:p-8">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">Şu an açık olduğum alanlar</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Veri Bilimi / ML stajı, sports analytics ve dashboard projeleri.</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <MiniCard title="Staj odağı" text="Data Science · ML · Python Data Analyst" />
              <MiniCard title="Kanıt formatı" text="GitHub + canlı demo + case study" />
              <MiniCard title="Çalışma şekli" text="Veri temizleme → model → dashboard/API" />
            </div>
          </div>
        </div>
      </section>

      <section id="hakkimda" className="border-b border-[var(--border-color)] bg-[var(--panel)] py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:px-8">
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-[var(--accent-soft)] blur-2xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface)] p-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
                <Image src="/images/profile.jpg" alt="Cem Yıldız profil fotoğrafı" fill sizes="(min-width: 1024px) 420px, 100vw" className="object-cover object-center" />
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">HAKKIMDA</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Model kuran, anlatan ve ürüne çeviren öğrenci.</h2>
            <p className="mt-6 text-pretty text-xl leading-9 text-[var(--text-secondary)]">{portfolioData.about.description}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <MiniCard title="Aradığım fırsatlar" text="DS/ML stajı, analytics dashboard, sports analytics" />
              <MiniCard title="Nasıl çalışıyorum" text="Veri temizleme → feature → model → dashboard/API → case study" />
              <MiniCard title="Şu an öğreniyorum" text="Time series, deep learning, MLOps basics, model evaluation" />
              <MiniCard title="Kanıt" text="WC2026, SleepInfo, Churn: canlı/demo/repo/case study" />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/about" className="rounded-full bg-[var(--text-primary)] px-5 py-3 text-sm font-semibold text-[var(--bg)]">Detaylı hakkımda</Link>
              <Link href="#projeler" className="rounded-full border border-[var(--border-color)] px-5 py-3 text-sm font-semibold">Projeleri incele</Link>
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

        <div className="mb-8 grid gap-4 rounded-[2rem] border border-[var(--border-color)] bg-[var(--panel)] p-6 md:grid-cols-[0.45fr_1.55fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">60 saniyen varsa</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">Önce bu 3 projeye bak.</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <MiniCard title="WC2026" text="Probabilistic sports simulation + dashboard" />
            <MiniCard title="SleepInfo" text="Full-stack ML product + API/frontend" />
            <MiniCard title="Churn" text="Business ML + feature engineering" />
          </div>
        </div>

        <div className="grid gap-5">
          {selectedProjects.map((project, index) => (
            <article key={project.id} className="group grid gap-6 rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--surface)] p-6 transition duration-500 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-2xl hover:shadow-black/10 md:grid-cols-[0.62fr_1.38fr]">
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

        <div className="mt-10 rounded-[2rem] border border-[var(--accent)] bg-[var(--accent-soft)] p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">Staj CTA</p>
          <h3 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight">Veri bilimi stajı, ML projesi veya teknik iş birliği için konuşalım.</h3>
          <p className="mt-4 max-w-2xl text-[var(--text-secondary)]">CV’mi indirebilir, GitHub projelerimi inceleyebilir veya doğrudan mail atabilirsin.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/documents/Cem_Yildiz_CV.pdf" download="Cem_Yildiz_CV.pdf" className="rounded-full bg-[var(--text-primary)] px-5 py-3 text-sm font-semibold text-[var(--bg)]">CV indir</a>
            <Link href="mailto:cemyildizcy@hotmail.com?subject=Staj%20F%C4%B1rsat%C4%B1%20-%20Cem%20Y%C4%B1ld%C4%B1z" className="rounded-full border border-[var(--border-color)] px-5 py-3 text-sm font-semibold">Mail gönder</Link>
            <Link href="https://www.linkedin.com/in/cemyildizcy/" target="_blank" className="rounded-full border border-[var(--border-color)] px-5 py-3 text-sm font-semibold">LinkedIn’den yaz</Link>
          </div>
        </div>
      </section>

      <section id="yaklasim" className="border-y border-[var(--border-color)] bg-[var(--panel)] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">DATA LAB</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Çalışma akışım</h2>
            </div>
            <p className="max-w-xl text-[var(--text-secondary)]">Her projeyi aynı net akışla kapatıyorum: veri, model, ürün, paylaşım.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {['Veriyi temizle', 'Modeli karşılaştır', 'Dashboard/rapor üret', 'Case study olarak paylaş'].map((step, index) => (
              <div key={step} className="rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--surface)] p-6 transition duration-500 hover:-translate-y-1 hover:border-[var(--accent)]">
                <p className="font-mono text-sm text-[var(--accent)]">0{index + 1}</p>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">BLOG</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Son yazılar</h2>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-[var(--accent)]">Tüm yazılar →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--surface)] p-6 transition duration-500 hover:-translate-y-1 hover:border-[var(--accent)]">
              <p className="text-3xl">{post.coverEmoji}</p>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">{post.title}</h3>
              <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{post.excerpt}</p>
              <p className="mt-6 text-sm font-semibold text-[var(--accent)]">{post.readTime} · Oku →</p>
            </Link>
          ))}
        </div>
      </section>

      

      <section id="iletisim" className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--text-primary)] p-8 text-[var(--bg)] sm:p-12">
          <p className="text-sm font-medium uppercase tracking-[0.24em] opacity-70">İLETİŞİM</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Veri bilimi stajı, ML projesi veya teknik iş birliği için konuşalım.</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/documents/Cem_Yildiz_CV.pdf" download="Cem_Yildiz_CV.pdf" className="rounded-full bg-[var(--bg)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)]">CV indir</a>
            <Link href="mailto:cemyildizcy@hotmail.com?subject=Staj%20F%C4%B1rsat%C4%B1%20-%20Cem%20Y%C4%B1ld%C4%B1z" className="rounded-full border border-[var(--bg)]/20 px-5 py-3 text-sm font-semibold text-[var(--bg)] hover:bg-[var(--bg)]/10 transition">Mail gönder</Link>
            <Link href="https://www.linkedin.com/in/cemyildizcy/" target="_blank" className="rounded-full border border-[var(--bg)]/20 px-5 py-3 text-sm font-semibold text-[var(--bg)] hover:bg-[var(--bg)]/10 transition">LinkedIn</Link>
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
