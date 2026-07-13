import type {
  Account as PAccount,
  Category as PCategory,
  Transaction as PTransaction,
  Budget as PBudget,
  Echeance as PEcheance,
  Ami as PAmi,
  PretMouvement as PPretMouvement,
} from "@/generated/prisma/client";
import type { Account, Category, Transaction, BudgetProgress, Echeance, Ami, PretMouvement } from "./types";
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

export function serializeEcheance(row: PEcheance): Echeance {
  return {
    id: row.id,
    nom: row.nom,
    type: row.type,
    montant: dec(row.montant),
    recurrence: row.recurrence,
    prochaineDate: row.prochaineDate.toISOString(),
    compteId: row.compteId,
    categorieId: row.categorieId,
    actif: row.actif,
  };
}

export function serializeAmi(row: PAmi): Ami {
  return {
    id: row.id,
    nom: row.nom,
    couleur: row.couleur,
  };
}

export function serializePret(row: PPretMouvement): PretMouvement {
  return {
    id: row.id,
    amiId: row.amiId,
    direction: row.direction,
    montant: dec(row.montant),
    note: row.note,
    date: row.date.toISOString(),
    compteId: row.compteId,
    transactionId: row.transactionId,
  };
}
