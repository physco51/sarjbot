"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SonGuncelleme({ lastUpdated }: { lastUpdated: Date | null }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdate = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/guncelle", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setMessage(`${data.operatorsUpdated} operator guncellendi`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage(data.message || "Guncelleme basarisiz");
      }
    } catch {
      setMessage("Baglanti hatasi");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Bilinmiyor";
    return new Date(date).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="text-sm text-muted-foreground">
        Son guncelleme: <span className="font-medium">{formatDate(lastUpdated)}</span>
      </div>
      <Button onClick={handleUpdate} disabled={loading} size="sm" variant="outline">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">&#9696;</span> Guncelleniyor...
          </span>
        ) : (
          "Fiyatlari Guncelle"
        )}
      </Button>
      {message && (
        <span className="text-sm text-green-600 dark:text-green-400">{message}</span>
      )}
    </div>
  );
}
