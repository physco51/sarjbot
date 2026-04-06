import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SarjBot — Turkiye EV Sarj Fiyat Karsilastirma",
  description:
    "Turkiye'deki tum elektrikli arac sarj istasyonlarinin guncel fiyatlarini karsilastirin. ZES, Trugo, Esarj, Voltrun ve daha fazlasi.",
  keywords:
    "elektrikli arac, sarj istasyonu, fiyat karsilastirma, ZES, Trugo, Esarj, Turkiye, kWh fiyat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${outfit.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
