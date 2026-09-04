import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ŞarjBot — Türkiye EV Şarj Fiyat Karşılaştırma",
    short_name: "ŞarjBot",
    description:
      "Türkiye'deki tüm elektrikli araç şarj istasyonlarının güncel fiyatlarını karşılaştırın.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1120",
    theme_color: "#10b981",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}