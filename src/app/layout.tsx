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
    default: "Cem Yıldız — Veri Bilimi & Makine Öğrenimi",
    template: "%s | Cem Yıldız",
  },
  description:
    "Veri bilimi, makine öğrenimi ve derin öğrenme üzerine çalışan yazılımcı. Python, Scikit-learn, TensorFlow, XGBoost ve modern veri bilimi araçlarıyla projeler geliştiriyorum.",
  keywords: [
    "Cem Yıldız",
    "veri bilimi",
    "makine öğrenimi",
    "derin öğrenme",
    "Python",
    "Scikit-learn",
    "TensorFlow",
    "portfolio",
  ],
  authors: [{ name: "Cem Yıldız" }],
  creator: "Cem Yıldız",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://cemyildiz.net",
    siteName: "Cem Yıldız",
    title: "Cem Yıldız — Veri Bilimi & Makine Öğrenimi",
    description:
      "Veri bilimi, makine öğrenimi ve derin öğrenme üzerine çalışan yazılımcı.",
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
    title: "Cem Yıldız — Veri Bilimi & Makine Öğrenimi",
    description:
      "Veri bilimi, makine öğrenimi ve derin öğrenme.",
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
  jobTitle: "Veri Bilimi & Makine Öğrenimi",
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
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-[var(--bg)] text-[var(--text-primary)] min-h-screen`}>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
