import { getAllOperatorsWithPrices } from "@/lib/db/queries";
import { FiyatTablosu } from "@/components/fiyat-tablosu";
import { SonGuncelleme } from "@/components/son-guncelleme";
import { KarsilastirmaGrafik } from "@/components/karsilastirma-grafik";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getAllOperatorsWithPrices();

  // Fiyati olan ve olmayan operatorleri ayir
  const withPrices = data.filter(
    (op) => op.prices.AC || op.prices.DC || op.prices.HPC
  );
  const withoutPrices = data.filter(
    (op) => !op.prices.AC && !op.prices.DC && !op.prices.HPC
  );

  const lastUpdated = withPrices.reduce<Date | null>((latest, op) => {
    if (!op.lastUpdated) return latest;
    if (!latest) return op.lastUpdated;
    return op.lastUpdated > latest ? op.lastUpdated : latest;
  }, null);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Turkiye EV Sarj Fiyatlari
        </h1>
        <p className="text-muted-foreground mb-4">
          {data.length} operatorun guncel fiyatlarini tek bir yerde karsilastirin.
          {withPrices.length} operatorun fiyati mevcut.
        </p>
        <SonGuncelleme lastUpdated={lastUpdated} />
      </div>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Toplam Operator"
          value={data.length.toString()}
        />
        <StatCard
          label="En Ucuz AC"
          value={(() => {
            const acOps = withPrices.filter((d) => d.prices.AC);
            if (!acOps.length) return "-";
            const cheapest = acOps.reduce((a, b) =>
              a.prices.AC!.min < b.prices.AC!.min ? a : b
            );
            return `${cheapest.prices.AC!.min.toFixed(2)} TL - ${cheapest.name}`;
          })()}
        />
        <StatCard
          label="En Ucuz DC"
          value={(() => {
            const dcOps = withPrices.filter((d) => d.prices.DC);
            if (!dcOps.length) return "-";
            const cheapest = dcOps.reduce((a, b) =>
              a.prices.DC!.min < b.prices.DC!.min ? a : b
            );
            return `${cheapest.prices.DC!.min.toFixed(2)} TL - ${cheapest.name}`;
          })()}
        />
        <StatCard
          label="En Ucuz HPC"
          value={(() => {
            const hpcOps = withPrices.filter((d) => d.prices.HPC);
            if (!hpcOps.length) return "-";
            const cheapest = hpcOps.reduce((a, b) =>
              a.prices.HPC!.min < b.prices.HPC!.min ? a : b
            );
            return `${cheapest.prices.HPC!.min.toFixed(2)} TL - ${cheapest.name}`;
          })()}
        />
      </section>

      {/* Price Table - Only operators with prices */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">
          Fiyat Tablosu ({withPrices.length} operator)
        </h2>
        <FiyatTablosu data={withPrices} />
      </section>

      {/* Chart */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Fiyat Karsilastirmasi</h2>
        <div className="rounded-lg border p-4 bg-card">
          <KarsilastirmaGrafik data={withPrices} />
        </div>
      </section>

      {/* Operators without prices */}
      {withoutPrices.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">
            Fiyat Bilgisi Henuz Mevcut Degil ({withoutPrices.length} operator)
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Bu operatorlerin fiyatlari henuz resmi sitelerinden cekilemedi.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {withoutPrices.map((op, i) => (
              <a
                key={op.id}
                href={`/operatorler/${op.slug}`}
                className="rounded-lg border p-3 hover:bg-muted/30 transition-colors text-sm"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    <span className="text-muted-foreground">{i + 1}.</span> {op.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{op.description}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4 bg-card">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}
