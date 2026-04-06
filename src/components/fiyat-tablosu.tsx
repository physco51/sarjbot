"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { OperatorWithPrices, PriceInfo } from "@/lib/types";

type SortField = "name" | "AC" | "DC" | "HPC";
type SortDir = "asc" | "desc";

function formatPrice(price: PriceInfo | null): string {
  if (!price) return "-";
  if (price.max && price.max !== price.min) {
    return `${price.min.toFixed(2)} - ${price.max.toFixed(2)}`;
  }
  return price.min.toFixed(2);
}

function getPriceValue(price: PriceInfo | null): number {
  if (!price) return Infinity;
  return price.min;
}

function getPriceColor(value: number, min: number, max: number): string {
  if (value === Infinity) return "";
  const ratio = (value - min) / (max - min || 1);
  if (ratio <= 0.33) return "bg-green-500/15 text-green-700 dark:text-green-400";
  if (ratio <= 0.66) return "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400";
  return "bg-red-500/15 text-red-700 dark:text-red-400";
}

function SourceLink({ price }: { price: PriceInfo | null }) {
  if (!price) return null;
  return (
    <div className="flex items-center gap-1 mt-0.5">
      {!price.isVerified && (
        <span className="text-[9px] text-amber-600 dark:text-amber-400" title="Resmi siteden dogrulanamadi">
          ⚠
        </span>
      )}
      {price.sourceUrl ? (
        <a
          href={price.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-muted-foreground hover:text-blue-500 hover:underline truncate max-w-[100px]"
          title={price.sourceUrl}
        >
          {price.source || "Kaynak"}
        </a>
      ) : (
        <span className="text-[10px] text-muted-foreground">{price.source}</span>
      )}
    </div>
  );
}

export function FiyatTablosu({ data }: { data: OperatorWithPrices[] }) {
  const [sortField, setSortField] = useState<SortField>("AC");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filter, setFilter] = useState<"all" | "AC" | "DC" | "HPC">("all");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sorted = [...data].sort((a, b) => {
    if (sortField === "name") {
      return sortDir === "asc"
        ? a.name.localeCompare(b.name, "tr")
        : b.name.localeCompare(a.name, "tr");
    }
    const aVal = getPriceValue(a.prices[sortField]);
    const bVal = getPriceValue(b.prices[sortField]);
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  const filtered =
    filter === "all"
      ? sorted
      : sorted.filter((op) => op.prices[filter] !== null);

  const acPrices = data.map((d) => getPriceValue(d.prices.AC)).filter((v) => v !== Infinity);
  const dcPrices = data.map((d) => getPriceValue(d.prices.DC)).filter((v) => v !== Infinity);
  const hpcPrices = data.map((d) => getPriceValue(d.prices.HPC)).filter((v) => v !== Infinity);

  const ranges = {
    AC: { min: Math.min(...acPrices), max: Math.max(...acPrices) },
    DC: { min: Math.min(...dcPrices), max: Math.max(...dcPrices) },
    HPC: { min: Math.min(...hpcPrices), max: Math.max(...hpcPrices) },
  };

  const cheapest = {
    AC: acPrices.length ? Math.min(...acPrices) : null,
    DC: dcPrices.length ? Math.min(...dcPrices) : null,
    HPC: hpcPrices.length ? Math.min(...hpcPrices) : null,
  };

  const SortArrow = ({ field }: { field: SortField }) => (
    <span className="ml-1 text-xs">
      {sortField === field ? (sortDir === "asc" ? "▲" : "▼") : "◇"}
    </span>
  );

  return (
    <div>
      {/* Filter buttons */}
      <div className="flex gap-2 mb-4">
        {(["all", "AC", "DC", "HPC"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {f === "all" ? "Tumu" : f}
          </button>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleSort("name")}
              >
                Operator <SortArrow field="name" />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted text-center"
                onClick={() => handleSort("AC")}
              >
                AC (22 kW) <SortArrow field="AC" />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted text-center"
                onClick={() => handleSort("DC")}
              >
                DC (&lt;180 kW) <SortArrow field="DC" />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted text-center"
                onClick={() => handleSort("HPC")}
              >
                HPC (180+ kW) <SortArrow field="HPC" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((op, index) => (
              <TableRow key={op.id} className="hover:bg-muted/30">
                <TableCell className="text-center text-muted-foreground text-sm">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium">
                  <a
                    href={`/operatorler/${op.slug}`}
                    className="hover:underline"
                  >
                    {op.name}
                  </a>
                </TableCell>
                {(["AC", "DC", "HPC"] as const).map((type) => {
                  const price = op.prices[type];
                  const val = getPriceValue(price);
                  const isCheapest = cheapest[type] !== null && val === cheapest[type];
                  return (
                    <TableCell
                      key={type}
                      className={`text-center ${
                        price ? getPriceColor(val, ranges[type].min, ranges[type].max) : ""
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1">
                          <span className={`font-mono ${price && !price.isVerified ? "opacity-70" : ""}`}>
                            {formatPrice(price)}
                          </span>
                          {price && <span className="text-xs text-muted-foreground">TL</span>}
                          {isCheapest && (
                            <Badge variant="secondary" className="ml-1 text-[10px] bg-green-500/20 text-green-700 dark:text-green-400">
                              En Ucuz
                            </Badge>
                          )}
                        </div>
                        <SourceLink price={price} />
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((op, index) => (
          <a
            key={op.id}
            href={`/operatorler/${op.slug}`}
            className="block rounded-lg border p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-muted-foreground">{index + 1}.</span>
              <span className="font-semibold">{op.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              {(["AC", "DC", "HPC"] as const).map((type) => {
                const price = op.prices[type];
                const val = getPriceValue(price);
                const isCheapest = cheapest[type] !== null && val === cheapest[type];
                return (
                  <div
                    key={type}
                    className={`rounded-md p-2 ${
                      price ? getPriceColor(val, ranges[type].min, ranges[type].max) : "bg-muted/50"
                    }`}
                  >
                    <div className="text-xs text-muted-foreground mb-1">{type}</div>
                    <div className={`font-mono font-medium ${price && !price.isVerified ? "opacity-70" : ""}`}>
                      {formatPrice(price)}
                    </div>
                    {isCheapest && (
                      <span className="text-[10px] text-green-600">En Ucuz</span>
                    )}
                    {price && !price.isVerified && (
                      <div className="text-[9px] text-amber-600">⚠ Dogrulanmadi</div>
                    )}
                    {price?.source && (
                      <div className="text-[9px] text-muted-foreground truncate">{price.source}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
