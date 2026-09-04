import type { MetadataRoute } from "next";
import { getAllOperatorsWithPrices } from "@/lib/db/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sarjbot.com";
  const operators = await getAllOperatorsWithPrices();

  const operatorUrls: MetadataRoute.Sitemap = operators.map((op) => ({
    url: `${baseUrl}/operatorler/${op.slug}`,
    lastModified: op.lastUpdated ? new Date(op.lastUpdated) : new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const mainUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/karsilastir`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hesapla`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hakkinda`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [...mainUrls, ...operatorUrls];
}