"use client";

import { useState, useMemo } from "react";

const VEHICLES = [
  { name: "Tesla Model 3 LR", batteryKWh: 75, effWh: 150, maxDC: 250 },
  { name: "Tesla Model Y LR", batteryKWh: 75, effWh: 160, maxDC: 250 },
  { name: "Togg T10X", batteryKWh: 88.5, effWh: 180, maxDC: 150 },
  { name: "BYD Atto 3", batteryKWh: 60.5, effWh: 170, maxDC: 88 },
  { name: "BMW iX3", batteryKWh: 74, effWh: 180, maxDC: 150 },
  { name: "Mercedes EQA", batteryKWh: 66.5, effWh: 175, maxDC: 100 },
  { name: "Hyundai Ioniq 5", batteryKWh: 72.6, effWh: 170, maxDC: 220 },
  { name: "Kia EV6", batteryKWh: 77.4, effWh: 165, maxDC: 240 },
  { name: "VW ID.4", batteryKWh: 77, effWh: 175, maxDC: 135 },
  { name: "Renault Megane E-Tech", batteryKWh: 60, effWh: 155, maxDC: 130 },
  { name: "Volvo EX30", batteryKWh: 69, effWh: 155, maxDC: 153 },
  { name: "Cupra Born", batteryKWh: 58, effWh: 155, maxDC: 120 },
  { name: "MG4", batteryKWh: 64, effWh: 160, maxDC: 135 },
  { name: "Diger (75 kWh)", batteryKWh: 75, effWh: 170, maxDC: 150 },
];

export default function HesaplaPage() {
  const [vehicleIdx, setVehicleIdx] = useState(0);
  const [currentSoC, setCurrentSoC] = useState(20);
  const [targetSoC, setTargetSoC] = useState(80);
  const [pricePerKWh, setPricePerKWh] = useState(11.0);
  const [chargeType, setChargeType] = useState<"AC" | "DC">("DC");

  const vehicle = VEHICLES[vehicleIdx];

  const result = useMemo(() => {
    const energyNeeded = ((targetSoC - currentSoC) / 100) * vehicle.batteryKWh;
    if (energyNeeded <= 0) return null;

    const power = chargeType === "DC" ? vehicle.maxDC : 22;
    const chargingHours = energyNeeded / (power * 0.9);
    const chargingMinutes = Math.round(chargingHours * 60);

    const totalCost = energyNeeded * pricePerKWh;
    const rangeKm = Math.round(energyNeeded / (vehicle.effWh / 1000));
    const costPerKm = totalCost / rangeKm;

    // Gas comparison
    const gasLPer100km = 7;
    const gasPricePerL = 47;
    const gasCost = (rangeKm / 100) * gasLPer100km * gasPricePerL;
    const savings = gasCost - totalCost;
    const savingsPercent = Math.round((savings / gasCost) * 100);

    return {
      energyNeeded: Math.round(energyNeeded * 100) / 100,
      chargingMinutes,
      power,
      totalCost: Math.round(totalCost * 100) / 100,
      rangeKm,
      costPerKm: Math.round(costPerKm * 100) / 100,
      gasCost: Math.round(gasCost * 100) / 100,
      savingsPercent,
    };
  }, [vehicleIdx, currentSoC, targetSoC, pricePerKWh, chargeType, vehicle]);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
        Maliyet <span className="text-primary">Hesapla</span>
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Sarj maliyetinizi ve benzinli araca gore tasarrufunuzu hesaplayin.
      </p>

      <div className="rounded-xl border border-border/60 bg-card p-6 space-y-6">
        {/* Vehicle */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-2">Arac Modeli</label>
          <select
            value={vehicleIdx}
            onChange={(e) => setVehicleIdx(Number(e.target.value))}
            className="w-full h-10 px-3 rounded-lg bg-background border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {VEHICLES.map((v, i) => (
              <option key={i} value={i}>{v.name} ({v.batteryKWh} kWh)</option>
            ))}
          </select>
        </div>

        {/* Charge type */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-2">Sarj Tipi</label>
          <div className="flex gap-2">
            {(["AC", "DC"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setChargeType(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  chargeType === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "AC" ? "\u26A1 AC (22 kW)" : `\u26A1\u26A1 DC (${vehicle.maxDC} kW)`}
              </button>
            ))}
          </div>
        </div>

        {/* SoC sliders */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">
              Mevcut: <span className="text-primary">{currentSoC}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={currentSoC}
              onChange={(e) => setCurrentSoC(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="h-2 rounded-full bg-background mt-1 overflow-hidden">
              <div className="h-full bg-primary/40 rounded-full" style={{ width: `${currentSoC}%` }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">
              Hedef: <span className="text-emerald-400">{targetSoC}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={targetSoC}
              onChange={(e) => setTargetSoC(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="h-2 rounded-full bg-background mt-1 overflow-hidden">
              <div className="h-full bg-emerald-500/40 rounded-full" style={{ width: `${targetSoC}%` }} />
            </div>
          </div>
        </div>

        {/* Price input */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-2">
            kWh Fiyati: <span className="text-primary">{pricePerKWh.toFixed(2)} TL</span>
          </label>
          <input
            type="range"
            min={5}
            max={20}
            step={0.1}
            value={pricePerKWh}
            onChange={(e) => setPricePerKWh(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground/50 mt-1">
            <span>5 TL</span>
            <span>20 TL</span>
          </div>
        </div>

        {/* Results */}
        {result && result.energyNeeded > 0 && (
          <div className="border-t border-border/40 pt-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <ResultItem label="Sarj edilecek" value={`${result.energyNeeded} kWh`} />
              <ResultItem label="Tahmini sure" value={`~${result.chargingMinutes} dk`} sub={`${result.power} kW`} />
              <ResultItem label="Toplam maliyet" value={`${result.totalCost.toFixed(2)} TL`} highlight />
              <ResultItem label="Kazanilan menzil" value={`~${result.rangeKm} km`} />
              <ResultItem label="TL/km" value={`${result.costPerKm.toFixed(2)} TL`} />
              <ResultItem label="Benzinli esdeser" value={`${result.gasCost.toFixed(2)} TL`} sub="7L/100km, 47TL/L" />
            </div>

            {/* Savings banner */}
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-center">
              <div className="text-2xl font-extrabold text-emerald-400">%{result.savingsPercent} tasarruf!</div>
              <div className="text-xs text-emerald-400/70 mt-1">
                Benzinli araca gore {(result.gasCost - result.totalCost).toFixed(2)} TL daha ucuz
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultItem({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? "bg-primary/10 border border-primary/30" : "bg-background/50"}`}>
      <div className="text-[10px] text-muted-foreground font-medium">{label}</div>
      <div className={`text-lg font-bold tabular-nums ${highlight ? "text-primary" : ""}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground/50">{sub}</div>}
    </div>
  );
}
