import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cemyildiz.net"),
  title: { default: "Cem Yıldız | Kanıt defteri", template: "%s | Cem Yıldız" },
  description: "Cem Yıldız'ın seçili makine öğrenmesi projelerini, katkılarını, sınırlarını ve yapay zekânın rolünü belgelediği kanıt defteri.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="tr" className={GeistMono.variable}><body><a className="skip" href="#main">İçeriğe geç</a><Navbar/><div id="main">{children}</div><Footer/></body></html>;
}
