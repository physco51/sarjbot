import { getAllOperatorsWithPrices } from "@/lib/db/queries";
import { Dashboard } from "@/components/dashboard";
import { SonGuncelleme } from "@/components/son-guncelleme";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getAllOperatorsWithPrices();

  const withPrices = data.filter(
    (op) => op.prices.AC || op.prices.DC || op.prices.HPC
  );
  const withoutPrices = data.filter(
    (op) => !op.prices.AC && !op.prices.DC && !op.prices.HPC
  );

  // Stats
  const acOps = withPrices.filter((d) => d.prices.AC);
  const dcOps = withPrices.filter((d) => d.prices.DC);
  const hpcOps = withPrices.filter((d) => d.prices.HPC);
  const cheapestAC = acOps.length
    ? acOps.reduce((a, b) => (a.prices.AC!.min < b.prices.AC!.min ? a : b))
    : null;
  const cheapestDC = dcOps.length
    ? dcOps.reduce((a, b) => (a.prices.DC!.min < b.prices.DC!.min ? a : b))
    : null;
  const cheapestHPC = hpcOps.length
    ? hpcOps.reduce((a, b) => (a.prices.HPC!.min < b.prices.HPC!.min ? a : b))
    : null;

  const lastUpdated = withPrices.reduce<Date | null>((latest, op) => {
    if (!op.lastUpdated) return latest;
    if (!latest) return op.lastUpdated;
    return op.lastUpdated > latest ? op.lastUpdated : latest;
  }, null);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
          Turkiye <span className="text-primary">EV Sarj</span> Fiyatlari
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          {data.length} operatorun guncel fiyatlarini tek bir yerde karsilastirin.
          <span className="text-foreground font-medium"> {withPrices.length}</span> operatorun fiyati mevcut.
        </p>
        <SonGuncelleme lastUpdated={lastUpdated} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Toplam Operator" value={data.length.toString()} icon={"\u26A1"} />
        <StatCard
          label="En Ucuz AC"
          value={cheapestAC ? `${cheapestAC.prices.AC!.min.toFixed(2)} TL` : "-"}
          sub={cheapestAC?.name}
          color="emerald"
        />
        <StatCard
          label="En Ucuz DC"
          value={cheapestDC ? `${cheapestDC.prices.DC!.min.toFixed(2)} TL` : "-"}
          sub={cheapestDC?.name}
          color="sky"
        />
        <StatCard
          label="En Ucuz HPC"
          value={cheapestHPC ? `${cheapestHPC.prices.HPC!.min.toFixed(2)} TL` : "-"}
          sub={cheapestHPC?.name}
          color="violet"
        />
      </div>

      {/* Dashboard */}
      <Dashboard
        withPrices={withPrices}
        withoutPrices={withoutPrices}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: string;
  color?: string;
}) {
  const colorClasses = {
    emerald: "border-emerald-500/20 bg-emerald-500/5",
    sky: "border-sky-500/20 bg-sky-500/5",
    violet: "border-violet-500/20 bg-violet-500/5",
  }[color || ""] || "border-border/60 bg-card";

  return (
    <div className={`rounded-xl border p-4 ${colorClasses}`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
        {icon && <span>{icon}</span>}
        {label}
      </div>
      <div className="text-xl font-bold mt-1.5 tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</div>}
    </div>
  );
}
