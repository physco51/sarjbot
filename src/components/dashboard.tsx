"use client";

import { useState, useMemo } from "react";
import type { OperatorWithPrices } from "@/lib/types";
import { OperatorCard } from "./operator-card";
import { AppLinks } from "./app-store-badges";
import { OperatorFavicon } from "./operator-favicon";

type SortKey = "price_asc" | "price_desc" | "name_asc" | "name_desc" | "ac_asc" | "ac_desc" | "dc_asc" | "dc_desc" | "hpc_asc" | "hpc_desc";
type ViewMode = "grid" | "list";
type ChargeFilter = "all" | "AC" | "DC" | "HPC";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "price_asc", label: "En Ucuz" },
  { value: "price_desc", label: "En Pahali" },
  { value: "ac_asc", label: "AC Ucuz" },
  { value: "dc_asc", label: "DC Ucuz" },
  { value: "hpc_asc", label: "HPC Ucuz" },
  { value: "name_asc", label: "A-Z" },
];

function getCheapestPrice(op: OperatorWithPrices): number {
  const prices = [op.prices.AC?.min, op.prices.DC?.min, op.prices.HPC?.min].filter(
    (p): p is number => p != null
  );
  return prices.length ? Math.min(...prices) : Infinity;
}

function getSortFn(key: SortKey) {
  switch (key) {
    case "price_asc":
      return (a: OperatorWithPrices, b: OperatorWithPrices) => getCheapestPrice(a) - getCheapestPrice(b);
    case "price_desc":
      return (a: OperatorWithPrices, b: OperatorWithPrices) => getCheapestPrice(b) - getCheapestPrice(a);
    case "ac_asc":
      return (a: OperatorWithPrices, b: OperatorWithPrices) =>
        (a.prices.AC?.min ?? Infinity) - (b.prices.AC?.min ?? Infinity);
    case "dc_asc":
      return (a: OperatorWithPrices, b: OperatorWithPrices) =>
        (a.prices.DC?.min ?? Infinity) - (b.prices.DC?.min ?? Infinity);
    case "hpc_asc":
      return (a: OperatorWithPrices, b: OperatorWithPrices) =>
        (a.prices.HPC?.min ?? Infinity) - (b.prices.HPC?.min ?? Infinity);
    case "name_asc":
      return (a: OperatorWithPrices, b: OperatorWithPrices) => a.name.localeCompare(b.name, "tr");
    case "name_desc":
      return (a: OperatorWithPrices, b: OperatorWithPrices) => b.name.localeCompare(a.name, "tr");
    case "ac_desc":
      return (a: OperatorWithPrices, b: OperatorWithPrices) =>
        (b.prices.AC?.min ?? 0) - (a.prices.AC?.min ?? 0);
    case "dc_desc":
      return (a: OperatorWithPrices, b: OperatorWithPrices) =>
        (b.prices.DC?.min ?? 0) - (a.prices.DC?.min ?? 0);
    case "hpc_desc":
      return (a: OperatorWithPrices, b: OperatorWithPrices) =>
        (b.prices.HPC?.min ?? 0) - (a.prices.HPC?.min ?? 0);
  }
}

export function Dashboard({
  withPrices,
}: {
  withPrices: OperatorWithPrices[];
}) {
  const [sortBy, setSortBy] = useState<SortKey>("price_asc");
  const [chargeFilter, setChargeFilter] = useState<ChargeFilter>("all");

  // Auto-switch sort when charge filter changes
  const handleChargeFilter = (f: ChargeFilter) => {
    setChargeFilter(f);
    if (f === "AC") setSortBy("ac_asc");
    else if (f === "DC") setSortBy("dc_asc");
    else if (f === "HPC") setSortBy("hpc_asc");
    else setSortBy("price_asc");
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [gridVisibleCount, setGridVisibleCount] = useState(6);

  // Reset grid count when filters change
  const filterKey = `${searchQuery}-${chargeFilter}-${verifiedOnly}-${sortBy}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setGridVisibleCount(6);
  }

  const filtered = useMemo(() => {
    let result = [...withPrices];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (op) =>
          op.name.toLowerCase().includes(q) ||
          op.slug.includes(q) ||
          op.description?.toLowerCase().includes(q)
      );
    }

    // Charge type filter
    if (chargeFilter !== "all") {
      result = result.filter((op) => op.prices[chargeFilter] != null);
    }

    // Verified only
    if (verifiedOnly) {
      result = result.filter((op) => {
        const ac = op.prices.AC?.isVerified ?? false;
        const dc = op.prices.DC?.isVerified ?? false;
        const hpc = op.prices.HPC?.isVerified ?? false;
        return ac || dc || hpc;
      });
    }

    // Sort
    result.sort(getSortFn(sortBy));

    return result;
  }, [withPrices, sortBy, chargeFilter, searchQuery, verifiedOnly]);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="sticky top-16 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-[#0B1120]/90 backdrop-blur-md border-b border-border/30">
        {/* Desktop: single row | Mobile: two rows */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Operator ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 px-3 pl-9 rounded-lg bg-card border border-border/60 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5">
            {(["all", "AC", "DC", "HPC"] as ChargeFilter[]).map((f) => (
              <button key={f} onClick={() => handleChargeFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${chargeFilter === f ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/30"}`}
              >{f === "all" ? "Tumu" : f}</button>
            ))}
          </div>
          <button onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${verifiedOnly ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-card border border-border/60 text-muted-foreground hover:text-foreground"}`}
          >Sadece Dogrulanmis Fiyatlar</button>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="h-9 px-3 rounded-lg bg-card border border-border/60 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
          >{SORT_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select>
          <div className="flex items-center gap-0.5 bg-card rounded-lg border border-border/60 p-0.5">
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zm8 0A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zm-8 8A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zm8 0A1.5 1.5 0 0110.5 9h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 13.5v-3z" /></svg>
            </button>
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M2.5 12a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5z" /></svg>
            </button>
          </div>
        </div>

        {/* Mobile: two compact rows */}
        <div className="sm:hidden space-y-2">
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1 min-w-0">
              <input type="text" placeholder="Ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 px-3 pl-8 rounded-lg bg-card border border-border/60 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {(["all", "AC", "DC", "HPC"] as ChargeFilter[]).map((f) => (
              <button key={f} onClick={() => handleChargeFilter(f)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${chargeFilter === f ? "bg-primary text-primary-foreground" : "bg-card border border-border/60 text-muted-foreground"}`}
              >{f === "all" ? "Tumu" : f}</button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all shrink-0 ${verifiedOnly ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-card border border-border/60 text-muted-foreground"}`}
            >Dogrulanmis</button>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="h-7 px-1.5 rounded-lg bg-card border border-border/60 text-[10px] font-medium text-foreground focus:outline-none cursor-pointer flex-1 min-w-0"
            >{SORT_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select>
            <div className="flex items-center gap-0.5 bg-card rounded-lg border border-border/60 p-0.5 shrink-0">
              <button onClick={() => setViewMode("grid")} className={`p-1 rounded-md ${viewMode === "grid" ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zm8 0A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zm-8 8A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zm8 0A1.5 1.5 0 0110.5 9h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 13.5v-3z" /></svg>
              </button>
              <button onClick={() => setViewMode("list")} className={`p-1 rounded-md ${viewMode === "list" ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M2.5 12a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5z" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Active filters & result count */}
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{filtered.length}</span> operator bulundu
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary">
              &ldquo;{searchQuery}&rdquo;
              <button onClick={() => setSearchQuery("")} className="hover:text-foreground">&#10005;</button>
            </span>
          )}
          {chargeFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary">
              {chargeFilter}
              <button onClick={() => handleChargeFilter("all")} className="hover:text-foreground">&#10005;</button>
            </span>
          )}
          {verifiedOnly && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">
              Dogrulanmis
              <button onClick={() => setVerifiedOnly(false)} className="hover:text-foreground">&#10005;</button>
            </span>
          )}
        </div>
      </div>

      {/* Price color legend */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span> &lt;9 TL Uygun</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400"></span> 9-12 TL Orta</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-400"></span> &gt;12 TL Pahali</span>
        <span className="flex items-center gap-1"><span className="text-emerald-400">{"\u2713"}</span> Dogrulanmis</span>
        <span className="flex items-center gap-1"><span className="text-amber-400">{"\u26A0"}</span> 3. Parti</span>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">&#128269;</div>
          <p className="text-muted-foreground font-medium">Sonuc bulunamadi</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Filtrelerinizi genisletin</p>
        </div>
      ) : viewMode === "grid" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.slice(0, gridVisibleCount).map((op, i) => (
              <OperatorCard key={op.id} op={op} index={i} />
            ))}
          </div>
          {gridVisibleCount < filtered.length && (
            <div className="text-center pt-2">
              <button
                onClick={() => setGridVisibleCount((c) => c + 6)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-white/[0.03] transition-all"
              >
                Daha fazla goster
                <span className="text-xs text-muted-foreground/50">
                  ({gridVisibleCount}/{filtered.length})
                </span>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-border/60 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-card/80">
              <tr className="border-b border-border/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">#</th>
                <SortableTh label="Operator" sortKey="name_asc" currentSort={sortBy} onSort={setSortBy} align="left" />
                <SortableTh label="AC (TL/kWh)" sortKey="ac_asc" currentSort={sortBy} onSort={setSortBy} align="right" />
                <SortableTh label="DC (TL/kWh)" sortKey="dc_asc" currentSort={sortBy} onSort={setSortBy} align="right" />
                <SortableTh label="HPC (TL/kWh)" sortKey="hpc_asc" currentSort={sortBy} onSort={setSortBy} align="right" />
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Uygulama</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Fiyat Kaynagi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((op, i) => (
                <tr key={op.id} className="border-b border-border/20 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-muted-foreground/60 font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <a href={`/operatorler/${op.slug}`} className="font-medium hover:text-primary transition-colors inline-flex items-center gap-2">
                      <OperatorFavicon websiteUrl={op.websiteUrl} name={op.name} size={14} />
                      {op.name}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {op.prices.AC ? (
                      <span className={getPriceColorFn(op.prices.AC.min)}>
                        {op.prices.AC.min.toFixed(2)}
                        {op.prices.AC.max ? `-${op.prices.AC.max.toFixed(2)}` : ""}
                        {!op.prices.AC.isVerified && <span className="text-amber-400 ml-1">&#9888;</span>}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/30">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {op.prices.DC ? (
                      <span className={getPriceColorFn(op.prices.DC.min)}>
                        {op.prices.DC.min.toFixed(2)}
                        {op.prices.DC.max ? `-${op.prices.DC.max.toFixed(2)}` : ""}
                        {!op.prices.DC.isVerified && <span className="text-amber-400 ml-1">&#9888;</span>}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/30">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {op.prices.HPC ? (
                      <span className={getPriceColorFn(op.prices.HPC.min)}>
                        {op.prices.HPC.min.toFixed(2)}
                        {op.prices.HPC.max ? `-${op.prices.HPC.max.toFixed(2)}` : ""}
                        {!op.prices.HPC.isVerified && <span className="text-amber-400 ml-1">&#9888;</span>}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/30">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <AppLinks playStoreUrl={op.playStoreUrl} appStoreUrl={op.appStoreUrl} compact />
                  </td>
                  <td className="px-4 py-3 text-right text-[10px] text-muted-foreground/50 max-w-[120px] truncate">
                    {(() => {
                      const src = op.prices.AC?.source || op.prices.DC?.source;
                      const url = op.prices.AC?.sourceUrl || op.prices.DC?.sourceUrl;
                      if (!src) return "-";
                      return url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                          {src} {"\u2197"}
                        </a>
                      ) : src;
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

function getPriceColorFn(price: number): string {
  if (price < 9) return "text-emerald-400";
  if (price < 12) return "text-amber-400";
  return "text-red-400";
}

const SORT_PAIRS: Record<string, { asc: SortKey; desc: SortKey }> = {
  name_asc: { asc: "name_asc", desc: "name_desc" },
  name_desc: { asc: "name_asc", desc: "name_desc" },
  ac_asc: { asc: "ac_asc", desc: "ac_desc" },
  ac_desc: { asc: "ac_asc", desc: "ac_desc" },
  dc_asc: { asc: "dc_asc", desc: "dc_desc" },
  dc_desc: { asc: "dc_asc", desc: "dc_desc" },
  hpc_asc: { asc: "hpc_asc", desc: "hpc_desc" },
  hpc_desc: { asc: "hpc_asc", desc: "hpc_desc" },
};

function SortableTh({
  label,
  sortKey,
  currentSort,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const pair = SORT_PAIRS[sortKey];
  const isActive = currentSort === pair?.asc || currentSort === pair?.desc;
  const isDesc = currentSort === pair?.desc;

  const handleClick = () => {
    if (!isActive) {
      onSort(sortKey);
    } else if (!isDesc) {
      onSort(pair.desc);
    } else {
      onSort(pair.asc);
    }
  };

  return (
    <th
      className={`px-4 py-3 text-xs font-semibold cursor-pointer select-none group transition-colors hover:text-primary ${
        align === "right" ? "text-right" : "text-left"
      } ${isActive ? "text-primary" : "text-muted-foreground"}`}
      onClick={handleClick}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={`transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}>
          {isDesc ? "\u2193" : "\u2191"}
        </span>
      </span>
    </th>
  );
}
