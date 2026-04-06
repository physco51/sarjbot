"use client";

import Link from "next/link";
import type { OperatorWithPrices } from "@/lib/types";
import { AppLinks } from "./app-store-badges";

function getPriceColor(price: number): string {
  if (price < 9) return "text-emerald-400";
  if (price < 12) return "text-amber-400";
  return "text-red-400";
}

function getPriceBg(price: number): string {
  if (price < 9) return "bg-emerald-500/10 border-emerald-500/30";
  if (price < 12) return "bg-amber-500/10 border-amber-500/30";
  return "bg-red-500/10 border-red-500/30";
}

function SourceBadge({ isVerified }: { isVerified: boolean }) {
  if (isVerified) {
    return (
      <span className="inline-flex items-center text-[10px] text-emerald-400">
        &#10003;
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-[10px] text-amber-400" title="Dogrulanmamis">
      &#9888;
    </span>
  );
}

function PriceTag({ label, price, maxPrice }: { label: string; price: number; maxPrice?: number | null }) {
  return (
    <div className={`flex items-center justify-between px-3 py-1.5 rounded-lg border ${getPriceBg(price)}`}>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${getPriceColor(price)}`}>
        {price.toFixed(2)}
        {maxPrice ? `-${maxPrice.toFixed(2)}` : ""}
        <span className="text-[10px] font-normal ml-0.5 text-muted-foreground">TL</span>
      </span>
    </div>
  );
}

export function OperatorCard({
  op,
  index,
  style,
}: {
  op: OperatorWithPrices;
  index: number;
  style?: React.CSSProperties;
}) {
  const hasAC = !!op.prices.AC;
  const hasDC = !!op.prices.DC;
  const hasHPC = !!op.prices.HPC;
  const chargeTypes = [hasAC && "AC", hasDC && "DC", hasHPC && "HPC"].filter((t): t is string => !!t);

  // Find cheapest price for badge
  const cheapest = [op.prices.AC?.min, op.prices.DC?.min, op.prices.HPC?.min]
    .filter((p): p is number => p !== undefined && p !== null)
    .sort((a, b) => a - b)[0];

  return (
    <div
      className="animate-fade-in-up card-hover rounded-xl border border-border/60 bg-card p-4 flex flex-col gap-3"
      style={{ ...style, animationDelay: `${Math.min(index * 50, 500)}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground/60 font-mono">#{index + 1}</span>
            <Link
              href={`/operatorler/${op.slug}`}
              className="font-semibold text-foreground hover:text-primary transition-colors truncate"
            >
              {op.name}
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{op.description}</p>
        </div>
        {cheapest && (
          <div className={`shrink-0 px-2.5 py-1 rounded-lg border text-xs font-bold ${getPriceBg(cheapest)} ${getPriceColor(cheapest)}`}>
            {cheapest.toFixed(2)} TL
          </div>
        )}
      </div>

      {/* Charge type chips */}
      <div className="flex items-center gap-1.5">
        {chargeTypes.map((type) => (
          <span
            key={type}
            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20"
          >
            {type === "AC" ? "&#9889; AC" : type === "DC" ? "&#9889;&#9889; DC" : "&#9889;&#9889;&#9889; HPC"}
          </span>
        ))}
        {op.websiteUrl && (
          <a
            href={op.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-[10px] text-muted-foreground hover:text-primary transition-colors"
          >
            Resmi site &#8599;
          </a>
        )}
      </div>

      {/* Prices */}
      <div className="flex flex-col gap-1.5">
        {op.prices.AC && (
          <div className="flex items-center gap-1">
            <PriceTag label="AC" price={op.prices.AC.min} maxPrice={op.prices.AC.max} />
            <SourceBadge isVerified={op.prices.AC.isVerified} />
          </div>
        )}
        {op.prices.DC && (
          <div className="flex items-center gap-1">
            <PriceTag label="DC" price={op.prices.DC.min} maxPrice={op.prices.DC.max} />
            <SourceBadge isVerified={op.prices.DC.isVerified} />
          </div>
        )}
        {op.prices.HPC && (
          <div className="flex items-center gap-1">
            <PriceTag label="HPC" price={op.prices.HPC.min} maxPrice={op.prices.HPC.max} />
            <SourceBadge isVerified={op.prices.HPC.isVerified} />
          </div>
        )}
      </div>

      {/* App links + Source */}
      <div className="flex items-center justify-between">
        <AppLinks playStoreUrl={op.playStoreUrl} appStoreUrl={op.appStoreUrl} compact />
        {(op.prices.AC?.source || op.prices.DC?.source) && (
          <div className="text-[10px] text-muted-foreground/50 truncate">
            {op.prices.AC?.source || op.prices.DC?.source}
          </div>
        )}
      </div>
    </div>
  );
}
