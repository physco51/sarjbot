import { getOperatorBySlug } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

function formatPrice(price: { min: number; max: number | null } | null): string {
  if (!price) return "Mevcut degil";
  if (price.max && price.max !== price.min) {
    return `${price.min.toFixed(2)} - ${price.max.toFixed(2)} TL/kWh`;
  }
  return `${price.min.toFixed(2)} TL/kWh`;
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

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block"
      >
        ← Tum Operatorler
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{operator.name}</h1>
          {operator.description && (
            <p className="text-muted-foreground">{operator.description}</p>
          )}
          {operator.websiteUrl && (
            <a
              href={operator.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              {operator.websiteUrl}
            </a>
          )}
        </div>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {(["AC", "DC", "HPC"] as const).map((type) => {
          const price = operator.prices[type];
          const labels = {
            AC: { title: "AC Sarj", desc: "22 kW - Yavas sarj", color: "bg-green-500/15 border-green-500/30" },
            DC: { title: "DC Hizli Sarj", desc: "180 kW'a kadar", color: "bg-blue-500/15 border-blue-500/30" },
            HPC: { title: "HPC Ultra Hizli", desc: "180 kW uzeri", color: "bg-amber-500/15 border-amber-500/30" },
          };
          const label = labels[type];

          return (
            <div key={type} className={`rounded-xl border p-6 ${label.color}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{label.title}</h3>
                <Badge variant="outline">{type}</Badge>
              </div>
              <p className="text-2xl font-bold font-mono mb-1">
                {formatPrice(price)}
              </p>
              <p className="text-sm text-muted-foreground">{label.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="rounded-lg border p-6 bg-card">
        <h2 className="text-lg font-semibold mb-4">Bilgi</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Operator</span>
            <span className="font-medium">{operator.name}</span>
          </div>
          {operator.websiteUrl && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Web Sitesi</span>
              <a
                href={operator.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Ziyaret Et
              </a>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Durum</span>
            <Badge variant={operator.isActive ? "default" : "secondary"}>
              {operator.isActive ? "Aktif" : "Pasif"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
