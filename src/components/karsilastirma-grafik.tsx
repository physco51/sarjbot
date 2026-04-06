"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { OperatorWithPrices } from "@/lib/types";

export function KarsilastirmaGrafik({ data }: { data: OperatorWithPrices[] }) {
  const chartData = data
    .filter((op) => op.prices.AC || op.prices.DC || op.prices.HPC)
    .map((op) => ({
      name: op.name,
      AC: op.prices.AC?.min ?? 0,
      DC: op.prices.DC?.min ?? 0,
      HPC: op.prices.HPC?.min ?? 0,
    }))
    .sort((a, b) => (a.DC || a.AC || a.HPC) - (b.DC || b.AC || b.HPC));

  return (
    <div className="w-full h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{
              value: "TL/kWh",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 12 },
            }}
          />
          <Tooltip
            formatter={(value) => {
              const num = Number(value);
              return num > 0 ? [`${num.toFixed(2)} TL/kWh`] : ["Mevcut degil"];
            }}
          />
          <Legend />
          <Bar dataKey="AC" fill="#22c55e" name="AC (22 kW)" radius={[2, 2, 0, 0]} />
          <Bar dataKey="DC" fill="#3b82f6" name="DC (<180 kW)" radius={[2, 2, 0, 0]} />
          <Bar dataKey="HPC" fill="#f59e0b" name="HPC (180+ kW)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
