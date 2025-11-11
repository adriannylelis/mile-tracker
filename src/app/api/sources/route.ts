import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";

const createSourceSchema = z.object({
  name: z.string().min(2),
  url: z.string().url(),
  program: z.enum(["Smiles", "TudoAzul", "LatamPass"]),
});

export async function GET() {
  try {
    const sources = await prisma.mileageSource.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(sources);
  } catch {
    return NextResponse.json({ error: "Failed to fetch sources" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSourceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const created = await prisma.mileageSource.create({ data: parsed.data });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create source" }, { status: 500 });
  }
}
