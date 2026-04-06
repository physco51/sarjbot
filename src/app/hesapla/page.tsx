"use client";

import { useState, useMemo, useEffect } from "react";

const VEHICLES = [
  // Tesla
  { name: "Tesla Model 3 SR+", batteryKWh: 60, effWh: 145, maxDC: 170, wltpKm: 410 },
  { name: "Tesla Model 3 LR", batteryKWh: 75, effWh: 150, maxDC: 250, wltpKm: 510 },
  { name: "Tesla Model 3 Performance", batteryKWh: 75, effWh: 160, maxDC: 250, wltpKm: 460 },
  { name: "Tesla Model Y RWD", batteryKWh: 60, effWh: 155, maxDC: 170, wltpKm: 390 },
  { name: "Tesla Model Y LR", batteryKWh: 75, effWh: 160, maxDC: 250, wltpKm: 480 },
  { name: "Tesla Model S LR", batteryKWh: 100, effWh: 180, maxDC: 250, wltpKm: 560 },
  { name: "Tesla Model X LR", batteryKWh: 100, effWh: 200, maxDC: 250, wltpKm: 500 },
  // Togg
  { name: "Togg T10F", batteryKWh: 88.5, effWh: 165, maxDC: 150, wltpKm: 535 },
  { name: "Togg T10X Uzun Menzil", batteryKWh: 88.5, effWh: 180, maxDC: 150, wltpKm: 492 },
  { name: "Togg T10X Standart", batteryKWh: 52.4, effWh: 170, maxDC: 150, wltpKm: 314 },
  // BMW
  { name: "BMW iX1 eDrive20", batteryKWh: 64.7, effWh: 165, maxDC: 130, wltpKm: 395 },
  { name: "BMW iX3", batteryKWh: 74, effWh: 180, maxDC: 150, wltpKm: 410 },
  { name: "BMW i4 eDrive40", batteryKWh: 83.9, effWh: 165, maxDC: 205, wltpKm: 510 },
  { name: "BMW i5 eDrive40", batteryKWh: 83.9, effWh: 175, maxDC: 205, wltpKm: 480 },
  { name: "BMW iX xDrive40", batteryKWh: 76.6, effWh: 195, maxDC: 150, wltpKm: 395 },
  { name: "BMW iX xDrive50", batteryKWh: 111.5, effWh: 210, maxDC: 195, wltpKm: 530 },
  // Mercedes
  { name: "Mercedes EQA 250+", batteryKWh: 70.5, effWh: 175, maxDC: 100, wltpKm: 400 },
  { name: "Mercedes EQB 250+", batteryKWh: 70.5, effWh: 185, maxDC: 100, wltpKm: 380 },
  { name: "Mercedes EQC 400", batteryKWh: 80, effWh: 215, maxDC: 110, wltpKm: 370 },
  { name: "Mercedes EQE 350+", batteryKWh: 96, effWh: 175, maxDC: 170, wltpKm: 545 },
  { name: "Mercedes EQS 450+", batteryKWh: 107.8, effWh: 180, maxDC: 200, wltpKm: 600 },
  // Hyundai
  { name: "Hyundai Kona Electric", batteryKWh: 65.4, effWh: 150, maxDC: 100, wltpKm: 435 },
  { name: "Hyundai Ioniq 5 SR", batteryKWh: 58, effWh: 165, maxDC: 220, wltpKm: 354 },
  { name: "Hyundai Ioniq 5 LR", batteryKWh: 77.4, effWh: 170, maxDC: 240, wltpKm: 460 },
  { name: "Hyundai Ioniq 6 LR", batteryKWh: 77.4, effWh: 145, maxDC: 240, wltpKm: 535 },
  // Kia
  { name: "Kia Niro EV", batteryKWh: 64.8, effWh: 155, maxDC: 80, wltpKm: 420 },
  { name: "Kia EV6 SR", batteryKWh: 58, effWh: 160, maxDC: 180, wltpKm: 360 },
  { name: "Kia EV6 LR", batteryKWh: 77.4, effWh: 165, maxDC: 240, wltpKm: 470 },
  { name: "Kia EV9 LR", batteryKWh: 99.8, effWh: 215, maxDC: 240, wltpKm: 465 },
  // Volkswagen
  { name: "VW ID.3 Pro", batteryKWh: 58, effWh: 155, maxDC: 120, wltpKm: 375 },
  { name: "VW ID.3 Pro S", batteryKWh: 77, effWh: 160, maxDC: 170, wltpKm: 480 },
  { name: "VW ID.4 Pro", batteryKWh: 77, effWh: 175, maxDC: 135, wltpKm: 440 },
  { name: "VW ID.5 GTX", batteryKWh: 77, effWh: 180, maxDC: 150, wltpKm: 430 },
  { name: "VW ID.7 Pro S", batteryKWh: 86, effWh: 160, maxDC: 200, wltpKm: 540 },
  { name: "VW ID.Buzz Pro", batteryKWh: 82, effWh: 210, maxDC: 185, wltpKm: 390 },
  // Renault
  { name: "Renault Megane E-Tech EV60", batteryKWh: 60, effWh: 155, maxDC: 130, wltpKm: 385 },
  { name: "Renault Scenic E-Tech EV87", batteryKWh: 87, effWh: 170, maxDC: 150, wltpKm: 510 },
  { name: "Renault Zoe R135", batteryKWh: 52, effWh: 145, maxDC: 50, wltpKm: 360 },
  // Citroen
  { name: "Citroen e-C3", batteryKWh: 44, effWh: 148, maxDC: 100, wltpKm: 300 },
  { name: "Citroen e-C4", batteryKWh: 50, effWh: 160, maxDC: 100, wltpKm: 315 },
  { name: "Citroen e-C4 X", batteryKWh: 50, effWh: 158, maxDC: 100, wltpKm: 320 },
  { name: "Citroen e-C5 Aircross", batteryKWh: 73, effWh: 175, maxDC: 160, wltpKm: 415 },
  { name: "Citroen e-Berlingo", batteryKWh: 50, effWh: 190, maxDC: 100, wltpKm: 265 },
  { name: "Citroen e-SpaceTourer", batteryKWh: 75, effWh: 250, maxDC: 100, wltpKm: 300 },
  // Peugeot
  { name: "Peugeot e-208", batteryKWh: 50, effWh: 150, maxDC: 100, wltpKm: 335 },
  { name: "Peugeot e-2008", batteryKWh: 50, effWh: 165, maxDC: 100, wltpKm: 305 },
  { name: "Peugeot e-308", batteryKWh: 54, effWh: 155, maxDC: 100, wltpKm: 350 },
  { name: "Peugeot e-3008", batteryKWh: 73, effWh: 170, maxDC: 160, wltpKm: 430 },
  // Opel
  { name: "Opel Corsa Electric", batteryKWh: 50, effWh: 150, maxDC: 100, wltpKm: 335 },
  { name: "Opel Mokka Electric", batteryKWh: 50, effWh: 165, maxDC: 100, wltpKm: 305 },
  { name: "Opel Astra Electric", batteryKWh: 54, effWh: 158, maxDC: 100, wltpKm: 345 },
  // Fiat
  { name: "Fiat 500e", batteryKWh: 42, effWh: 140, maxDC: 85, wltpKm: 300 },
  { name: "Fiat 600e", batteryKWh: 54, effWh: 160, maxDC: 100, wltpKm: 340 },
  // BYD
  { name: "BYD Atto 2", batteryKWh: 45.1, effWh: 148, maxDC: 70, wltpKm: 305 },
  { name: "BYD Atto 3", batteryKWh: 60.5, effWh: 170, maxDC: 88, wltpKm: 356 },
  { name: "BYD Dolphin", batteryKWh: 60.5, effWh: 148, maxDC: 88, wltpKm: 410 },
  { name: "BYD Seal", batteryKWh: 82.5, effWh: 160, maxDC: 150, wltpKm: 516 },
  { name: "BYD Seal U", batteryKWh: 87.0, effWh: 180, maxDC: 140, wltpKm: 483 },
  { name: "BYD Han", batteryKWh: 85.4, effWh: 175, maxDC: 120, wltpKm: 490 },
  { name: "BYD Tang EV", batteryKWh: 108.8, effWh: 220, maxDC: 166, wltpKm: 495 },
  // MG
  { name: "MG4 Standard", batteryKWh: 51, effWh: 155, maxDC: 117, wltpKm: 330 },
  { name: "MG4 Long Range", batteryKWh: 64, effWh: 160, maxDC: 135, wltpKm: 400 },
  { name: "MG4 XPower", batteryKWh: 64, effWh: 170, maxDC: 135, wltpKm: 375 },
  { name: "MG Marvel R", batteryKWh: 70, effWh: 185, maxDC: 92, wltpKm: 380 },
  { name: "MG ZS EV", batteryKWh: 72.6, effWh: 175, maxDC: 92, wltpKm: 415 },
  // Volvo
  { name: "Volvo EX30 SR", batteryKWh: 51, effWh: 150, maxDC: 134, wltpKm: 340 },
  { name: "Volvo EX30 LR", batteryKWh: 69, effWh: 155, maxDC: 153, wltpKm: 445 },
  { name: "Volvo EX40 (XC40 Recharge)", batteryKWh: 82, effWh: 185, maxDC: 200, wltpKm: 440 },
  { name: "Volvo EC40 (C40 Recharge)", batteryKWh: 82, effWh: 180, maxDC: 200, wltpKm: 455 },
  { name: "Volvo EX90 Twin Motor", batteryKWh: 111, effWh: 210, maxDC: 250, wltpKm: 530 },
  // Cupra / SEAT
  { name: "Cupra Born 58 kWh", batteryKWh: 58, effWh: 155, maxDC: 120, wltpKm: 375 },
  { name: "Cupra Born 77 kWh", batteryKWh: 77, effWh: 160, maxDC: 170, wltpKm: 480 },
  { name: "Cupra Tavascan", batteryKWh: 77, effWh: 180, maxDC: 135, wltpKm: 430 },
  // Skoda
  { name: "Skoda Enyaq iV 60", batteryKWh: 58, effWh: 165, maxDC: 120, wltpKm: 355 },
  { name: "Skoda Enyaq iV 80", batteryKWh: 77, effWh: 170, maxDC: 135, wltpKm: 455 },
  { name: "Skoda Enyaq Coupe RS", batteryKWh: 77, effWh: 175, maxDC: 175, wltpKm: 440 },
  // Audi
  { name: "Audi Q4 e-tron 40", batteryKWh: 76.6, effWh: 175, maxDC: 135, wltpKm: 440 },
  { name: "Audi Q4 e-tron 50", batteryKWh: 76.6, effWh: 185, maxDC: 175, wltpKm: 415 },
  { name: "Audi Q8 e-tron 55", batteryKWh: 114, effWh: 210, maxDC: 170, wltpKm: 540 },
  { name: "Audi e-tron GT", batteryKWh: 93.4, effWh: 195, maxDC: 270, wltpKm: 480 },
  // Porsche
  { name: "Porsche Taycan", batteryKWh: 79.2, effWh: 190, maxDC: 270, wltpKm: 415 },
  { name: "Porsche Taycan Performance", batteryKWh: 93.4, effWh: 200, maxDC: 270, wltpKm: 465 },
  { name: "Porsche Macan Electric", batteryKWh: 100, effWh: 195, maxDC: 270, wltpKm: 510 },
  // Nissan
  { name: "Nissan Leaf 40 kWh", batteryKWh: 40, effWh: 155, maxDC: 50, wltpKm: 258 },
  { name: "Nissan Leaf e+ 62 kWh", batteryKWh: 62, effWh: 165, maxDC: 100, wltpKm: 375 },
  { name: "Nissan Ariya 63 kWh", batteryKWh: 63, effWh: 165, maxDC: 130, wltpKm: 380 },
  { name: "Nissan Ariya 87 kWh", batteryKWh: 87, effWh: 175, maxDC: 130, wltpKm: 495 },
  // Toyota / Lexus
  { name: "Toyota bZ4X", batteryKWh: 71.4, effWh: 175, maxDC: 150, wltpKm: 410 },
  { name: "Lexus RZ 450e", batteryKWh: 71.4, effWh: 185, maxDC: 150, wltpKm: 385 },
  { name: "Lexus UX 300e", batteryKWh: 72.8, effWh: 175, maxDC: 150, wltpKm: 415 },
  // Ford
  { name: "Ford Mustang Mach-E SR", batteryKWh: 70, effWh: 175, maxDC: 115, wltpKm: 400 },
  { name: "Ford Mustang Mach-E LR", batteryKWh: 91, effWh: 180, maxDC: 150, wltpKm: 505 },
  { name: "Ford Explorer Electric", batteryKWh: 77, effWh: 175, maxDC: 185, wltpKm: 440 },
  // Mini / Smart
  { name: "Mini Cooper SE", batteryKWh: 54.2, effWh: 155, maxDC: 95, wltpKm: 350 },
  { name: "Mini Countryman SE ALL4", batteryKWh: 66.5, effWh: 175, maxDC: 130, wltpKm: 380 },
  { name: "Smart #1 Pro+", batteryKWh: 66, effWh: 165, maxDC: 150, wltpKm: 400 },
  { name: "Smart #3", batteryKWh: 66, effWh: 170, maxDC: 150, wltpKm: 390 },
  // Dacia
  { name: "Dacia Spring Electric", batteryKWh: 26.8, effWh: 140, maxDC: 30, wltpKm: 190 },
  // Jaguar
  { name: "Jaguar I-Pace", batteryKWh: 90, effWh: 220, maxDC: 104, wltpKm: 410 },
  // Seres
  { name: "Seres 3", batteryKWh: 52, effWh: 170, maxDC: 80, wltpKm: 305 },
  { name: "Seres 5", batteryKWh: 80, effWh: 180, maxDC: 150, wltpKm: 445 },
  // Diger
  { name: "Diger (50 kWh)", batteryKWh: 50, effWh: 160, maxDC: 100, wltpKm: 310 },
  { name: "Diger (75 kWh)", batteryKWh: 75, effWh: 170, maxDC: 150, wltpKm: 440 },
  { name: "Diger (100 kWh)", batteryKWh: 100, effWh: 190, maxDC: 200, wltpKm: 525 },
].sort((a, b) => a.name.localeCompare(b.name, "tr"));

export default function HesaplaPage() {
  const [vehicleIdx, setVehicleIdx] = useState(0);
  const [currentSoC, setCurrentSoC] = useState(20);
  const [targetSoC, setTargetSoC] = useState(80);
  const [pricePerKWh, setPricePerKWh] = useState(11.0);
  const [chargeType, setChargeType] = useState<"AC" | "DC">("DC");
  const [gasLPer100km, setGasLPer100km] = useState(7.0);
  const [fuelType, setFuelType] = useState<"benzin" | "motorin">("benzin");
  const [fuelPrices, setFuelPrices] = useState({ benzin: 62.60, motorin: 77.47 });
  const [fuelLoading, setFuelLoading] = useState(true);

  const vehicle = VEHICLES[vehicleIdx];

  // Fetch fuel prices from API
  useEffect(() => {
    fetch("/api/akaryakit")
      .then((r) => r.json())
      .then((data) => {
        if (data.benzin && data.motorin) {
          setFuelPrices({ benzin: data.benzin, motorin: data.motorin });
        }
      })
      .catch(() => {})
      .finally(() => setFuelLoading(false));
  }, []);

  const gasPricePerL = fuelPrices[fuelType];

  const result = useMemo(() => {
    const energyNeeded = ((targetSoC - currentSoC) / 100) * vehicle.batteryKWh;
    if (energyNeeded <= 0) return null;

    const power = chargeType === "DC" ? vehicle.maxDC : 22;
    const chargingHours = energyNeeded / (power * 0.9);
    const chargingMinutes = Math.round(chargingHours * 60);

    const totalCost = energyNeeded * pricePerKWh;
    const rangeKm = Math.round(energyNeeded / (vehicle.effWh / 1000));
    const costPerKm = totalCost / rangeKm;

    const gasCost = (rangeKm / 100) * gasLPer100km * gasPricePerL;
    const gasCostPerKm = rangeKm > 0 ? gasCost / rangeKm : 0;
    const savings = gasCost - totalCost;
    const savingsPercent = gasCost > 0 ? Math.round((savings / gasCost) * 100) : 0;

    return {
      energyNeeded: Math.round(energyNeeded * 100) / 100,
      chargingMinutes,
      power,
      totalCost: Math.round(totalCost * 100) / 100,
      rangeKm,
      costPerKm: Math.round(costPerKm * 100) / 100,
      gasCostPerKm: Math.round(gasCostPerKm * 100) / 100,
      gasCost: Math.round(gasCost * 100) / 100,
      savingsPercent,
    };
  }, [vehicleIdx, currentSoC, targetSoC, pricePerKWh, chargeType, vehicle, gasLPer100km, gasPricePerL]);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
        Maliyet <span className="text-primary">Hesapla</span>
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Sarj maliyetinizi ve benzinli/dizel araca gore tasarrufunuzu hesaplayin.
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

        {/* Vehicle info */}
        <div className="flex items-center gap-4 px-3 py-2.5 rounded-lg bg-background/50 text-xs text-muted-foreground">
          <div><span className="font-semibold text-foreground">{vehicle.batteryKWh}</span> kWh batarya</div>
          <div className="text-border">|</div>
          <div><span className="font-semibold text-foreground">{vehicle.wltpKm}</span> km WLTP menzil</div>
          <div className="text-border">|</div>
          <div><span className="font-semibold text-foreground">{(vehicle.effWh / 10).toFixed(1)}</span> kWh/100km</div>
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
          />
          <SliderWithInput
            label="Hedef Sarj"
            value={targetSoC}
            onChange={setTargetSoC}
            min={0}
            max={100}
            step={1}
            unit="%"
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
        />

        {/* Fuel comparison section */}
        <div className="border-t border-border/40 pt-5">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3">Yakit Karsilastirma</h3>

          {/* Fuel type toggle */}
          <div className="flex gap-2 mb-4">
            {(["benzin", "motorin"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFuelType(f)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  fuelType === f
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-background border border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "benzin" ? "\u26FD Benzin" : "\u26FD Motorin"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fuel price - auto fetched */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  {fuelType === "benzin" ? "Benzin" : "Motorin"} Fiyati
                </label>
                <span className="text-xs text-primary font-bold tabular-nums">{gasPricePerL.toFixed(2)} TL/L</span>
              </div>
              <div className="text-[10px] text-muted-foreground/50">
                {fuelLoading ? "Yukleniyor..." : "Petrol Ofisi - Istanbul Avrupa"}
              </div>
            </div>

            {/* Consumption per 100km */}
            <SliderWithInput
              label="100 km Tuketim"
              value={gasLPer100km}
              onChange={setGasLPer100km}
              min={3}
              max={15}
              step={0.1}
              unit="L"
            />
          </div>
        </div>

        {/* Results */}
        {result && result.energyNeeded > 0 && (
          <div className="border-t border-border/40 pt-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <ResultItem label="Sarj edilecek" value={`${result.energyNeeded} kWh`} />
              <ResultItem
                label="Tahmini sure"
                value={`~${result.chargingMinutes} dk`}
                sub={result.chargingMinutes > 60 ? `(${Math.floor(result.chargingMinutes / 60)} saat ${result.chargingMinutes % 60} dk) ${result.power} kW` : `${result.power} kW`}
              />
              <ResultItem label="Toplam maliyet" value={`${result.totalCost.toFixed(2)} TL`} highlight />
              <ResultItem label="Kazanilan menzil" value={`~${result.rangeKm} km`} />
              <ResultItem label="TL/km (elektrik)" value={`${result.costPerKm.toFixed(2)} TL`} />
              <ResultItem label={`TL/km (${fuelType})`} value={`${result.gasCostPerKm.toFixed(2)} TL`} />
              <ResultItem
                label={`${fuelType === "benzin" ? "Benzinli" : "Dizel"} Esdeger`}
                value={`${result.gasCost.toFixed(2)} TL`}
                sub={`${gasLPer100km}L/100km, ${gasPricePerL.toFixed(2)} TL/L`}
              />
              <ResultItem label="Elektrik maliyeti" value={`${result.totalCost.toFixed(2)} TL`} sub={`${result.rangeKm} km icin`} />
            </div>

            {/* Savings banner */}
            {result.savingsPercent > 0 ? (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-center">
                <div className="text-2xl font-extrabold text-emerald-400">%{result.savingsPercent} tasarruf!</div>
                <div className="text-xs text-emerald-400/70 mt-1">
                  {fuelType === "benzin" ? "Benzinli" : "Dizel"} araca gore {(result.gasCost - result.totalCost).toFixed(2)} TL daha ucuz
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-4 text-center">
                <div className="text-lg font-extrabold text-amber-400">Elektrik daha pahali</div>
                <div className="text-xs text-amber-400/70 mt-1">
                  Bu fiyatla {fuelType === "benzin" ? "benzinli" : "dizel"} arac {(result.totalCost - result.gasCost).toFixed(2)} TL daha ucuz
                </div>
              </div>
            )}
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
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}) {
  const [textVal, setTextVal] = useState(step < 1 ? value.toFixed(2) : String(value));

  // Sync text when value changes from slider
  useEffect(() => {
    setTextVal(step < 1 ? value.toFixed(2) : String(value));
  }, [value, step]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTextVal(raw);
    if (raw === "" || raw === "." || raw === ",") return;
    const num = parseFloat(raw.replace(",", "."));
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    }
  };

  const handleBlur = () => {
    const num = parseFloat(textVal.replace(",", "."));
    if (isNaN(num)) {
      setTextVal(step < 1 ? value.toFixed(2) : String(value));
    } else {
      const clamped = Math.min(max, Math.max(min, num));
      onChange(clamped);
      setTextVal(step < 1 ? clamped.toFixed(2) : String(clamped));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-muted-foreground">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="text"
            inputMode="decimal"
            value={textVal}
            onChange={handleTextChange}
            onBlur={handleBlur}
            className="w-16 h-7 px-2 rounded-md bg-background border border-border/60 text-xs text-right tabular-nums font-bold text-primary focus:ring-primary/50 focus:border-primary/50 focus:outline-none focus:ring-2"
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
        className="w-full accent-primary"
      />
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
