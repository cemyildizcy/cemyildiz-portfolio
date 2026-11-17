import Image from "next/image";
import Link from "next/link";
import { projects } from "@/data/projects";
import { getAllPosts } from "@/lib/blog";
import { getPublications, statusLabel } from "@/lib/publications";

const socialLinks = [
  { label: "GitHub", href: "https://github.com/cemyildizcy" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/cemyildizcy/" },
  { label: "E-posta", href: "mailto:cemyildizcy@hotmail.com" },
];

function ProjectLinks({ project }: { project: (typeof projects)[number] }) {
  return (
    <div className="project-links">
      {project.links.map((link) => (
        <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
          {link.label}
        </a>
      ))}
      <Link href={project.caseHref} aria-label={`${project.title} vaka analizini aç`}>
        Vaka analizi
      </Link>
    </div>
  );
}

export default function Home() {
  const writing = getAllPosts().slice(0, 3);
  const [gundem, , bikeDemand, fashionMnist, wc2026] = projects;
  const updates = getPublications().slice(0, 3);

  return (
    <main className="portfolio-home">
      <section className="home-hero" aria-labelledby="hero-title">
        <div className="hero-identity">
          <Image
            className="hero-portrait"
            src="/images/profile.jpg"
            alt="Cem Yıldız profil fotoğrafı"
            width={400}
            height={400}
            priority
          />
          <div className="hero-intro">
            <h1 id="hero-title">Cem Yıldız</h1>
            <p className="hero-thesis">Meraktan<br />çalışan bir şeye.</p>
            <p className="hero-position">
              ESOGÜ Matematik ve Bilgisayar Bilimleri öğrencisiyim. Yapay zekâ ve makine öğrenmesiyle, gerçek problemler için ürünler geliştiriyorum.
            </p>
            <p className="hero-method">
              Matematik, yapay zekâ ve gerçek problemler. Öğrendiklerimi yalnız not almıyor, bir şeyler yaparak sınıyorum.
            </p>
            <div className="hero-actions">
              <Link className="button-primary" href="#work">Projeleri gör</Link>
              <a href="/documents/Cem_Yildiz_CV.pdf" download>CV&apos;yi indir</a>
            </div>
          </div>
        </div>

        <article className="hero-product" aria-labelledby="hero-product-title">
          <div className="hero-product-copy">
            <p className="product-status">Android · {gundem.status}</p>
            <h2 id="hero-product-title">{gundem.title}</h2>
            <p>Gündemi kaybetmeden,<br />gürültüyü azaltmak.</p>
            <ProjectLinks project={gundem} />
          </div>
          <div className="phone-frame">
            <Image
              src={gundem.image.src}
              alt={gundem.image.alt}
              width={gundem.image.width}
              height={gundem.image.height}
              priority
              sizes="(max-width: 760px) 31vw, 230px"
            />
          </div>
        </article>
      </section>

      <section id="work" className="work-showcase" aria-labelledby="work-title">
        <header className="section-intro">
          <h2 id="work-title">Üretilen işler</h2>
          <p>Bir soru. Bir deneme.<br />İncelenebilir bir sonuç.</p>
        </header>

        <article className="project-feature project-primary">
          <div className="project-visual project-visual-phone">
            <Image src={gundem.image.src} alt={gundem.image.alt} width={gundem.image.width} height={gundem.image.height} sizes="(max-width: 760px) 70vw, 360px" />
          </div>
          <div className="project-copy">
            <p className="product-status">{gundem.status}</p>
            <h3>{gundem.title}</h3>
            <p>{gundem.short}</p>
            <p className="project-limit">Sınır: {gundem.limits}</p>
            <ProjectLinks project={gundem} />
          </div>
        </article>

        <article className="project-feature project-secondary">
          <div className="project-copy">
            <p className="product-status">{bikeDemand.status}</p>
            <h3>{bikeDemand.title}</h3>
            <p>{bikeDemand.short}</p>
            <p className="project-limit">Sınır: {bikeDemand.limits}</p>
            <ProjectLinks project={bikeDemand} />
          </div>
          <figure className="project-chart">
            <Image src={bikeDemand.image.src} alt={bikeDemand.image.alt} width={bikeDemand.image.width} height={bikeDemand.image.height} sizes="(max-width: 760px) 92vw, 500px" />
          </figure>
        </article>

        <article className="project-feature project-dl">
          <div className="project-copy">
            <p className="product-status">{fashionMnist.status}</p>
            <h3>{fashionMnist.title}</h3>
            <p>{fashionMnist.short}</p>
            <p className="project-limit">Sınır: {fashionMnist.limits}</p>
            <ProjectLinks project={fashionMnist} />
          </div>
          <figure className="project-chart">
            <Image src={fashionMnist.image.src} alt={fashionMnist.image.alt} width={fashionMnist.image.width} height={fashionMnist.image.height} sizes="(max-width: 760px) 92vw, 500px" />
          </figure>
        </article>

        <article className="project-feature project-tertiary">
          <div className="project-copy">
            <p className="product-status">{wc2026.status}</p>
            <h3>{wc2026.title}</h3>
            <p>{wc2026.short}</p>
            <p className="project-limit">Sınır: {wc2026.limits}</p>
            <ProjectLinks project={wc2026} />
          </div>
          <figure className="project-chart">
            <Image src={wc2026.image.src} alt={wc2026.image.alt} width={wc2026.image.width} height={wc2026.image.height} sizes="(max-width: 760px) 92vw, 500px" />
          </figure>
        </article>
      </section>

      <section className="home-journal" aria-labelledby="journal-title">
        <header className="section-intro"><h2 id="journal-title">Masanın üstünde.</h2><Link className="text-link" href="/updates">Çalışma günlüğü <span aria-hidden="true">↗</span></Link></header>
        <p className="journal-intro">Yaparken öğrendiklerim, yeni projeler ve küçük ilerlemeler.</p>
        <div className="journal-list">{updates.map(entry => <article key={entry.id}>
          <div className="journal-meta"><time dateTime={entry.date}>{new Intl.DateTimeFormat("tr-TR", {day: "numeric", month: "long", year: "numeric"}).format(new Date(entry.date + "T12:00:00Z"))}</time><span>{statusLabel(entry.status)}</span></div>
          <h3><Link href={`/updates/${entry.id}`}>{entry.title}</Link></h3><p>{entry.summary}</p>
          <Link className="text-link" href={entry.type === "project" ? `/work/${entry.id}` : `/updates/${entry.id}`}>Çalışmayı incele <span aria-hidden="true">↗</span></Link>
        </article>)}</div>
      </section>

      <section className="home-notes" aria-labelledby="writing-title">
        <div className="writing-column">
          <header className="section-intro compact">
            <h2 id="writing-title">Seçilmiş yazılar</h2>
            <Link href="/blog">Tüm yazılar</Link>
          </header>
          <div className="writing-list-home">
            {writing.map((post) => (
              <article key={post.slug}>
                <p>{post.readTime}</p>
                <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
              </article>
            ))}
          </div>
        </div>

        <div id="review-desk" className="review-note" aria-labelledby="review-title">
          <h2 id="review-title">AI İnceleme Masası</h2>
          <p>Sınırlandırılmış iddiaları kaynaklarla karşılaştıran deneysel inceleme aracı.</p>
          <Link href="/ai-inceleme-masasi">İnceleme masasını aç</Link>
        </div>
      </section>

      <section id="about" className="about-section" aria-labelledby="about-title">
        <div>
          <h2 id="about-title">Birlikte iyi bir<br />soru bulalım.</h2>
          <p>Eskişehir’de matematik ve bilgisayar bilimleri okuyorum. Yapay zekâ, makine öğrenmesi ve işe yarayan ürünler üzerine çalışıyorum. Staj, proje veya yalnızca iyi bir fikir için yazabilirsin.</p>
          <div className="contact-links">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}>{link.label}</a>
            ))}
          </div>
        </div>
        <div id="now" className="education">
          <h2>Eğitim</h2>
          <p><strong>Eskişehir Osmangazi Üniversitesi</strong><br />Matematik ve Bilgisayar Bilimleri, lisans<br />2026–2027 döneminde 3. sınıf</p>
        </div>
      </section>
    </main>
  );
}
