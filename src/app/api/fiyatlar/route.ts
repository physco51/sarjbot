import { NextResponse } from "next/server";
import { getAllOperatorsWithPrices } from "@/lib/db/queries";

export async function GET() {
  const data = await getAllOperatorsWithPrices();
  return NextResponse.json(data);
}
