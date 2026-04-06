"use client";

import { useEffect, useState, useMemo } from "react";
import type { OperatorWithPrices } from "@/lib/types";
import { OperatorFavicon } from "@/components/operator-favicon";

function getPriceColor(price: number): string {
  if (price < 9) return "text-emerald-400";
  if (price < 12) return "text-amber-400";
  return "text-red-400";
}

function formatPrice(p: { min: number; max: number | null } | null): string {
  if (!p) return "-";
  if (p.max && p.max !== p.min) return `${p.min.toFixed(2)}-${p.max.toFixed(2)}`;
  return p.min.toFixed(2);
}

function getBestIdx(values: (number | null)[]): number {
  let bestIdx = -1;
  let bestVal = Infinity;
  values.forEach((v, i) => {
    if (v != null && v < bestVal) {
      bestVal = v;
      bestIdx = i;
    }
  });
  return bestIdx;
}

export default function KarsilastirPage() {
  const [allData, setAllData] = useState<OperatorWithPrices[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [listFilter, setListFilter] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fiyatlar")
      .then((r) => r.json())
      .then((data: OperatorWithPrices[]) => {
        setAllData(data.filter((d) => d.prices.AC || d.prices.DC || d.prices.HPC));
        setLoading(false);
      });
  }, []);

  const toggle = (slug: string) => {
    setSelectedSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 4) return prev;
      return [...prev, slug];
    });
  };

  const filteredList = useMemo(() => {
    let result = allData;
    if (listFilter.trim()) {
      const q = listFilter.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(q));
    }
    if (verifiedOnly) {
      result = result.filter((d) =>
        d.prices.AC?.isVerified || d.prices.DC?.isVerified || d.prices.HPC?.isVerified
      );
    }
    return result;
  }, [allData, listFilter, verifiedOnly]);

  const selectedData = useMemo(
    () => selectedSlugs.map((s) => allData.find((d) => d.slug === s)!).filter(Boolean),
    [selectedSlugs, allData]
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const rows: { label: string; key: "AC" | "DC" | "HPC"; desc: string }[] = [
    { label: "AC", key: "AC", desc: "22 kW" },
    { label: "DC", key: "DC", desc: "180 kW'a kadar" },
    { label: "HPC", key: "HPC", desc: "180 kW+" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">
        Operator <span className="text-primary">Karsilastir</span>
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Listeden en fazla 4 operator secin, fiyatlarini yan yana karsilastirin.
      </p>

      {/* Operator list with checkboxes */}
      <div className="rounded-xl border border-border/60 bg-card mb-6">
        {/* List filter + verified toggle */}
        <div className="px-3 py-2 border-b border-border/40 flex items-center gap-2">
          <input
            type="text"
            placeholder="Filtrele..."
            value={listFilter}
            onChange={(e) => setListFilter(e.target.value)}
            className="flex-1 h-8 px-2 rounded-md bg-background border border-border/40 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
              verifiedOnly
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-background border border-border/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {"\u2713"} Dogrulanmis
          </button>
        </div>

        {/* Scrollable list - 10 rows visible */}
        <div className="max-h-[320px] overflow-y-auto">
          {filteredList.map((op) => {
            const isSelected = selectedSlugs.includes(op.slug);
            const isDisabled = !isSelected && selectedSlugs.length >= 4;
            const cheapest = [op.prices.AC?.min, op.prices.DC?.min, op.prices.HPC?.min]
              .filter((p): p is number => p != null)
              .sort((a, b) => a - b)[0];

            return (
              <button
                key={op.slug}
                onClick={() => toggle(op.slug)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm border-b border-border/20 last:border-0 transition-colors ${
                  isSelected ? "bg-primary/5" : "hover:bg-white/[0.02]"
                } ${isDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {/* Checkbox */}
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? "bg-primary border-primary" : "border-border/60"
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Name + verified */}
                <span className={`flex-1 truncate inline-flex items-center gap-1.5 ${isSelected ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  <OperatorFavicon websiteUrl={op.websiteUrl} name={op.name} size={14} />
                  {op.name}
                  {(op.prices.AC?.isVerified || op.prices.DC?.isVerified || op.prices.HPC?.isVerified) ? (
                    <span className="ml-1 text-emerald-400 text-[10px]">{"\u2713"}</span>
                  ) : (
                    <span className="ml-1 text-amber-400 text-[10px]">{"\u26A0"}</span>
                  )}
                </span>

                {/* Quick prices */}
                <div className="flex items-center gap-3 shrink-0 text-xs tabular-nums">
                  {op.prices.AC && (
                    <span className="text-muted-foreground/60">AC <span className={getPriceColor(op.prices.AC.min)}>{op.prices.AC.min.toFixed(2)}</span></span>
                  )}
                  {op.prices.DC && (
                    <span className="text-muted-foreground/60">DC <span className={getPriceColor(op.prices.DC.min)}>{op.prices.DC.min.toFixed(2)}</span></span>
                  )}
                </div>

                {/* Cheapest badge */}
                {cheapest && (
                  <span className={`text-[10px] font-bold tabular-nums shrink-0 ${getPriceColor(cheapest)}`}>
                    {cheapest.toFixed(2)} TL
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{selectedSlugs.length}/4 secili</span>
          {selectedSlugs.length > 0 && (
            <button onClick={() => setSelectedSlugs([])} className="text-red-400 hover:text-red-300">
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* Comparison results */}
      {selectedData.length < 2 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-border/40">
          <p className="text-muted-foreground text-sm">
            {selectedData.length === 0
              ? "Karsilastirmak icin listeden operator secin"
              : "En az 2 operator secin"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Side-by-side cards */}
          <div className={`grid gap-3 ${selectedData.length === 2 ? "grid-cols-2" : selectedData.length === 3 ? "grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}>
            {selectedData.map((op) => {
              const cheapest = [op.prices.AC?.min, op.prices.DC?.min, op.prices.HPC?.min]
                .filter((p): p is number => p != null)
                .sort((a, b) => a - b)[0];
              return (
                <div key={op.slug} className="rounded-xl border border-border/60 bg-card p-4 text-center">
                  <div className="font-semibold text-sm mb-1">{op.name}</div>
                  {cheapest && (
                    <div className={`text-2xl font-extrabold tabular-nums ${getPriceColor(cheapest)}`}>
                      {cheapest.toFixed(2)}
                      <span className="text-xs font-normal text-muted-foreground ml-1">TL</span>
                    </div>
                  )}
                  <div className="text-[10px] text-muted-foreground/50 mt-1">en dusuk fiyat</div>
                </div>
              );
            })}
          </div>

          {/* Comparison table */}
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-card/80 border-b border-border/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground w-28"></th>
                  {selectedData.map((op) => (
                    <th key={op.slug} className="text-center px-3 py-3 text-xs font-semibold text-foreground">
                      {op.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const vals = selectedData.map((op) => op.prices[row.key]?.min ?? null);
                  const bestIdx = getBestIdx(vals);
                  return (
                    <tr key={row.key} className="border-b border-border/20">
                      <td className="px-4 py-3">
                        <div className="text-xs font-semibold">{row.label}</div>
                        <div className="text-[10px] text-muted-foreground/50">{row.desc}</div>
                      </td>
                      {selectedData.map((op, i) => {
                        const price = op.prices[row.key];
                        const isBest = i === bestIdx && bestIdx !== -1;
                        return (
                          <td key={op.slug} className="text-center px-3 py-3">
                            {price ? (
                              <div>
                                <span className={`tabular-nums font-bold ${isBest ? "text-emerald-400" : getPriceColor(price.min)}`}>
                                  {formatPrice(price)}
                                  {isBest && <span className="ml-1 text-[10px]">{"\u2713"}</span>}
                                </span>
                                <div className="text-[9px] mt-0.5">
                                  {price.isVerified ? (
                                    <span className="text-emerald-400/60">{"\u2713"} resmi</span>
                                  ) : (
                                    <span className="text-amber-400/60">{"\u26A0"} 3.parti</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/30">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* 30 min cost row */}
                <tr className="border-b border-border/20 bg-white/[0.01]">
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold">30 dk Maliyet</div>
                    <div className="text-[10px] text-muted-foreground/50">DC ~50 kWh</div>
                  </td>
                  {(() => {
                    const costs = selectedData.map((op) => {
                      const dc = op.prices.DC?.min ?? op.prices.AC?.min;
                      return dc ? Math.round(dc * 50 * 100) / 100 : null;
                    });
                    const bestIdx30 = getBestIdx(costs);
                    return selectedData.map((op, i) => (
                      <td key={op.slug} className="text-center px-3 py-3">
                        {costs[i] ? (
                          <span className={`tabular-nums font-bold ${i === bestIdx30 ? "text-emerald-400" : "text-foreground"}`}>
                            {costs[i]!.toFixed(0)} TL
                            {i === bestIdx30 && <span className="ml-1 text-[10px] text-emerald-400">{"\u2713"}</span>}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30">-</span>
                        )}
                      </td>
                    ));
                  })()}
                </tr>

                {/* Source row */}
                <tr>
                  <td className="px-4 py-3 text-[10px] text-muted-foreground/50">Kaynak</td>
                  {selectedData.map((op) => (
                    <td key={op.slug} className="text-center px-3 py-3 text-[10px] text-muted-foreground/50">
                      {op.prices.DC?.isVerified || op.prices.AC?.isVerified ? (
                        <span className="text-emerald-400/70">{"\u2713"} Resmi</span>
                      ) : (
                        <span className="text-amber-400/70">{"\u26A0"} 3. parti</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Visual bars */}
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h3 className="text-xs font-semibold text-muted-foreground mb-4">Gorsel Karsilastirma</h3>
            {rows.map((row) => {
              const vals = selectedData.map((op) => op.prices[row.key]?.min ?? 0).filter((v) => v > 0);
              if (vals.length === 0) return null;
              const maxVal = Math.max(...vals) * 1.1;
              return (
                <div key={row.key} className="mb-4 last:mb-0">
                  <div className="text-[10px] text-muted-foreground/60 mb-1.5">{row.label} ({row.desc})</div>
                  <div className="space-y-1.5">
                    {selectedData.map((op) => {
                      const price = op.prices[row.key]?.min;
                      if (!price) return null;
                      const pct = (price / maxVal) * 100;
                      return (
                        <div key={op.slug} className="flex items-center gap-3">
                          <div className="w-24 text-[11px] text-muted-foreground truncate text-right">{op.name}</div>
                          <div className="flex-1 h-6 bg-background/50 rounded-md overflow-hidden relative">
                            <div
                              className={`h-full rounded-md ${price < 9 ? "bg-emerald-500/30" : price < 12 ? "bg-amber-500/30" : "bg-red-500/30"}`}
                              style={{ width: `${pct}%` }}
                            />
                            <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold tabular-nums ${getPriceColor(price)}`}>
                              {price.toFixed(2)} TL
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
