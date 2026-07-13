import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBudget } from "@/lib/serialize";
import { newBudgetSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = newBudgetSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const existing = await prisma.budget.findUnique({ where: { categorieId: parsed.data.categorieId } });
  if (existing) {
    return NextResponse.json({ error: "Cette catégorie a déjà un budget" }, { status: 409 });
  }
  const row = await prisma.budget.create({ data: parsed.data });
  return NextResponse.json({ budget: serializeBudget(row) });
}
