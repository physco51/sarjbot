"use client";

import { useEffect, useState, useMemo } from "react";
import type { OperatorWithPrices } from "@/lib/types";

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

function getBestIdx(values: (number | null)[], mode: "min" | "max"): number {
  let bestIdx = -1;
  let bestVal = mode === "min" ? Infinity : -Infinity;
  values.forEach((v, i) => {
    if (v == null) return;
    if (mode === "min" ? v < bestVal : v > bestVal) {
      bestVal = v;
      bestIdx = i;
    }
  });
  return bestIdx;
}

export default function KarsilastirPage() {
  const [allData, setAllData] = useState<OperatorWithPrices[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fiyatlar")
      .then((r) => r.json())
      .then((data: OperatorWithPrices[]) => {
        const withPrices = data.filter(
          (d) => d.prices.AC || d.prices.DC || d.prices.HPC
        );
        setAllData(withPrices);
        setLoading(false);
      });
  }, []);

  const addOperator = (slug: string) => {
    if (selectedSlugs.length >= 4 || selectedSlugs.includes(slug)) return;
    setSelectedSlugs((prev) => [...prev, slug]);
    setSearch("");
  };

  const removeOperator = (slug: string) => {
    setSelectedSlugs((prev) => prev.filter((s) => s !== slug));
  };

  const selectedData = useMemo(
    () => selectedSlugs.map((s) => allData.find((d) => d.slug === s)!).filter(Boolean),
    [selectedSlugs, allData]
  );

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return allData
      .filter(
        (d) =>
          !selectedSlugs.includes(d.slug) &&
          (d.name.toLowerCase().includes(q) || d.slug.includes(q))
      )
      .slice(0, 8);
  }, [search, allData, selectedSlugs]);

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

  // Comparison rows
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
        En fazla 4 operator secin, fiyatlarini yan yana karsilastirin.
      </p>

      {/* Search & Add */}
      <div className="relative mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Operator ara ve ekle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 px-4 pl-10 rounded-xl bg-card border border-border/60 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {selectedSlugs.length >= 4 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-amber-400">Maks 4</span>
          )}
        </div>

        {/* Dropdown results */}
        {searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 rounded-xl bg-card border border-border/60 shadow-xl overflow-hidden">
            {searchResults.map((op) => (
              <button
                key={op.slug}
                onClick={() => addOperator(op.slug)}
                disabled={selectedSlugs.length >= 4}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/[0.04] transition-colors flex items-center justify-between disabled:opacity-40"
              >
                <span className="font-medium">{op.name}</span>
                <span className="text-xs text-muted-foreground">
                  {op.prices.DC ? `DC ${op.prices.DC.min.toFixed(2)} TL` : op.prices.AC ? `AC ${op.prices.AC.min.toFixed(2)} TL` : ""}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected chips */}
      {selectedSlugs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedData.map((op) => (
            <span
              key={op.slug}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-sm font-medium text-primary"
            >
              {op.name}
              <button
                onClick={() => removeOperator(op.slug)}
                className="hover:text-foreground transition-colors text-primary/60"
              >
                {"\u2715"}
              </button>
            </span>
          ))}
          {selectedSlugs.length < 4 && (
            <span className="text-xs text-muted-foreground/50 self-center">
              {4 - selectedSlugs.length} daha ekleyebilirsiniz
            </span>
          )}
        </div>
      )}

      {/* Comparison */}
      {selectedData.length === 0 ? (
        <div className="text-center py-20 rounded-xl border border-dashed border-border/40">
          <div className="text-4xl mb-3">{"\u2194\uFE0F"}</div>
          <p className="text-muted-foreground font-medium">Karsilastirmak icin operator arayip ekleyin</p>
          <p className="text-xs text-muted-foreground/50 mt-1">Yukaridaki arama kutusunu kullanin</p>
        </div>
      ) : selectedData.length === 1 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-border/40">
          <p className="text-muted-foreground">En az 2 operator secin</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Side-by-side cards */}
          <div className={`grid gap-3 ${selectedData.length === 2 ? "grid-cols-2" : selectedData.length === 3 ? "grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}>
            {selectedData.map((op) => {
              const cheapest = [op.prices.AC?.min, op.prices.DC?.min, op.prices.HPC?.min]
                .filter((p): p is number => p != null)
                .sort((a, b) => a - b)[0];
              return (
                <div key={op.slug} className="rounded-xl border border-border/60 bg-card p-4 text-center">
                  <button
                    onClick={() => removeOperator(op.slug)}
                    className="float-right text-muted-foreground/40 hover:text-red-400 transition-colors text-xs"
                  >
                    {"\u2715"}
                  </button>
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
                  const bestIdx = getBestIdx(vals, "min");

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
                              <div className={`tabular-nums font-bold ${isBest ? "text-emerald-400" : getPriceColor(price.min)}`}>
                                {formatPrice(price)}
                                {isBest && <span className="ml-1 text-[10px]">{"\u2713"}</span>}
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
                    <div className="text-[10px] text-muted-foreground/50">DC ile tahmini</div>
                  </td>
                  {(() => {
                    const costs = selectedData.map((op) => {
                      const dc = op.prices.DC?.min ?? op.prices.AC?.min;
                      return dc ? Math.round(dc * 50 * 100) / 100 : null; // ~50 kWh in 30min DC
                    });
                    const bestIdx30 = getBestIdx(costs, "min");
                    return selectedData.map((op, i) => {
                      const cost = costs[i];
                      const isBest = i === bestIdx30 && bestIdx30 !== -1;
                      return (
                        <td key={op.slug} className="text-center px-3 py-3">
                          {cost ? (
                            <div className={`tabular-nums font-bold ${isBest ? "text-emerald-400" : "text-foreground"}`}>
                              {cost.toFixed(0)} TL
                              {isBest && <span className="ml-1 text-[10px] text-emerald-400">{"\u2713"}</span>}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/30">-</span>
                          )}
                        </td>
                      );
                    });
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

          {/* Visual bar comparison */}
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h3 className="text-xs font-semibold text-muted-foreground mb-4">Fiyat Karsilastirma</h3>
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
