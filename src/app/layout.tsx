import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";
import "./portfolio.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cemyildiz.net"),
  title: { default: "Cem Yıldız | Yapay zekâ projeleri", template: "%s | Cem Yıldız" },
  description: "ESOGÜ Matematik ve Bilgisayar Bilimleri öğrencisi Cem Yıldız'ın makine öğrenmesi yolculuğu ve yapay zekâ destekli ürün projeleri.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="tr" className={`${GeistSans.variable} ${GeistMono.variable}`}><body><a className="skip" href="#main">İçeriğe geç</a><Navbar/><div id="main">{children}</div><Footer/></body></html>;
}
