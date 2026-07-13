import type { Account, Category, Transaction } from "./types";
import { colors } from "./theme";

export function fmtNum(n: number): string {
  return Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function fmtMoney(n: number, showSign: boolean): string {
  const sign = n < 0 ? "-" : showSign ? "+" : "";
  return `${sign}${fmtNum(n)} MRU`;
}

export function catById(categories: Category[], id: string | null): Category {
  return (
    categories.find((c) => c.id === id) ??
    categories[categories.length - 1] ?? { id: "autres", nom: "Autres", type: "depense", couleur: colors.textFaint, icone: null, keywords: [] }
  );
}

export function accById(accounts: Account[], id: string | null): Account | undefined {
  return accounts.find((a) => a.id === id);
}

export interface TxRow {
  id: string;
  label: string;
  initial: string;
  catColor: string;
  subtitle: string;
  amountFmt: string;
  amountColor: string;
  syncColor: string;
}

export function presentTx(tx: Transaction, categories: Category[], accounts: Account[]): TxRow {
  const cat = catById(categories, tx.categorieId);
  const acc = accById(accounts, tx.compteId);
  return {
    id: tx.clientId ?? tx.id,
    label: tx.libelle || (tx.type === "revenu" ? "Revenu" : tx.type === "transfert" ? "Transfert" : "Dépense"),
    initial: tx.type === "transfert" ? "⇄" : cat.nom[0],
    catColor: tx.type === "transfert" ? "oklch(0.7 0.02 70)" : cat.couleur,
    subtitle: (acc ? acc.nom : "") + " · " + shortDate(tx.date),
    amountFmt: fmtMoney(tx.type === "transfert" ? -tx.montant : tx.type === "revenu" ? tx.montant : -tx.montant, tx.type === "revenu"),
    amountColor: tx.type === "revenu" ? colors.accentGreen : colors.textSecondary,
    syncColor: tx.synced ? colors.accentGreen : colors.accentGold,
  };
}

export function shortDate(iso: string): string {
  const d = new Date(iso);
  return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0");
}

export function todayLong(): string {
  const d = new Date();
  const months = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
