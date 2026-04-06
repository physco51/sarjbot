import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch("https://www.petrolofisi.com.tr/akaryakit-fiyatlari", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });

    const html = await res.text();

    // Find the Istanbul Avrupa row and extract all prices from it
    // Table format: City | Benzin | Motorin | Gazyagi | Kalorifer | FuelOil | Otogaz
    const istanbulMatch = html.match(
      /ISTANBUL\s*\(AVRUPA\)[\s\S]*?<\/tr>/i
    );

    if (istanbulMatch) {
      // Extract all prices (XX.XX or XX,XX format) from this row
      const prices = istanbulMatch[0].match(/(\d{1,3})[.,](\d{2})\s*TL/g);

      if (prices && prices.length >= 2) {
        const parsePrice = (s: string) => parseFloat(s.replace(/\s*TL.*/, "").replace(",", "."));
        const benzin = parsePrice(prices[0]); // First price = Benzin
        const motorin = parsePrice(prices[1]); // Second price = Motorin

        if (benzin > 0 && motorin > 0) {
          return NextResponse.json({
            benzin,
            motorin,
            source: "Petrol Ofisi",
            city: "Istanbul Avrupa",
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    return fallback();
  } catch {
    return fallback();
  }
}

function fallback() {
  return NextResponse.json({
    benzin: 62.60,
    motorin: 77.47,
    source: "Petrol Ofisi (onbellek)",
    city: "Istanbul Avrupa",
    updatedAt: new Date().toISOString(),
  });
}
