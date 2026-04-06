import type { Metadata } from "next";
import { Inter, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ŞarjBot — Türkiye EV Şarj Fiyat Karşılaştırma",
  description:
    "Türkiye'deki tüm elektrikli araç şarj istasyonlarının güncel fiyatlarını karşılaştırın. ZES, Trugo, Eşarj, Voltrun ve daha fazlası.",
  keywords:
    "elektrikli araç, şarj istasyonu, fiyat karşılaştırma, ZES, Trugo, Eşarj, Türkiye, kWh fiyat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${nunitoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
