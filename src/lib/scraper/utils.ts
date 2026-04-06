export function parseTurkishPrice(text: string): { min: number; max: number | null } | null {
  if (!text || text.trim() === "-" || text.trim().toLowerCase() === "yok") {
    return null;
  }

  // Clean the text
  const cleaned = text.replace(/[₺TLtl\s]/g, "").trim();

  // Handle range prices: "8,99 - 9,99" or "8.99 - 9.99"
  if (cleaned.includes("-")) {
    const parts = cleaned.split("-").map((s) => s.trim());
    if (parts.length === 2) {
      const min = parseFloat(parts[0].replace(",", "."));
      const max = parseFloat(parts[1].replace(",", "."));
      if (!isNaN(min) && !isNaN(max)) {
        return { min, max: max !== min ? max : null };
      }
    }
  }

  // Single price
  const value = parseFloat(cleaned.replace(",", "."));
  if (!isNaN(value) && value > 0) {
    return { min: value, max: null };
  }

  return null;
}

export function normalizeOperatorName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Map common operator name variations to our slugs
const SLUG_MAP: Record<string, string> = {
  zes: "zes",
  trugo: "trugo",
  esarj: "esarj",
  "e-sarj": "esarj",
  wat: "wat",
  "wat-mobilite": "wat",
  voltrun: "voltrun",
  "sharz-net": "sharz",
  sharz: "sharz",
  beefull: "beefull",
  astor: "astor",
  "astor-sarj": "astor",
  "rhg-enerturk": "rhg-enerturk",
  enerturk: "rhg-enerturk",
  tuncmatik: "tuncmatik",
  "tuncmatik-charge": "tuncmatik",
  sepascharge: "sepascharge",
  elaris: "elaris",
  "ev-bee": "ev-bee",
  evbee: "ev-bee",
  "oto-jet": "oto-jet",
  otojet: "oto-jet",
  porty: "porty",
  volti: "volti",
  tesla: "tesla",
  "tesla-supercharger": "tesla",
  enyakit: "enyakit",
  powersarj: "powersarj",
  "power-sarj": "powersarj",
};

export function resolveSlug(name: string): string | null {
  const normalized = normalizeOperatorName(name);
  return SLUG_MAP[normalized] ?? null;
}
