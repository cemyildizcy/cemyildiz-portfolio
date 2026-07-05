import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cemyildiz.net"),
  title: {
    default: "Cem Yıldız — Veri Bilimi, ML & Spor Analitiği",
    template: "%s | Cem Yıldız",
  },
  description:
    "Matematik & Bilgisayar Bilimleri öğrencisiyim. Python, makine öğrenmesi ve Next.js ile spor analitiği ve etkileşimli dashboard projeleri geliştiriyorum.",
  keywords: [
    "Cem Yıldız",
    "veri bilimi",
    "makine öğrenimi",
    "spor analitiği",
    "sports analytics",
    "Python",
    "dashboard",
    "portfolio",
    "ESOGÜ",
  ],
  authors: [{ name: "Cem Yıldız" }],
  creator: "Cem Yıldız",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://cemyildiz.net",
    siteName: "Cem Yıldız",
    title: "Cem Yıldız — Veri Bilimi, ML & Spor Analitiği",
    description:
      "Veriyi projeye, projeyi anlatılabilir ürüne çeviriyorum. DS/ML ve spor analitiği projeleri.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cem Yıldız Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cem Yıldız — Veri Bilimi, ML & Spor Analitiği",
    description:
      "Veriyi projeye, projeyi anlatılabilir ürüne çeviriyorum.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Cem Yıldız",
  url: "https://cemyildiz.net",
  jobTitle: "Veri Bilimi & Spor Analitiği",
  description:
    "ESOGÜ Matematik & Bilgisayar Bilimleri öğrencisi. Veri bilimi, makine öğrenmesi ve spor analitiği projeleri geliştiriyor.",
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Eskişehir Osmangazi Üniversitesi",
  },
  knowsAbout: [
    "Data Science",
    "Machine Learning",
    "Sports Analytics",
    "Python",
    "Dashboard Development",
  ],
  sameAs: [
    "https://www.linkedin.com/in/cemyildizcy/",
    "https://github.com/cemyildizcy",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-text">
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
