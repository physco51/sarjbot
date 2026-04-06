import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ŞarjBot - Türkiye EV Şarj Fiyatları",
  description:
    "Türkiye'deki tüm elektrikli araç şarj istasyonlarının güncel fiyatlarını karşılaştırın. ZES, Trugo, Eşarj, Voltrun ve daha fazlası.",
  keywords: "elektrikli araç, şarj istasyonu, fiyat karşılaştırma, ZES, Trugo, Eşarj, Türkiye",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
