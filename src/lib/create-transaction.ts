import { prisma } from "./prisma";
import type { NewTransactionParsed } from "./validation";
import { serializeTransaction } from "./serialize";
import type { Transaction } from "./types";

// Idempotent by clientId: replaying a queued offline write never double-applies it.
export async function upsertTransactionByClientId(input: NewTransactionParsed): Promise<Transaction> {
  const existing = await prisma.transaction.findUnique({ where: { clientId: input.clientId } });
  if (existing) return serializeTransaction(existing);

  const row = await prisma.transaction.create({
    data: {
      clientId: input.clientId,
      type: input.type,
      montant: input.montant,
      compteId: input.compteId,
      compteDestinationId: input.compteDestinationId ?? null,
      categorieId: input.type === "transfert" ? null : input.categorieId ?? null,
      libelle: input.libelle ?? null,
      date: new Date(input.date),
      synced: true,
      creeHorsLigne: input.creeHorsLigne ?? false,
    },
  });
  return serializeTransaction(row);
}
