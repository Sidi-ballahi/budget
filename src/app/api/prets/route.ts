import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializePret } from "@/lib/serialize";
import { newPretSchema } from "@/lib/validation";
import { upsertTransactionByClientId } from "@/lib/create-transaction";
import type { Transaction } from "@/lib/types";

// Records a loan movement with a friend. When a compte is given, a real
// transaction is created too so the account balance reflects the money that
// actually moved (donne = it left the account, recu = it came in).
export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = newPretSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const ami = await prisma.ami.findUnique({ where: { id: parsed.data.amiId } });
  if (!ami) {
    return NextResponse.json({ error: "Ami introuvable" }, { status: 404 });
  }

  // Replaying the same clientId (double tap, retry) must not double-count.
  const existing = await prisma.pretMouvement.findFirst({
    where: { transaction: { clientId: parsed.data.clientId } },
  });
  if (existing) {
    return NextResponse.json({ pret: serializePret(existing), transaction: null });
  }

  let transaction: Transaction | null = null;
  if (parsed.data.compteId) {
    transaction = await upsertTransactionByClientId({
      clientId: parsed.data.clientId,
      type: parsed.data.direction === "donne" ? "depense" : "revenu",
      montant: parsed.data.montant,
      compteId: parsed.data.compteId,
      libelle: parsed.data.direction === "donne" ? `Donné à ${ami.nom}` : `Reçu de ${ami.nom}`,
      date: parsed.data.date,
    });
  }

  const row = await prisma.pretMouvement.create({
    data: {
      amiId: parsed.data.amiId,
      direction: parsed.data.direction,
      montant: parsed.data.montant,
      note: parsed.data.note ?? null,
      date: new Date(parsed.data.date),
      compteId: parsed.data.compteId ?? null,
      transactionId: transaction?.id ?? null,
    },
  });

  return NextResponse.json({ pret: serializePret(row), transaction });
}
