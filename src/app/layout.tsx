import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/layout/CustomCursor";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cemyildiz.net"),
  title: {
    default: "Cem Yıldız — Veri Bilimi & Full-Stack Developer",
    template: "%s | Cem Yıldız",
  },
  description:
    "Veri bilimi, makine öğrenimi ve full-stack web geliştirme üzerine çalışan yazılımcı. Python, React, FastAPI, XGBoost ve modern web teknolojileriyle projeler geliştiriyorum.",
  keywords: [
    "Cem Yıldız",
    "veri bilimi",
    "makine öğrenimi",
    "full-stack developer",
    "Python",
    "React",
    "Next.js",
    "portfolio",
  ],
  authors: [{ name: "Cem Yıldız" }],
  creator: "Cem Yıldız",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://cemyildiz.net",
    siteName: "Cem Yıldız",
    title: "Cem Yıldız — Veri Bilimi & Full-Stack Developer",
    description:
      "Veri bilimi, makine öğrenimi ve full-stack web geliştirme üzerine çalışan yazılımcı.",
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
    title: "Cem Yıldız — Veri Bilimi & Full-Stack Developer",
    description:
      "Veri bilimi, makine öğrenimi ve full-stack web geliştirme.",
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
  jobTitle: "Veri Bilimi & Full-Stack Developer",
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Eskişehir Osmangazi Üniversitesi",
  },
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
      <body className="noise">
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <CustomCursor />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
