import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const program = searchParams.get("program") || undefined;
    const limit = Number(searchParams.get("limit") || 30);

    const prices = await prisma.mileagePrice.findMany({
      where: program ? { source: { program } } : undefined,
      take: Number.isFinite(limit) && limit > 0 ? limit : 30,
      orderBy: { capturedAt: "desc" },
      include: { source: true },
    });

    return NextResponse.json(prices);
  } catch {
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }
}
