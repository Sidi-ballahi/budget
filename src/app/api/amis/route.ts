import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeAmi } from "@/lib/serialize";
import { newAmiSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = newAmiSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const row = await prisma.ami.create({ data: parsed.data });
  return NextResponse.json({ ami: serializeAmi(row) });
}
