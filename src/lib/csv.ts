import type { Account, Category, Transaction } from "./types";

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function transactionsToCsv(transactions: Transaction[], categories: Category[], accounts: Account[]): string {
  const header = ["Date", "Compte", "Type", "Catégorie", "Montant", "Devise", "Libellé", "Tags"];
  const rows = transactions.map((t) => {
    const acc = accounts.find((a) => a.id === t.compteId);
    const cat = categories.find((c) => c.id === t.categorieId);
    return [
      t.date.slice(0, 10),
      acc?.nom ?? "",
      t.type,
      cat?.nom ?? "",
      String(t.montant),
      acc?.devise ?? "MRU",
      t.libelle ?? "",
      t.tags.join(", "),
    ]
      .map((v) => escapeCsv(v))
      .join(",");
  });
  return [header.join(","), ...rows].join("\n");
}

export function downloadTransactionsCsv(transactions: Transaction[], categories: Category[], accounts: Account[]): void {
  const csv = transactionsToCsv(transactions, categories, accounts);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `transactions-${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
