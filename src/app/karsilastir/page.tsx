"use client";

import { useEffect, useState } from "react";
import { KarsilastirmaGrafik } from "@/components/karsilastirma-grafik";
import type { OperatorWithPrices } from "@/lib/types";

export default function KarsilastirPage() {
  const [allData, setAllData] = useState<OperatorWithPrices[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fiyatlar")
      .then((r) => r.json())
      .then((data) => {
        setAllData(data);
        // Select first 4 by default
        setSelected(new Set(data.slice(0, 4).map((d: OperatorWithPrices) => d.slug)));
        setLoading(false);
      });
  }, []);

  const toggleOperator = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else if (next.size < 6) {
        next.add(slug);
      }
      return next;
    });
  };

  const selectedData = allData.filter((d) => selected.has(d.slug));

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">Operator Karsilastirma</h1>
      <p className="text-muted-foreground mb-6">
        En fazla 6 operator secin ve fiyatlarini karsilastirin.
      </p>

      {/* Operator Selection */}
      <div className="flex flex-wrap gap-2 mb-8">
        {allData.map((op) => (
          <button
            key={op.slug}
            onClick={() => toggleOperator(op.slug)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              selected.has(op.slug)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
            }`}
          >
            {op.name}
          </button>
        ))}
      </div>

      {selectedData.length > 0 ? (
        <>
          {/* Chart */}
          <div className="rounded-lg border p-4 bg-card mb-8">
            <KarsilastirmaGrafik data={selectedData} />
          </div>

          {/* Comparison Table */}
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">Operator</th>
                  <th className="text-center p-3 font-medium">AC (TL/kWh)</th>
                  <th className="text-center p-3 font-medium">DC (TL/kWh)</th>
                  <th className="text-center p-3 font-medium">HPC (TL/kWh)</th>
                </tr>
              </thead>
              <tbody>
                {selectedData.map((op) => (
                  <tr key={op.slug} className="border-t hover:bg-muted/30">
                    <td className="p-3 font-medium">{op.name}</td>
                    {(["AC", "DC", "HPC"] as const).map((type) => {
                      const price = op.prices[type];
                      return (
                        <td key={type} className="text-center p-3 font-mono">
                          {price
                            ? price.max
                              ? `${price.min.toFixed(2)} - ${price.max.toFixed(2)}`
                              : price.min.toFixed(2)
                            : "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Karsilastirma icin en az bir operator secin.
        </div>
      )}
    </div>
  );
}
