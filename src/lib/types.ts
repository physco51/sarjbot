export interface Operator {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  isActive: boolean | null;
}

export interface PriceInfo {
  min: number;
  max: number | null;
  source: string | null;
  sourceUrl: string | null;
  isVerified: boolean;
}

export interface OperatorWithPrices extends Operator {
  prices: {
    AC: PriceInfo | null;
    DC: PriceInfo | null;
    HPC: PriceInfo | null;
  };
  lastUpdated: Date | null;
}

export interface ScrapeResult {
  success: boolean;
  operatorsUpdated: number;
  message: string;
}
