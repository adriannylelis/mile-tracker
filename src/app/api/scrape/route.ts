import { NextResponse } from "next/server";
import { runAllScrapers } from "@/lib/scrapers";

export async function POST() {
  try {
    const created = await runAllScrapers();
    return NextResponse.json({ inserted: created.length });
  } catch {
    return NextResponse.json({ error: "Failed to run scrapers" }, { status: 500 });
  }
}
