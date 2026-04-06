"use client";

import { useState, useMemo } from "react";

const VEHICLES = [
  // Tesla
  { name: "Tesla Model 3 SR+", batteryKWh: 60, effWh: 145, maxDC: 170 },
  { name: "Tesla Model 3 LR", batteryKWh: 75, effWh: 150, maxDC: 250 },
  { name: "Tesla Model 3 Performance", batteryKWh: 75, effWh: 160, maxDC: 250 },
  { name: "Tesla Model Y RWD", batteryKWh: 60, effWh: 155, maxDC: 170 },
  { name: "Tesla Model Y LR", batteryKWh: 75, effWh: 160, maxDC: 250 },
  { name: "Tesla Model S LR", batteryKWh: 100, effWh: 180, maxDC: 250 },
  { name: "Tesla Model X LR", batteryKWh: 100, effWh: 200, maxDC: 250 },
  // Togg
  { name: "Togg T10X Uzun Menzil", batteryKWh: 88.5, effWh: 180, maxDC: 150 },
  { name: "Togg T10X Standart", batteryKWh: 52.4, effWh: 170, maxDC: 150 },
  // BMW
  { name: "BMW iX1 eDrive20", batteryKWh: 64.7, effWh: 165, maxDC: 130 },
  { name: "BMW iX3", batteryKWh: 74, effWh: 180, maxDC: 150 },
  { name: "BMW i4 eDrive40", batteryKWh: 83.9, effWh: 165, maxDC: 205 },
  { name: "BMW i5 eDrive40", batteryKWh: 83.9, effWh: 175, maxDC: 205 },
  { name: "BMW iX xDrive40", batteryKWh: 76.6, effWh: 195, maxDC: 150 },
  { name: "BMW iX xDrive50", batteryKWh: 111.5, effWh: 210, maxDC: 195 },
  // Mercedes
  { name: "Mercedes EQA 250+", batteryKWh: 70.5, effWh: 175, maxDC: 100 },
  { name: "Mercedes EQB 250+", batteryKWh: 70.5, effWh: 185, maxDC: 100 },
  { name: "Mercedes EQC 400", batteryKWh: 80, effWh: 215, maxDC: 110 },
  { name: "Mercedes EQE 350+", batteryKWh: 96, effWh: 175, maxDC: 170 },
  { name: "Mercedes EQS 450+", batteryKWh: 107.8, effWh: 180, maxDC: 200 },
  // Hyundai
  { name: "Hyundai Kona Electric", batteryKWh: 65.4, effWh: 150, maxDC: 100 },
  { name: "Hyundai Ioniq 5 SR", batteryKWh: 58, effWh: 165, maxDC: 220 },
  { name: "Hyundai Ioniq 5 LR", batteryKWh: 77.4, effWh: 170, maxDC: 240 },
  { name: "Hyundai Ioniq 6 LR", batteryKWh: 77.4, effWh: 145, maxDC: 240 },
  // Kia
  { name: "Kia Niro EV", batteryKWh: 64.8, effWh: 155, maxDC: 80 },
  { name: "Kia EV6 SR", batteryKWh: 58, effWh: 160, maxDC: 180 },
  { name: "Kia EV6 LR", batteryKWh: 77.4, effWh: 165, maxDC: 240 },
  { name: "Kia EV9 LR", batteryKWh: 99.8, effWh: 215, maxDC: 240 },
  // Volkswagen
  { name: "VW ID.3 Pro", batteryKWh: 58, effWh: 155, maxDC: 120 },
  { name: "VW ID.3 Pro S", batteryKWh: 77, effWh: 160, maxDC: 170 },
  { name: "VW ID.4 Pro", batteryKWh: 77, effWh: 175, maxDC: 135 },
  { name: "VW ID.5 GTX", batteryKWh: 77, effWh: 180, maxDC: 150 },
  { name: "VW ID.7 Pro S", batteryKWh: 86, effWh: 160, maxDC: 200 },
  { name: "VW ID.Buzz Pro", batteryKWh: 82, effWh: 210, maxDC: 185 },
  // Renault
  { name: "Renault Megane E-Tech EV60", batteryKWh: 60, effWh: 155, maxDC: 130 },
  { name: "Renault Scenic E-Tech EV87", batteryKWh: 87, effWh: 170, maxDC: 150 },
  { name: "Renault Zoe R135", batteryKWh: 52, effWh: 145, maxDC: 50 },
  // Citroen
  { name: "Citroen e-C3", batteryKWh: 44, effWh: 148, maxDC: 100 },
  { name: "Citroen e-C4", batteryKWh: 50, effWh: 160, maxDC: 100 },
  { name: "Citroen e-C4 X", batteryKWh: 50, effWh: 158, maxDC: 100 },
  { name: "Citroen e-C5 Aircross", batteryKWh: 73, effWh: 175, maxDC: 160 },
  { name: "Citroen e-Berlingo", batteryKWh: 50, effWh: 190, maxDC: 100 },
  { name: "Citroen e-SpaceTourer", batteryKWh: 75, effWh: 250, maxDC: 100 },
  // Peugeot
  { name: "Peugeot e-208", batteryKWh: 50, effWh: 150, maxDC: 100 },
  { name: "Peugeot e-2008", batteryKWh: 50, effWh: 165, maxDC: 100 },
  { name: "Peugeot e-308", batteryKWh: 54, effWh: 155, maxDC: 100 },
  { name: "Peugeot e-3008", batteryKWh: 73, effWh: 170, maxDC: 160 },
  // Opel
  { name: "Opel Corsa Electric", batteryKWh: 50, effWh: 150, maxDC: 100 },
  { name: "Opel Mokka Electric", batteryKWh: 50, effWh: 165, maxDC: 100 },
  { name: "Opel Astra Electric", batteryKWh: 54, effWh: 158, maxDC: 100 },
  // Fiat
  { name: "Fiat 500e", batteryKWh: 42, effWh: 140, maxDC: 85 },
  { name: "Fiat 600e", batteryKWh: 54, effWh: 160, maxDC: 100 },
  // BYD
  { name: "BYD Atto 2", batteryKWh: 45.1, effWh: 148, maxDC: 70 },
  { name: "BYD Atto 3", batteryKWh: 60.5, effWh: 170, maxDC: 88 },
  { name: "BYD Dolphin", batteryKWh: 60.5, effWh: 148, maxDC: 88 },
  { name: "BYD Seal", batteryKWh: 82.5, effWh: 160, maxDC: 150 },
  { name: "BYD Seal U", batteryKWh: 87.0, effWh: 180, maxDC: 140 },
  { name: "BYD Han", batteryKWh: 85.4, effWh: 175, maxDC: 120 },
  { name: "BYD Tang EV", batteryKWh: 108.8, effWh: 220, maxDC: 166 },
  // MG
  { name: "MG4 Standard", batteryKWh: 51, effWh: 155, maxDC: 117 },
  { name: "MG4 Long Range", batteryKWh: 64, effWh: 160, maxDC: 135 },
  { name: "MG4 XPower", batteryKWh: 64, effWh: 170, maxDC: 135 },
  { name: "MG Marvel R", batteryKWh: 70, effWh: 185, maxDC: 92 },
  { name: "MG ZS EV", batteryKWh: 72.6, effWh: 175, maxDC: 92 },
  // Volvo
  { name: "Volvo EX30 SR", batteryKWh: 51, effWh: 150, maxDC: 134 },
  { name: "Volvo EX30 LR", batteryKWh: 69, effWh: 155, maxDC: 153 },
  { name: "Volvo EX40 (XC40 Recharge)", batteryKWh: 82, effWh: 185, maxDC: 200 },
  { name: "Volvo EC40 (C40 Recharge)", batteryKWh: 82, effWh: 180, maxDC: 200 },
  { name: "Volvo EX90 Twin Motor", batteryKWh: 111, effWh: 210, maxDC: 250 },
  // Cupra / SEAT
  { name: "Cupra Born 58 kWh", batteryKWh: 58, effWh: 155, maxDC: 120 },
  { name: "Cupra Born 77 kWh", batteryKWh: 77, effWh: 160, maxDC: 170 },
  { name: "Cupra Tavascan", batteryKWh: 77, effWh: 180, maxDC: 135 },
  // Skoda
  { name: "Skoda Enyaq iV 60", batteryKWh: 58, effWh: 165, maxDC: 120 },
  { name: "Skoda Enyaq iV 80", batteryKWh: 77, effWh: 170, maxDC: 135 },
  { name: "Skoda Enyaq Coupe RS", batteryKWh: 77, effWh: 175, maxDC: 175 },
  // Audi
  { name: "Audi Q4 e-tron 40", batteryKWh: 76.6, effWh: 175, maxDC: 135 },
  { name: "Audi Q4 e-tron 50", batteryKWh: 76.6, effWh: 185, maxDC: 175 },
  { name: "Audi Q8 e-tron 55", batteryKWh: 114, effWh: 210, maxDC: 170 },
  { name: "Audi e-tron GT", batteryKWh: 93.4, effWh: 195, maxDC: 270 },
  // Porsche
  { name: "Porsche Taycan", batteryKWh: 79.2, effWh: 190, maxDC: 270 },
  { name: "Porsche Taycan Performance", batteryKWh: 93.4, effWh: 200, maxDC: 270 },
  { name: "Porsche Macan Electric", batteryKWh: 100, effWh: 195, maxDC: 270 },
  // Nissan
  { name: "Nissan Leaf 40 kWh", batteryKWh: 40, effWh: 155, maxDC: 50 },
  { name: "Nissan Leaf e+ 62 kWh", batteryKWh: 62, effWh: 165, maxDC: 100 },
  { name: "Nissan Ariya 63 kWh", batteryKWh: 63, effWh: 165, maxDC: 130 },
  { name: "Nissan Ariya 87 kWh", batteryKWh: 87, effWh: 175, maxDC: 130 },
  // Toyota / Lexus
  { name: "Toyota bZ4X", batteryKWh: 71.4, effWh: 175, maxDC: 150 },
  { name: "Lexus RZ 450e", batteryKWh: 71.4, effWh: 185, maxDC: 150 },
  { name: "Lexus UX 300e", batteryKWh: 72.8, effWh: 175, maxDC: 150 },
  // Ford
  { name: "Ford Mustang Mach-E SR", batteryKWh: 70, effWh: 175, maxDC: 115 },
  { name: "Ford Mustang Mach-E LR", batteryKWh: 91, effWh: 180, maxDC: 150 },
  { name: "Ford Explorer Electric", batteryKWh: 77, effWh: 175, maxDC: 185 },
  // Mini / Smart
  { name: "Mini Cooper SE", batteryKWh: 54.2, effWh: 155, maxDC: 95 },
  { name: "Mini Countryman SE ALL4", batteryKWh: 66.5, effWh: 175, maxDC: 130 },
  { name: "Smart #1 Pro+", batteryKWh: 66, effWh: 165, maxDC: 150 },
  { name: "Smart #3", batteryKWh: 66, effWh: 170, maxDC: 150 },
  // Dacia
  { name: "Dacia Spring Electric", batteryKWh: 26.8, effWh: 140, maxDC: 30 },
  // Jaguar
  { name: "Jaguar I-Pace", batteryKWh: 90, effWh: 220, maxDC: 104 },
  // Seres
  { name: "Seres 3", batteryKWh: 52, effWh: 170, maxDC: 80 },
  { name: "Seres 5", batteryKWh: 80, effWh: 180, maxDC: 150 },
  // Diger
  { name: "Diger (50 kWh)", batteryKWh: 50, effWh: 160, maxDC: 100 },
  { name: "Diger (75 kWh)", batteryKWh: 75, effWh: 170, maxDC: 150 },
  { name: "Diger (100 kWh)", batteryKWh: 100, effWh: 190, maxDC: 200 },
].sort((a, b) => a.name.localeCompare(b.name, "tr"));

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

        {/* SoC inputs */}
        <div className="grid grid-cols-2 gap-4">
          <SliderWithInput
            label="Mevcut Sarj"
            value={currentSoC}
            onChange={setCurrentSoC}
            min={0}
            max={100}
            step={1}
            unit="%"
            color="primary"
          />
          <SliderWithInput
            label="Hedef Sarj"
            value={targetSoC}
            onChange={setTargetSoC}
            min={0}
            max={100}
            step={1}
            unit="%"
            color="emerald"
          />
        </div>

        {/* Price input */}
        <SliderWithInput
          label="kWh Fiyati"
          value={pricePerKWh}
          onChange={setPricePerKWh}
          min={1}
          max={25}
          step={0.01}
          unit="TL"
          color="primary"
        />

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

function SliderWithInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  color: "primary" | "emerald";
}) {
  const accentClass = color === "emerald" ? "accent-emerald-500" : "accent-primary";
  const barClass = color === "emerald" ? "bg-emerald-500/40" : "bg-primary/40";
  const textClass = color === "emerald" ? "text-emerald-400" : "text-primary";
  const borderClass = color === "emerald" ? "focus:ring-emerald-500/50 focus:border-emerald-500/50" : "focus:ring-primary/50 focus:border-primary/50";

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "" || raw === "-") return;
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      onChange(Math.min(max, Math.max(min, num)));
    }
  };

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-muted-foreground">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={step < 1 ? value.toFixed(2) : value}
            onChange={handleTextChange}
            className={`w-20 h-7 px-2 rounded-md bg-background border border-border/60 text-xs text-right tabular-nums font-bold ${textClass} ${borderClass} focus:outline-none focus:ring-2`}
          />
          <span className="text-[10px] text-muted-foreground">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full ${accentClass}`}
      />
      <div className="h-1.5 rounded-full bg-background mt-1 overflow-hidden">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
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
