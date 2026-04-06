import { NextResponse } from "next/server";
import { runScraping } from "@/lib/scraper";

export async function POST() {
  const result = await runScraping();
  return NextResponse.json(result);
}
