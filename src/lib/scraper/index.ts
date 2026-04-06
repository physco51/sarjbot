import { db } from "../db";
import { operators, prices, priceHistory, scrapeLogs } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { parseTurkishPrice } from "./utils";
import * as cheerio from "cheerio";

interface ScrapedPrice {
  slug: string;
  chargeType: "AC" | "DC" | "HPC";
  priceMin: number;
  priceMax: number | null;
  source: string;
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// ---- Operator-specific scrapers ----

async function scrapeZES(): Promise<ScrapedPrice[]> {
  const html = await fetchHtml("https://zes.net/fiyatlar-tr");
  if (!html) return [];
  const results: ScrapedPrice[] = [];
  const $ = cheerio.load(html);
  const text = $.text();

  // ZES page has structured price info - look for kWh prices
  const acMatch = text.match(/AC[\s\S]*?(\d+[.,]\d+)\s*₺/i) || text.match(/22\s*kW[\s\S]*?(\d+[.,]\d+)/i);
  const dcMatch = text.match(/180\s*kW.*?altı[\s\S]*?(\d+[.,]\d+)/i) || text.match(/DC[\s\S]*?(\d+[.,]\d+)\s*₺/i);
  const hpcMatch = text.match(/180\s*kW.*?720[\s\S]*?(\d+[.,]\d+)/i) || text.match(/HPC[\s\S]*?(\d+[.,]\d+)/i);

  if (acMatch) {
    const p = parseTurkishPrice(acMatch[1]);
    if (p) results.push({ slug: "zes", chargeType: "AC", priceMin: p.min, priceMax: p.max, source: "zes.net" });
  }
  if (dcMatch) {
    const p = parseTurkishPrice(dcMatch[1]);
    if (p) results.push({ slug: "zes", chargeType: "DC", priceMin: p.min, priceMax: p.max, source: "zes.net" });
  }
  if (hpcMatch) {
    const p = parseTurkishPrice(hpcMatch[1]);
    if (p) results.push({ slug: "zes", chargeType: "HPC", priceMin: p.min, priceMax: p.max, source: "zes.net" });
  }
  return results;
}

async function scrapeTuncmatik(): Promise<ScrapedPrice[]> {
  const html = await fetchHtml("https://tuncmatikcharge.com/fiyatlar/");
  if (!html) return [];
  const results: ScrapedPrice[] = [];
  const $ = cheerio.load(html);
  const text = $.text();

  const acMatch = text.match(/AC[\s\S]*?(\d+[.,]\d+)\s*₺/i);
  const dcMatch = text.match(/DC[\s\S]*?(\d+[.,]\d+)\s*₺/i);

  if (acMatch) {
    const p = parseTurkishPrice(acMatch[1]);
    if (p) results.push({ slug: "tuncmatik", chargeType: "AC", priceMin: p.min, priceMax: p.max, source: "tuncmatikcharge.com" });
  }
  if (dcMatch) {
    const p = parseTurkishPrice(dcMatch[1]);
    if (p) results.push({ slug: "tuncmatik", chargeType: "DC", priceMin: p.min, priceMax: p.max, source: "tuncmatikcharge.com" });
  }
  return results;
}

async function scrapeVoltrun(): Promise<ScrapedPrice[]> {
  const html = await fetchHtml("https://www.voltrun.com/voltrun-uyelik-tarife/");
  if (!html) return [];
  const results: ScrapedPrice[] = [];
  const $ = cheerio.load(html);
  const text = $.text();

  const acMatch = text.match(/AC[\s\S]*?(\d+[.,]\d+)\s*(?:₺|TL)/i);
  const dcMatch = text.match(/DC[\s\S]*?(\d+[.,]\d+)\s*(?:₺|TL)/i);

  if (acMatch) {
    const p = parseTurkishPrice(acMatch[1]);
    if (p) results.push({ slug: "voltrun", chargeType: "AC", priceMin: p.min, priceMax: p.max, source: "voltrun.com" });
  }
  if (dcMatch) {
    const p = parseTurkishPrice(dcMatch[1]);
    if (p) results.push({ slug: "voltrun", chargeType: "DC", priceMin: p.min, priceMax: p.max, source: "voltrun.com" });
  }
  return results;
}

async function scrapeBeefull(): Promise<ScrapedPrice[]> {
  const html = await fetchHtml("https://beefull.com/tarifeler/elektrikli-arac-tarifesi/");
  if (!html) return [];
  const results: ScrapedPrice[] = [];
  const $ = cheerio.load(html);
  const text = $.text();

  const acMatch = text.match(/AC[\s\S]*?(\d+[.,]\d+)\s*(?:₺|TL)/i);
  const dcMatch = text.match(/DC[\s\S]*?(\d+[.,]\d+)\s*(?:₺|TL)/i);

  if (acMatch) {
    const p = parseTurkishPrice(acMatch[1]);
    if (p) results.push({ slug: "beefull", chargeType: "AC", priceMin: p.min, priceMax: p.max, source: "beefull.com" });
  }
  if (dcMatch) {
    const p = parseTurkishPrice(dcMatch[1]);
    if (p) results.push({ slug: "beefull", chargeType: "DC", priceMin: p.min, priceMax: p.max, source: "beefull.com" });
  }
  return results;
}

async function scrapePowersarj(): Promise<ScrapedPrice[]> {
  const html = await fetchHtml("https://powersarj.com/fiyatlandirma");
  if (!html) return [];
  const results: ScrapedPrice[] = [];
  const $ = cheerio.load(html);
  const text = $.text();

  const acMatch = text.match(/AC[\s\S]*?(\d+[.,]\d+)\s*(?:₺|TL)/i);
  const dcMatch = text.match(/DC[\s\S]*?(\d+[.,]\d+)\s*(?:₺|TL)/i);

  if (acMatch) {
    const p = parseTurkishPrice(acMatch[1]);
    if (p) results.push({ slug: "powersarj", chargeType: "AC", priceMin: p.min, priceMax: p.max, source: "powersarj.com" });
  }
  if (dcMatch) {
    const p = parseTurkishPrice(dcMatch[1]);
    if (p) results.push({ slug: "powersarj", chargeType: "DC", priceMin: p.min, priceMax: p.max, source: "powersarj.com" });
  }
  return results;
}

async function scrapeRHGEnerturk(): Promise<ScrapedPrice[]> {
  const html = await fetchHtml("https://www.enerturk.com/en/charge/membership-tariffs");
  if (!html) return [];
  const results: ScrapedPrice[] = [];
  const $ = cheerio.load(html);
  const text = $.text();

  // Look for AC and DC price patterns
  const priceMatches = text.match(/(\d+[.,]\d+)\s*(?:₺|TL|kWh)/gi);
  if (priceMatches && priceMatches.length >= 1) {
    const allPrices = priceMatches
      .map((m) => parseTurkishPrice(m))
      .filter((p): p is { min: number; max: number | null } => p !== null && p.min > 1 && p.min < 50);

    if (allPrices.length >= 2) {
      // Lowest is AC, next is DC
      allPrices.sort((a, b) => a.min - b.min);
      results.push({ slug: "rhg-enerturk", chargeType: "AC", priceMin: allPrices[0].min, priceMax: null, source: "enerturk.com" });
      results.push({ slug: "rhg-enerturk", chargeType: "DC", priceMin: allPrices[1].min, priceMax: null, source: "enerturk.com" });
    }
  }
  return results;
}

async function scrapeSepasCharge(): Promise<ScrapedPrice[]> {
  const html = await fetchHtml("https://sepascharge.com/sarj-ucretleri");
  if (!html) return [];
  const results: ScrapedPrice[] = [];
  const $ = cheerio.load(html);
  const text = $.text();

  const acMatch = text.match(/AC[\s\S]*?(\d+[.,]\d+)\s*(?:₺|TL)/i);
  const dcMatch = text.match(/DC[\s\S]*?(\d+[.,]\d+)\s*(?:₺|TL)/i);

  if (acMatch) {
    const p = parseTurkishPrice(acMatch[1]);
    if (p) results.push({ slug: "sepascharge", chargeType: "AC", priceMin: p.min, priceMax: p.max, source: "sepascharge.com" });
  }
  if (dcMatch) {
    const p = parseTurkishPrice(dcMatch[1]);
    if (p) results.push({ slug: "sepascharge", chargeType: "DC", priceMin: p.min, priceMax: p.max, source: "sepascharge.com" });
  }
  return results;
}

async function scrapeElaris(): Promise<ScrapedPrice[]> {
  const html = await fetchHtml("https://elaris.com.tr/elaris-tarife/");
  if (!html) return [];
  const results: ScrapedPrice[] = [];
  const $ = cheerio.load(html);
  const text = $.text();

  const priceMatches = text.match(/(\d+[.,]\d+)\s*(?:₺|TL|kWh)/gi);
  if (priceMatches) {
    const allPrices = priceMatches
      .map((m) => parseTurkishPrice(m))
      .filter((p): p is { min: number; max: number | null } => p !== null && p.min > 1 && p.min < 50);

    if (allPrices.length >= 2) {
      allPrices.sort((a, b) => a.min - b.min);
      results.push({ slug: "elaris", chargeType: "AC", priceMin: allPrices[0].min, priceMax: allPrices.length > 2 ? allPrices[1].min : null, source: "elaris.com.tr" });
      results.push({ slug: "elaris", chargeType: "DC", priceMin: allPrices[allPrices.length - 1].min, priceMax: null, source: "elaris.com.tr" });
    }
  }
  return results;
}

async function scrapeVolti(): Promise<ScrapedPrice[]> {
  const html = await fetchHtml("https://volti.com/elektrikli-arac-sarj-fiyatlari/");
  if (!html) return [];
  const results: ScrapedPrice[] = [];
  const $ = cheerio.load(html);
  const text = $.text();

  const acMatch = text.match(/AC[\s\S]*?(\d+[.,]\d+)\s*(?:₺|TL)/i);
  const dcMatch = text.match(/DC[\s\S]*?(\d+[.,]\d+)\s*(?:₺|TL)/i);

  if (acMatch) {
    const p = parseTurkishPrice(acMatch[1]);
    if (p) results.push({ slug: "volti", chargeType: "AC", priceMin: p.min, priceMax: p.max, source: "volti.com" });
  }
  if (dcMatch) {
    const p = parseTurkishPrice(dcMatch[1]);
    if (p) results.push({ slug: "volti", chargeType: "DC", priceMin: p.min, priceMax: p.max, source: "volti.com" });
  }
  return results;
}

async function scrapeTrugo(): Promise<ScrapedPrice[]> {
  // Trugo is a SPA - prices are in a JS bundle
  const html = await fetchHtml("https://www.trugo.com.tr/assets/price.470bd3f6.js");
  if (!html) return [];
  const results: ScrapedPrice[] = [];

  // Parse prices from JS: price:"9,95", price:"13,78", price:"15,36"
  const priceMatches = [...html.matchAll(/price:"(\d+[.,]\d+)"/g)];
  if (priceMatches.length >= 1) {
    // First match = AC
    const ac = parseTurkishPrice(priceMatches[0][1]);
    if (ac) results.push({ slug: "trugo", chargeType: "AC", priceMin: ac.min, priceMax: ac.max, source: "trugo.com.tr" });
  }
  if (priceMatches.length >= 2) {
    // Second = DC
    const dc = parseTurkishPrice(priceMatches[1][1]);
    if (dc) results.push({ slug: "trugo", chargeType: "DC", priceMin: dc.min, priceMax: dc.max, source: "trugo.com.tr" });
  }
  if (priceMatches.length >= 3) {
    // Third = HPC
    const hpc = parseTurkishPrice(priceMatches[2][1]);
    if (hpc) results.push({ slug: "trugo", chargeType: "HPC", priceMin: hpc.min, priceMax: hpc.max, source: "trugo.com.tr" });
  }
  return results;
}

async function scrapeEsarj(): Promise<ScrapedPrice[]> {
  const html = await fetchHtml("https://esarj.com/tarifeler");
  if (!html) return [];
  const results: ScrapedPrice[] = [];
  const $ = cheerio.load(html);
  const text = $.text();

  const acMatch = text.match(/AC[\s\S]*?(\d+[.,]\d+)\s*(?:₺|TL)/i);
  const dcMatch = text.match(/DC[\s\S]*?(\d+[.,]\d+)\s*(?:₺|TL)/i);

  if (acMatch) {
    const p = parseTurkishPrice(acMatch[1]);
    if (p) results.push({ slug: "esarj", chargeType: "AC", priceMin: p.min, priceMax: p.max, source: "esarj.com" });
  }
  if (dcMatch) {
    const p = parseTurkishPrice(dcMatch[1]);
    if (p) results.push({ slug: "esarj", chargeType: "DC", priceMin: p.min, priceMax: p.max, source: "esarj.com" });
  }
  return results;
}

async function scrapeAstor(): Promise<ScrapedPrice[]> {
  const html = await fetchHtml("https://www.astorsarj.com.tr");
  if (!html) return [];
  const results: ScrapedPrice[] = [];
  const $ = cheerio.load(html);
  const text = $.text();

  const acMatch = text.match(/AC[\s\S]*?(\d+[.,]\d+)\s*(?:₺|\/\s*kWh)/i);
  const dcMatch = text.match(/DC[\s\S]*?(\d+[.,]\d+)\s*(?:₺|\/\s*kWh)/i);

  if (acMatch) {
    const p = parseTurkishPrice(acMatch[1]);
    if (p) results.push({ slug: "astor", chargeType: "AC", priceMin: p.min, priceMax: p.max, source: "astorsarj.com.tr" });
  }
  if (dcMatch) {
    const p = parseTurkishPrice(dcMatch[1]);
    if (p) results.push({ slug: "astor", chargeType: "DC", priceMin: p.min, priceMax: p.max, source: "astorsarj.com.tr" });
  }
  return results;
}

async function scrapeOtoJet(): Promise<ScrapedPrice[]> {
  const html = await fetchHtml("https://oto-jet.com.tr/fiyatlarimiz.html");
  if (!html) return [];
  const results: ScrapedPrice[] = [];
  const $ = cheerio.load(html);
  const text = $.text();

  const acMatch = text.match(/AC[\s\S]*?(\d+[.,]\d+)\s*(?:₺|TL)/i);
  const dcMatch = text.match(/DC[\s\S]*?(\d+[.,]\d+)\s*(?:₺|TL)/i) || text.match(/CCS[\s\S]*?(\d+[.,]\d+)\s*(?:₺|TL)/i);

  if (acMatch) {
    const p = parseTurkishPrice(acMatch[1]);
    if (p) results.push({ slug: "oto-jet", chargeType: "AC", priceMin: p.min, priceMax: p.max, source: "oto-jet.com.tr" });
  }
  if (dcMatch) {
    const p = parseTurkishPrice(dcMatch[1]);
    if (p) results.push({ slug: "oto-jet", chargeType: "DC", priceMin: p.min, priceMax: p.max, source: "oto-jet.com.tr" });
  }
  return results;
}

async function scrapeEVBee(): Promise<ScrapedPrice[]> {
  const html = await fetchHtml("https://www.ev-bee.com/sabit-sarj-istasyonlari-fiyat-listesi");
  if (!html) return [];
  const results: ScrapedPrice[] = [];
  const $ = cheerio.load(html);
  const text = $.text();

  const acMatch = text.match(/AC[\s\S]*?(\d+[.,]\d+)\s*(?:₺|TL)/i);
  const dcMatch = text.match(/DC[\s\S]*?150\s*kW[\s\S]*?(\d+[.,]\d+)/i) || text.match(/DC[\s\S]*?(\d+[.,]\d+)/i);
  const hpcMatch = text.match(/150\s*kW.*?(?:uze|üze)[\s\S]*?(\d+[.,]\d+)/i);

  if (acMatch) {
    const p = parseTurkishPrice(acMatch[1]);
    if (p) results.push({ slug: "ev-bee", chargeType: "AC", priceMin: p.min, priceMax: p.max, source: "ev-bee.com" });
  }
  if (dcMatch) {
    const p = parseTurkishPrice(dcMatch[1]);
    if (p) results.push({ slug: "ev-bee", chargeType: "DC", priceMin: p.min, priceMax: p.max, source: "ev-bee.com" });
  }
  if (hpcMatch) {
    const p = parseTurkishPrice(hpcMatch[1]);
    if (p) results.push({ slug: "ev-bee", chargeType: "HPC", priceMin: p.min, priceMax: p.max, source: "ev-bee.com" });
  }
  return results;
}

async function scrapeWAT(): Promise<ScrapedPrice[]> {
  const html = await fetchHtml("https://www.watmobilite.com/cozumler/kamusal-alanlar");
  if (!html) return [];
  const results: ScrapedPrice[] = [];

  // Look for price patterns like "8,99 ₺/kWh" and "12,99 ₺/kWh"
  const priceMatches = [...html.matchAll(/(\d+[.,]\d+)\s*₺\/kWh/g)];
  const vals = priceMatches
    .map((m) => parseTurkishPrice(m[1]))
    .filter((p): p is { min: number; max: number | null } => p !== null && p.min > 5 && p.min < 50);

  // Kamusal fiyatlar: AC pair (low/high), DC pair (low/high)
  if (vals.length >= 4) {
    // Skip first 2 (ev sarji), take kamusal
    results.push({ slug: "wat", chargeType: "AC", priceMin: vals[2].min, priceMax: vals[3].min !== vals[2].min ? vals[3].min : null, source: "watmobilite.com" });
  }
  if (vals.length >= 6) {
    results.push({ slug: "wat", chargeType: "DC", priceMin: vals[4].min, priceMax: vals[5].min !== vals[4].min ? vals[5].min : null, source: "watmobilite.com" });
  } else if (vals.length >= 2) {
    // Fallback: just use first AC-like and first DC-like
    results.push({ slug: "wat", chargeType: "AC", priceMin: vals[0].min, priceMax: vals.length > 1 && vals[1].min !== vals[0].min ? vals[1].min : null, source: "watmobilite.com" });
  }
  return results;
}

// All operator scrapers
const operatorScrapers = [
  { name: "ZES", fn: scrapeZES },
  { name: "Trugo", fn: scrapeTrugo },
  { name: "WAT Mobilite", fn: scrapeWAT },
  { name: "Esarj", fn: scrapeEsarj },
  { name: "Tuncmatik", fn: scrapeTuncmatik },
  { name: "Voltrun", fn: scrapeVoltrun },
  { name: "Beefull", fn: scrapeBeefull },
  { name: "Astor", fn: scrapeAstor },
  { name: "Powersarj", fn: scrapePowersarj },
  { name: "RHG Enerturk", fn: scrapeRHGEnerturk },
  { name: "SepasCharge", fn: scrapeSepasCharge },
  { name: "Elaris", fn: scrapeElaris },
  { name: "EV-Bee", fn: scrapeEVBee },
  { name: "Oto-Jet", fn: scrapeOtoJet },
  { name: "Volti", fn: scrapeVolti },
];

export async function runScraping(): Promise<{
  success: boolean;
  operatorsUpdated: number;
  message: string;
}> {
  const startedAt = new Date();
  const allScraped: ScrapedPrice[] = [];
  const errors: string[] = [];
  const successes: string[] = [];

  // Run all operator scrapers in parallel
  const results = await Promise.allSettled(
    operatorScrapers.map(async (scraper) => {
      try {
        const prices = await scraper.fn();
        return { name: scraper.name, prices };
      } catch (e) {
        throw new Error(`${scraper.name}: ${e instanceof Error ? e.message : "Unknown"}`);
      }
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      if (result.value.prices.length > 0) {
        allScraped.push(...result.value.prices);
        successes.push(result.value.name);
      }
    } else {
      errors.push(result.reason?.message || "Unknown error");
    }
  }

  // Update database
  let updatedCount = 0;
  const allOps = db.select().from(operators).all();
  const slugToId = new Map(allOps.map((o) => [o.slug, o.id]));

  for (const sp of allScraped) {
    const opId = slugToId.get(sp.slug);
    if (!opId) continue;

    const existing = db
      .select()
      .from(prices)
      .where(and(eq(prices.operatorId, opId), eq(prices.chargeType, sp.chargeType)))
      .all();

    if (existing.length > 0) {
      db.update(prices)
        .set({
          priceMin: sp.priceMin,
          priceMax: sp.priceMax,
          updatedAt: new Date(),
        })
        .where(eq(prices.id, existing[0].id))
        .run();
    } else {
      db.insert(prices)
        .values({
          operatorId: opId,
          chargeType: sp.chargeType,
          priceMin: sp.priceMin,
          priceMax: sp.priceMax,
        })
        .run();
    }

    db.insert(priceHistory)
      .values({
        operatorId: opId,
        chargeType: sp.chargeType,
        priceMin: sp.priceMin,
        priceMax: sp.priceMax,
        source: sp.source,
      })
      .run();

    updatedCount++;
  }

  const status = errors.length === 0 ? "success" : allScraped.length > 0 ? "partial" : "failure";
  db.insert(scrapeLogs)
    .values({
      source: "operator-sites",
      status,
      operatorsUpdated: updatedCount,
      errorMessage: errors.length > 0 ? errors.join("; ") : null,
      startedAt,
      completedAt: new Date(),
    })
    .run();

  const parts: string[] = [];
  if (updatedCount > 0) parts.push(`${updatedCount} fiyat guncellendi (${successes.join(", ")})`);
  if (errors.length > 0) parts.push(`Hatalar: ${errors.join(", ")}`);
  if (parts.length === 0) parts.push("Guncellenecek yeni fiyat bulunamadi");

  return {
    success: allScraped.length > 0,
    operatorsUpdated: updatedCount,
    message: parts.join(". "),
  };
}
