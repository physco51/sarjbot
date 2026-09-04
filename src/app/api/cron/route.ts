import { NextRequest, NextResponse } from "next/server";
import { runScraping } from "@/lib/scraper";

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Akaryakıt fiyatlarını güncellemek için tetik
  let akaryakitResult: unknown = { status: "pending" };
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/akaryakit`,
      { method: "GET" }
    );
    if (res.ok) {
      akaryakitResult = await res.json();
    } else {
      akaryakitResult = { status: "error", code: res.status };
    }
  } catch (error) {
    akaryakitResult = { status: "error", message: error instanceof Error ? error.message : "Fetch failed" };
  }

  const result = await runScraping();

  return NextResponse.json({
    scraping: result,
    akaryakit: akaryakitResult,
    timestamp: new Date().toISOString(),
  });
}
