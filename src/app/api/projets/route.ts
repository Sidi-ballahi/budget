import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProjet } from "@/lib/serialize";
import { newProjetSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = newProjetSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const row = await prisma.projet.create({
    data: {
      nom: parsed.data.nom,
      couleur: parsed.data.couleur,
      montantCible: parsed.data.montantCible,
      dateCible: parsed.data.dateCible ? new Date(parsed.data.dateCible) : null,
    },
  });
  return NextResponse.json({ projet: serializeProjet(row) });
}
