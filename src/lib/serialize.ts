import type { Account as PAccount, Category as PCategory, Transaction as PTransaction, Budget as PBudget } from "@/generated/prisma/client";
import type { Account, Category, Transaction, BudgetProgress } from "./types";
import { computeBalance } from "./finance";

function dec(x: { toNumber: () => number } | number): number {
  return typeof x === "number" ? x : x.toNumber();
}

export function serializeAccount(row: PAccount, allTransactions: Transaction[]): Account {
  const soldeInitial = dec(row.soldeInitial);
  return {
    id: row.id,
    nom: row.nom,
    type: row.type,
    couleur: row.couleur,
    devise: row.devise,
    actif: row.actif,
    soldeInitial,
    solde: computeBalance(soldeInitial, allTransactions, row.id),
  };
}

export function serializeCategory(row: PCategory): Category {
  return {
    id: row.id,
    nom: row.nom,
    type: row.type,
    couleur: row.couleur,
    icone: row.icone,
    keywords: row.keywords,
  };
}

export function serializeTransaction(row: PTransaction): Transaction {
  return {
    id: row.id,
    compteId: row.compteId,
    compteDestinationId: row.compteDestinationId,
    type: row.type,
    montant: dec(row.montant),
    categorieId: row.categorieId,
    libelle: row.libelle,
    date: row.date.toISOString(),
    synced: row.synced,
    creeHorsLigne: row.creeHorsLigne,
    clientId: row.clientId,
  };
}

export function serializeBudget(row: PBudget): Omit<BudgetProgress, "spent"> {
  return {
    id: row.id,
    categorieId: row.categorieId,
    montantLimite: dec(row.montantLimite),
    seuilAlerte: row.seuilAlerte,
  };
}
