"use client";

import { useState } from "react";

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
        setMessage(`${data.operatorsUpdated} operatör güncellendi`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage(data.message || "Güncelleme başarısız");
      }
    } catch {
      setMessage("Bağlantı hatası");
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3">
      <div className="text-xs text-muted-foreground">
        Son güncelleme: <span className="font-medium text-foreground/70">{formatDate(lastUpdated)}</span>
      </div>
      <button
        onClick={handleUpdate}
        disabled={loading}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <>
            <span className="animate-spin">&#9696;</span> Güncelleniyor...
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Fiyatları Güncelle
          </>
        )}
      </button>
      {message && (
        <span className="text-xs text-emerald-400 font-medium">{message}</span>
      )}
    </div>
  );
}
