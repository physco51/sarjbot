"use client";

import type { OperatorWithPrices } from "@/lib/types";

interface ExportButtonProps {
  data: OperatorWithPrices[];
  filename?: string;
}

export function ExportButton({ data, filename = "sarjbot_fiyatlar.csv" }: ExportButtonProps) {
  const handleExportCSV = () => {
    if (!data || data.length === 0) return;

    const headers = [
      "Operatör Adı",
      "Slug",
      "AC Min (TL/kWh)",
      "AC Max (TL/kWh)",
      "DC Min (TL/kWh)",
      "DC Max (TL/kWh)",
      "HPC Min (TL/kWh)",
      "HPC Max (TL/kWh)",
      "Son Güncelleme",
      "Doğrulanmış Mı",
    ];

    const rows = data.map((op) => {
      const acMin = op.prices.AC?.min ?? "";
      const acMax = op.prices.AC?.max ?? "";
      const dcMin = op.prices.DC?.min ?? "";
      const dcMax = op.prices.DC?.max ?? "";
      const hpcMin = op.prices.HPC?.min ?? "";
      const hpcMax = op.prices.HPC?.max ?? "";
      const lastUpdated = op.lastUpdated ? new Date(op.lastUpdated).toISOString() : "";
      const isVerified =
        op.prices.AC?.isVerified || op.prices.DC?.isVerified || op.prices.HPC?.isVerified
          ? "Evet"
          : "Hayır";

      return [
        `"${op.name.replace(/"/g, '""')}"`,
        op.slug,
        acMin,
        acMax,
        dcMin,
        dcMax,
        hpcMin,
        hpcMax,
        lastUpdated,
        isVerified,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExportCSV}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-card border border-border/60 hover:bg-muted text-foreground transition-colors cursor-pointer"
      title="Fiyat listesini CSV olarak indir"
    >
      <span>📥</span> CSV İndir
    </button>
  );
}