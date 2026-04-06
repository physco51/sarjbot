import { getOperatorBySlug } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { PriceInfo } from "@/lib/types";
import { AppLinks } from "@/components/app-store-badges";

export const dynamic = "force-dynamic";

function getPriceColor(price: number): string {
  if (price < 9) return "text-emerald-400";
  if (price < 12) return "text-amber-400";
  return "text-red-400";
}

function formatPrice(price: PriceInfo | null): string {
  if (!price) return "-";
  if (price.max && price.max !== price.min) {
    return `${price.min.toFixed(2)} - ${price.max.toFixed(2)}`;
  }
  return price.min.toFixed(2);
}

export default async function OperatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const operator = await getOperatorBySlug(slug);

  if (!operator) {
    notFound();
  }

  const hasAnyPrice = operator.prices.AC || operator.prices.DC || operator.prices.HPC;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-primary transition-colors mb-6 inline-flex items-center gap-1"
      >
        &#8592; Tum Operatorler
      </Link>

      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{operator.name}</h1>
            {operator.description && (
              <p className="text-muted-foreground mt-1">{operator.description}</p>
            )}
          </div>
          <span className={`shrink-0 px-3 py-1 rounded-lg text-xs font-semibold ${
            operator.isActive
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}>
            {operator.isActive ? "Aktif" : "Pasif"}
          </span>
        </div>
        {operator.websiteUrl && (
          <a
            href={operator.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1"
          >
            {new URL(operator.websiteUrl).hostname} &#8599;
          </a>
        )}

        {/* App Store Links */}
        {(operator.playStoreUrl || operator.appStoreUrl) && (
          <div className="mt-3">
            <AppLinks playStoreUrl={operator.playStoreUrl} appStoreUrl={operator.appStoreUrl} />
          </div>
        )}
      </div>

      {/* Price Cards */}
      {hasAnyPrice ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {(["AC", "DC", "HPC"] as const).map((type) => {
            const price = operator.prices[type];
            const config = {
              AC: { title: "AC Sarj", desc: "22 kW - Yavas sarj", icon: "\u26A1", border: "border-emerald-500/30", bg: "bg-emerald-500/5" },
              DC: { title: "DC Hizli", desc: "180 kW'a kadar", icon: "\u26A1\u26A1", border: "border-sky-500/30", bg: "bg-sky-500/5" },
              HPC: { title: "HPC Ultra Hizli", desc: "180 kW uzeri", icon: "\u26A1\u26A1\u26A1", border: "border-violet-500/30", bg: "bg-violet-500/5" },
            }[type];

            return (
              <div key={type} className={`rounded-xl border ${config.border} ${config.bg} p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-muted-foreground">{config.icon} {config.title}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 border border-border/40">{type}</span>
                </div>
                {price ? (
                  <>
                    <div className={`text-3xl font-extrabold tabular-nums ${getPriceColor(price.min)}`}>
                      {formatPrice(price)}
                      <span className="text-sm font-normal text-muted-foreground ml-1">TL/kWh</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      {price.isVerified ? (
                        <span className="text-emerald-400">&#10003; Dogrulanmis</span>
                      ) : (
                        <span className="text-amber-400">&#9888; Dogrulanmamis</span>
                      )}
                      {price.source && (
                        <>
                          <span className="text-muted-foreground/30">|</span>
                          {price.sourceUrl ? (
                            <a href={price.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                              {price.source} &#8599;
                            </a>
                          ) : (
                            <span>{price.source}</span>
                          )}
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-xl text-muted-foreground/30 font-bold">-</div>
                )}
                <p className="text-[11px] text-muted-foreground/50 mt-2">{config.desc}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-card p-8 text-center mb-8">
          <div className="text-3xl mb-2">&#128269;</div>
          <p className="text-muted-foreground">Bu operatorun fiyat bilgisi henuz mevcut degil.</p>
          <p className="text-xs text-muted-foreground/50 mt-1">Resmi sitesi uzerinden guncellenmeye calisilmaktadir.</p>
        </div>
      )}

      {/* Info Table */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">Operator Bilgileri</h2>
        <div className="space-y-3 text-sm">
          <InfoRow label="Operator" value={operator.name} />
          {operator.websiteUrl && (
            <InfoRow
              label="Web Sitesi"
              value={
                <a href={operator.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Ziyaret Et &#8599;
                </a>
              }
            />
          )}
          <InfoRow label="Slug" value={<span className="font-mono text-xs text-muted-foreground">{operator.slug}</span>} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
