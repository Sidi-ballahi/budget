import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeContribution, serializeProjet } from "@/lib/serialize";
import { newContributionSchema } from "@/lib/validation";
import { computeProjetEpargne } from "@/lib/finance";

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = newContributionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const projet = await prisma.projet.findUnique({
    where: { id: parsed.data.projetId },
    include: { contributions: true },
  });
  if (!projet || !projet.actif) {
    return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  }
  if (parsed.data.sens === "retire") {
    const epargne = computeProjetEpargne(
      projet.id,
      projet.contributions.map(serializeContribution)
    );
    if (parsed.data.montant > epargne) {
      return NextResponse.json({ error: "Retrait supérieur à l'épargne du projet" }, { status: 409 });
    }
  }
  const row = await prisma.projetContribution.create({
    data: {
      projetId: parsed.data.projetId,
      sens: parsed.data.sens,
      montant: parsed.data.montant,
      note: parsed.data.note ?? null,
      date: new Date(parsed.data.date),
    },
  });
  return NextResponse.json({ contribution: serializeContribution(row), projet: serializeProjet(projet) });
}
