import { db } from "./index";
import { operators, prices } from "./schema";
import { eq } from "drizzle-orm";
import type { OperatorWithPrices, PriceInfo } from "../types";

function toPriceInfo(p: typeof prices.$inferSelect): PriceInfo {
  return {
    min: p.priceMin,
    max: p.priceMax,
    source: p.source,
    sourceUrl: p.sourceUrl,
    isVerified: p.isVerified ?? true,
  };
}

export async function getAllOperatorsWithPrices(): Promise<OperatorWithPrices[]> {
  const allOperators = db.select().from(operators).where(eq(operators.isActive, true)).all();
  const allPrices = db.select().from(prices).all();

  return allOperators.map((op) => {
    const opPrices = allPrices.filter((p) => p.operatorId === op.id);
    const ac = opPrices.find((p) => p.chargeType === "AC");
    const dc = opPrices.find((p) => p.chargeType === "DC");
    const hpc = opPrices.find((p) => p.chargeType === "HPC");

    const latestUpdate = opPrices.reduce<Date | null>((latest, p) => {
      if (!p.updatedAt) return latest;
      if (!latest) return p.updatedAt;
      return p.updatedAt > latest ? p.updatedAt : latest;
    }, null);

    return {
      id: op.id,
      name: op.name,
      slug: op.slug,
      logoUrl: op.logoUrl,
      websiteUrl: op.websiteUrl,
      playStoreUrl: op.playStoreUrl,
      appStoreUrl: op.appStoreUrl,
      description: op.description,
      isActive: op.isActive,
      prices: {
        AC: ac ? toPriceInfo(ac) : null,
        DC: dc ? toPriceInfo(dc) : null,
        HPC: hpc ? toPriceInfo(hpc) : null,
      },
      lastUpdated: latestUpdate,
    };
  });
}

export async function getOperatorBySlug(slug: string): Promise<OperatorWithPrices | null> {
  const all = await getAllOperatorsWithPrices();
  return all.find((o) => o.slug === slug) ?? null;
}
