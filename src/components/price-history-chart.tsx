"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { PriceHistoryRecord } from "@/lib/db/queries";

interface PriceHistoryChartProps {
  history: PriceHistoryRecord[];
}

export function PriceHistoryChart({ history }: PriceHistoryChartProps) {
  if (!history || history.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
        Henüz bu operatör için geçmiş fiyat kaydı bulunmuyor.
      </div>
    );
  }

  // Format data for Recharts by date
  const dataByDateMap = new Map<
    string,
    { date: string; AC?: number; DC?: number; HPC?: number }
  >();

  // Reverse to show chronological order
  const chronological = [...history].reverse();

  chronological.forEach((rec) => {
    const dateStr = rec.recordedAt
      ? new Date(rec.recordedAt).toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "short",
        })
      : "Bilinmiyor";

    const entry = dataByDateMap.get(dateStr) || { date: dateStr };
    entry[rec.chargeType] = rec.priceMin;
    dataByDateMap.set(dateStr, entry);
  });

  const chartData = Array.from(dataByDateMap.values());

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
        <span>📈</span> Fiyat Değişim Geçmişi (TL/kWh)
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} />
            <YAxis stroke="#888888" fontSize={11} tickLine={false} unit="₺" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                borderColor: "#374151",
                borderRadius: "0.5rem",
                color: "#f9fafb",
                fontSize: "12px",
              }}
              formatter={(val) => [
                typeof val === "number" ? `${val.toFixed(2)} TL/kWh` : "-",
                "Fiyat",
              ]}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
            <Line
              type="monotone"
              dataKey="AC"
              name="AC (22 kW)"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="DC"
              name="DC (Hızlı)"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="HPC"
              name="HPC (Ultra Hızlı)"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}