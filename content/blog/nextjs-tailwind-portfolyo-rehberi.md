---
title: "Next.js ve Tailwind CSS ile Portfolyo Sitesi Nasıl Yapılır?"
date: "2026-05-22"
excerpt: "Sıfırdan modern bir portfolyo sitesi geliştirme sürecim: Next.js 15, Tailwind CSS 4, Framer Motion ve Vercel deployment."
tags: ["Next.js", "Tailwind CSS", "React", "Web Geliştirme", "Vercel"]
readTime: "7 dk"
coverEmoji: "🚀"
---

# Next.js ve Tailwind CSS ile Portfolyo Sitesi Nasıl Yapılır?

Bir yazılımcının en iyi CV'si, kendi portfolyo sitesidir. Bu yazıda, şu an okuduğunuz **cemyildiz.net** sitesini nasıl geliştirdiğimi anlatacağım.

## Neden Portfolyo Sitesi?

LinkedIn güzel, GitHub profili faydalı. Ama kendi domain'inizde, kendi tasarımınızla bir site — bambaşka bir izlenim bırakır.

Recruiter'lar günde yüzlerce CV görüyor. Ama **cemyildiz.net** linkini gören biri, tıklamadan edemez.

## Teknoloji Seçimleri

### Next.js 15 — Neden?

- **Statik site üretimi (SSG):** Blog yazıları build time'da render ediliyor. Sayfa yükleme süresi neredeyse sıfır.
- **App Router:** Dosya tabanlı routing. `app/blog/page.tsx` = `/blog` sayfası. Basit ve güçlü.
- **SEO:** Meta tag'ler, Open Graph, JSON-LD — hepsi built-in.

### Tailwind CSS 4 — Neden?

- **Utility-first:** Class yazarak tasarlıyorsun. CSS dosyası açmaya gerek yok.
- **Dark/Light mode:** CSS değişkenleriyle tek satırda geçiş.
- **@theme direktifi:** Tailwind 4'ün yeni özelliği. Renkleri global olarak tanımla, her yerde kullan.

```css
@theme {
  --color-accent: #6366f1;
  --color-surface: #141414;
}
```

### Framer Motion — Neden?

Sayfa geçişleri ve scroll animasyonları için kullandım. Bir `<ScrollReveal>` component'ı yazdım, her section scroll'a girince yumuşak bir fade-in efekti ile ortaya çıkıyor.

```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
>
  {children}
</motion.div>
```

## Tasarım Kararları

### Renk Paleti

**Indigo (#6366f1)** accent rengi seçtim. Veri bilimi ve teknoloji alanında profesyonel ama sıkıcı olmayan bir his veriyor. Dark mode varsayılan — çünkü geliştiriciler dark mode sever.

### Font

**Geist** — Vercel'in kendi fontu. Monokrom tasarıma mükemmel uyuyor. Sans ve Mono varyantları var.

### Glassmorphism

Navbar'da scroll edince aktif olan bir `glass` efekti var:

```css
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

## Yapı

```
src/
├── app/
│   ├── page.tsx          → Ana sayfa
│   ├── blog/             → Blog sayfaları
│   └── layout.tsx        → Global layout
├── components/
│   ├── sections/         → Hero, About, Projects...
│   ├── layout/           → Navbar, Footer
│   └── ui/               → ScrollReveal, SectionHeading
├── data/
│   └── portfolio.ts      → Tüm CV verileri
└── lib/
    └── blog.ts           → Markdown okuma fonksiyonları
```

Tüm CV verilerini (`portfolio.ts`) tek bir dosyada tutuyorum. Bir şey değiştirmek istediğimde sadece o dosyayı açıyorum.

## Deployment

**Vercel** ile deployment inanılmaz kolay:

1. GitHub repo'yu Vercel'e bağla.
2. Her push'ta otomatik deploy.
3. Custom domain ekle (`cemyildiz.net`).
4. SSL sertifikası otomatik.

Toplam süre: **3 dakika.**

## Karşılaştığım Sorunlar

### 1. Tailwind CSS 4 ve CSS Variables

Tailwind 4'te `tailwind.config.ts` yerine `@theme` direktifi kullanılıyor. Eski örnekler çalışmıyor. Çözüm: `globals.css` içinde CSS custom properties tanımlayıp, `@theme` ile Tailwind'e bağlamak.

### 2. lucide-react ve React 19

`lucide-react@0.359.0` GitHub ve LinkedIn ikonlarını içeriyordu ama React 19 ile uyumsuzdu. Çözüm: İkonları inline SVG component'larına çevirdim.

### 3. Vercel Build Hatası

`next.config.ts` içindeki `images.domains` (deprecated) Vercel'de `path undefined` hatası verdi. `images.remotePatterns` ile değiştirince çözüldü.

## Sonuç

Kendi portfolyo sitenizi yapmak, hem öğretici hem de kariyer açısından çok değerli. Başlamak için mükemmel bir teknoloji stack'i:

- **Next.js** — SEO ve performans
- **Tailwind CSS** — hızlı tasarım
- **Framer Motion** — şık animasyonlar
- **Vercel** — ücretsiz ve hızlı deploy

Kodun tamamı GitHub'da açık: [github.com/cemyildizcy/cemyildiz-portfolio](https://github.com/cemyildizcy/cemyildiz-portfolio)
