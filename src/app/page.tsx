import Image from "next/image";
import Link from "next/link";
import { projects } from "@/data/projects";
import { getAllPosts } from "@/lib/blog";

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
  const [gundem, sleepinfo, wc2026] = projects;

  return (
    <main>
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
            <p className="eyebrow">Eskişehir, Türkiye</p>
            <h1 id="hero-title">Cem Yıldız</h1>
            <p className="hero-position">
              ESOGÜ Matematik ve Bilgisayar Bilimleri öğrencisiyim. İstatistik ve klasik makine öğrenmesi temellerimi güçlendiriyor, derin öğrenmeye hazırlanıyorum.
            </p>
            <p className="hero-method">
              Yapay zekâyı araştırma, üretim, orkestrasyon ve eleştiri için yoğun biçimde kullanarak gerçek ürünler geliştiriyorum.
            </p>
            <div className="hero-actions">
              <Link className="button-primary" href="#work">Projeleri gör</Link>
              <a href="/documents/Cem_Yildiz_CV.pdf" download>CV&apos;yi indir</a>
            </div>
          </div>
        </div>

        <article className="hero-product" aria-labelledby="hero-product-title">
          <div className="hero-product-copy">
            <p className="product-status">{gundem.status}</p>
            <h2 id="hero-product-title">{gundem.title}</h2>
            <p>{gundem.short}</p>
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
          <p>Çalışan ürünler ve doğrulanabilir çıktılar.</p>
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
            <p className="product-status">{sleepinfo.status}</p>
            <h3>{sleepinfo.title}</h3>
            <p>{sleepinfo.short}</p>
            <p className="project-limit">Sınır: {sleepinfo.limits}</p>
            <ProjectLinks project={sleepinfo} />
          </div>
          <div className="project-visual project-visual-illustration">
            <Image src={sleepinfo.image.src} alt={sleepinfo.image.alt} width={sleepinfo.image.width} height={sleepinfo.image.height} sizes="(max-width: 760px) 80vw, 420px" />
          </div>
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
          <p className="eyebrow">Yan çalışma</p>
          <h2 id="review-title">AI İnceleme Masası</h2>
          <p>Sınırlandırılmış iddiaları kaynaklarla karşılaştıran deneysel inceleme aracı.</p>
          <Link href="/ai-inceleme-masasi">İnceleme masasını aç</Link>
        </div>
      </section>

      <section id="about" className="about-section" aria-labelledby="about-title">
        <div>
          <h2 id="about-title">Hakkımda</h2>
          <p>Yapay zekâ desteğini güçlü biçimde kullanıyor; ürün kararları, doğrulama ve yayımlanan işlerin sorumluluğunu üstleniyorum.</p>
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
