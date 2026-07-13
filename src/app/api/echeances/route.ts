import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeEcheance } from "@/lib/serialize";
import { newEcheanceSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = newEcheanceSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const row = await prisma.echeance.create({
    data: {
      nom: parsed.data.nom,
      type: parsed.data.type,
      montant: parsed.data.montant,
      recurrence: parsed.data.recurrence,
      prochaineDate: new Date(parsed.data.prochaineDate),
      compteId: parsed.data.compteId,
      categorieId: parsed.data.categorieId ?? null,
    },
  });
  return NextResponse.json({ echeance: serializeEcheance(row) });
}
