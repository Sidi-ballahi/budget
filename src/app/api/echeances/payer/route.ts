import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeEcheance } from "@/lib/serialize";
import { payerEcheanceSchema } from "@/lib/validation";
import { upsertTransactionByClientId } from "@/lib/create-transaction";
import { advanceDate } from "@/lib/recurrence";

// Paying an echeance = create the real transaction + advance prochaineDate.
// A one-off prevision is deactivated instead of advanced.
export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = payerEcheanceSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const echeance = await prisma.echeance.findUnique({ where: { id: parsed.data.id } });
  if (!echeance || !echeance.actif) {
    return NextResponse.json({ error: "Échéance introuvable" }, { status: 404 });
  }
  if (!echeance.compteId) {
    return NextResponse.json({ error: "Cette échéance n'a plus de compte associé" }, { status: 409 });
  }

  const transaction = await upsertTransactionByClientId({
    clientId: parsed.data.clientId,
    type: echeance.type,
    montant: Number(echeance.montant),
    compteId: echeance.compteId,
    categorieId: echeance.categorieId,
    libelle: echeance.nom,
    date: parsed.data.date,
  });

  const updated = await prisma.echeance.update({
    where: { id: echeance.id },
    data:
      echeance.recurrence === "ponctuel"
        ? { actif: false }
        : { prochaineDate: advanceDate(echeance.prochaineDate, echeance.recurrence) },
  });

  return NextResponse.json({ echeance: serializeEcheance(updated), transaction });
}
