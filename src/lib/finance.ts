import type { Account, BudgetProgress, Category, PretMouvement, Projet, ProjetContribution, Transaction, TrendPoint } from "./types";

const MONTH_LABELS_FR = [
  "Jan", "Fev", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aou", "Sep", "Oct", "Nov", "Dec",
];

export function transactionEffect(tx: Pick<Transaction, "type" | "montant" | "compteId" | "compteDestinationId">, accountId: string): number {
  if (tx.compteId === accountId) {
    return tx.type === "revenu" ? tx.montant : -tx.montant;
  }
  if (tx.compteDestinationId === accountId && tx.type === "transfert") {
    return tx.montant;
  }
  return 0;
}

export function computeBalance(soldeInitial: number, transactions: Transaction[], accountId: string): number {
  return transactions.reduce((sum, tx) => sum + transactionEffect(tx, accountId), soldeInitial);
}

export function computeBalances<T extends { id: string; soldeInitial: number }>(
  accounts: T[],
  transactions: Transaction[]
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const acc of accounts) result[acc.id] = computeBalance(acc.soldeInitial, transactions, acc.id);
  return result;
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

export function isSameMonth(dateIso: string, ref: Date): boolean {
  const d = new Date(dateIso);
  return monthKey(d) === monthKey(ref);
}

export function computeBudgetSpent(categorieId: string, transactions: Transaction[], ref: Date = new Date()): number {
  return transactions
    .filter((t) => t.type === "depense" && t.categorieId === categorieId && isSameMonth(t.date, ref))
    .reduce((s, t) => s + t.montant, 0);
}

export function computeBudgetProgress(
  budgets: { id: string; categorieId: string; montantLimite: number; seuilAlerte: number }[],
  transactions: Transaction[],
  ref: Date = new Date()
): BudgetProgress[] {
  return budgets.map((b) => ({
    ...b,
    spent: computeBudgetSpent(b.categorieId, transactions, ref),
  }));
}

// Shown when a spend has no (or an unknown) category, so it is never
// silently dropped from the breakdown while still counting in the total.
const AUTRES_FALLBACK: Category = {
  id: "autres",
  nom: "Autres",
  type: "depense",
  couleur: "oklch(0.55 0.02 70)",
  icone: null,
  keywords: [],
};

export function computeCategoryBreakdown(
  categories: Category[],
  transactions: Transaction[],
  ref: Date = new Date()
): { category: Category; total: number; pct: number; pctEntier: number }[] {
  const currentMonthDepenses = transactions.filter((t) => t.type === "depense" && isSameMonth(t.date, ref));
  const total = currentMonthDepenses.reduce((s, t) => s + t.montant, 0);
  if (!total) return [];

  const autres =
    categories.find((c) => c.type === "depense" && c.nom.trim().toLowerCase() === "autres") ?? AUTRES_FALLBACK;
  const byId = new Map<string, { category: Category; total: number }>();
  for (const t of currentMonthDepenses) {
    const category = categories.find((c) => c.id === t.categorieId) ?? autres;
    const row = byId.get(category.id) ?? { category, total: 0 };
    row.total += t.montant;
    byId.set(category.id, row);
  }

  const rows = [...byId.values()]
    .sort((a, b) => b.total - a.total)
    .map((r) => ({ ...r, pct: (r.total / total) * 100 }));

  // Largest-remainder rounding: the displayed integers always sum to 100,
  // instead of each pct being rounded independently (76+9+7+4+3+2 = 101).
  const pctEntiers = rows.map((r) => Math.floor(r.pct));
  let rest = 100 - pctEntiers.reduce((s, n) => s + n, 0);
  const byRemainder = rows
    .map((r, i) => ({ i, frac: r.pct - Math.floor(r.pct) }))
    .sort((a, b) => b.frac - a.frac);
  for (const { i } of byRemainder) {
    if (rest <= 0) break;
    pctEntiers[i] += 1;
    rest -= 1;
  }

  return rows.map((r, i) => ({ ...r, pctEntier: pctEntiers[i] }));
}

export function computeTrend(
  accounts: { id: string; soldeInitial: number }[],
  transactions: Transaction[],
  monthsBack = 6,
  ref: Date = new Date()
): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const cutoff = new Date(ref.getFullYear(), ref.getMonth() - i + 1, 0, 23, 59, 59, 999);
    const upToCutoff = transactions.filter((t) => new Date(t.date).getTime() <= cutoff.getTime());
    const balance = accounts.reduce((sum, acc) => sum + computeBalance(acc.soldeInitial, upToCutoff, acc.id), 0);
    points.push({ label: MONTH_LABELS_FR[cutoff.getMonth()], balance });
  }
  return points;
}

export function suggestCategoryLocal(label: string, categories: Category[]): string | null {
  const l = (label || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (!l) return null;
  for (const cat of categories) {
    if (cat.keywords.some((k) => l.includes(k))) return cat.id;
  }
  const fallback = categories.find((c) => c.id === "autres");
  return fallback ? fallback.id : null;
}

export function accountBalance(account: Account): number {
  return account.solde;
}

export interface ReleveMensuel {
  soldeOuverture: number;
  entrees: number;
  sorties: number;
  soldeCloture: number;
  transactions: Transaction[];
}

// Monthly account statement: opening balance (everything before the 1st),
// the month's in/out flows on that account, and the closing balance.
export function computeReleve(
  account: { id: string; soldeInitial: number },
  transactions: Transaction[],
  year: number,
  month: number
): ReleveMensuel {
  const start = new Date(year, month, 1).getTime();
  const end = new Date(year, month + 1, 1).getTime();
  const before = transactions.filter((t) => new Date(t.date).getTime() < start);
  const during = transactions.filter((t) => {
    const ts = new Date(t.date).getTime();
    return ts >= start && ts < end;
  });
  const soldeOuverture = computeBalance(account.soldeInitial, before, account.id);
  let entrees = 0;
  let sorties = 0;
  const monthTx: Transaction[] = [];
  for (const t of during) {
    const effect = transactionEffect(t, account.id);
    if (effect === 0) continue;
    if (effect > 0) entrees += effect;
    else sorties += -effect;
    monthTx.push(t);
  }
  return { soldeOuverture, entrees, sorties, soldeCloture: soldeOuverture + entrees - sorties, transactions: monthTx };
}

export function computeProjetEpargne(projetId: string, contributions: ProjetContribution[]): number {
  return contributions.reduce((sum, c) => {
    if (c.projetId !== projetId) return sum;
    return sum + (c.sens === "verse" ? c.montant : -c.montant);
  }, 0);
}

export interface ProjetProgress {
  projet: Projet;
  epargne: number;
  reste: number;
  pct: number;
  moisRestants: number | null; // null when no target date
  mensualiteRequise: number | null; // amount to save per month to hit the date
}

export function computeProjetProgress(
  projet: Projet,
  contributions: ProjetContribution[],
  ref: Date = new Date()
): ProjetProgress {
  const epargne = computeProjetEpargne(projet.id, contributions);
  const reste = Math.max(0, projet.montantCible - epargne);
  const pct = projet.montantCible ? Math.min(100, (epargne / projet.montantCible) * 100) : 0;
  let moisRestants: number | null = null;
  let mensualiteRequise: number | null = null;
  if (projet.dateCible) {
    const cible = new Date(projet.dateCible);
    const months =
      (cible.getFullYear() - ref.getFullYear()) * 12 + (cible.getMonth() - ref.getMonth());
    moisRestants = Math.max(0, months);
    mensualiteRequise = reste > 0 ? reste / Math.max(1, moisRestants) : 0;
  }
  return { projet, epargne, reste, pct, moisRestants, mensualiteRequise };
}

export function totalReserveProjets(projets: Projet[], contributions: ProjetContribution[]): number {
  return projets
    .filter((p) => p.actif)
    .reduce((sum, p) => sum + Math.max(0, computeProjetEpargne(p.id, contributions)), 0);
}

// Positive = the friend owes me, negative = I owe the friend.
export function computeAmiBalance(amiId: string, prets: PretMouvement[]): number {
  return prets.reduce((sum, p) => {
    if (p.amiId !== amiId) return sum;
    return sum + (p.direction === "donne" ? p.montant : -p.montant);
  }, 0);
}

function fmtMRU(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " MRU";
}

export function computeLocalSummary(
  categories: Category[],
  budgets: BudgetProgress[],
  transactions: Transaction[],
  ref: Date = new Date()
): string {
  const monthDepenses = transactions.filter((t) => t.type === "depense" && isSameMonth(t.date, ref));
  const total = monthDepenses.reduce((s, t) => s + t.montant, 0);
  const over = budgets.filter((b) => b.montantLimite && b.spent / b.montantLimite >= 1);
  const near = budgets.filter((b) => b.montantLimite && b.spent / b.montantLimite >= 0.8 && b.spent / b.montantLimite < 1);
  const catName = (id: string) => categories.find((c) => c.id === id)?.nom ?? id;
  const parts = [`Ce mois-ci, vos dépenses s'élèvent à ${fmtMRU(total)}.`];
  if (over.length) parts.push(`Le budget ${over.map((b) => catName(b.categorieId)).join(", ")} est dépassé.`);
  if (near.length) parts.push(`${near.map((b) => catName(b.categorieId)).join(", ")} approche du plafond mensuel.`);
  if (!over.length && !near.length) parts.push("Tous les budgets sont sous contrôle pour l'instant.");
  return parts.join(" ");
}

export function computeLocalAnomalies(
  categories: Category[],
  budgets: BudgetProgress[],
  transactions: Transaction[],
  ref: Date = new Date()
): { title: string; detail: string }[] {
  const anomalies: { title: string; detail: string }[] = [];
  const catName = (id: string) => categories.find((c) => c.id === id)?.nom ?? id;
  for (const b of budgets) {
    if (b.montantLimite && b.spent > b.montantLimite) {
      anomalies.push({
        title: `${catName(b.categorieId)} dépasse le budget`,
        detail: `La dépense ${catName(b.categorieId)} de ${fmtMRU(b.spent)} dépasse le plafond mensuel de ${fmtMRU(b.montantLimite)}.`,
      });
    }
  }
  const monthDepenses = transactions.filter((t) => t.type === "depense" && isSameMonth(t.date, ref));
  const byCat = new Map<string, number[]>();
  for (const t of monthDepenses) {
    const key = t.categorieId ?? "autres";
    byCat.set(key, [...(byCat.get(key) ?? []), t.montant]);
  }
  for (const [catId, amounts] of byCat) {
    if (amounts.length < 2) continue;
    const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const max = Math.max(...amounts);
    if (max > avg * 2 && max > 2000) {
      anomalies.push({
        title: `Dépense ${catName(catId)} au-dessus de la moyenne`,
        detail: `Une dépense de ${fmtMRU(max)} est ${(max / avg).toFixed(1)}x supérieure à vos dépenses ${catName(catId)} habituelles.`,
      });
    }
  }
  return anomalies.slice(0, 4);
}

export function computeLocalForecast(
  accounts: { id: string; soldeInitial: number }[],
  budgets: BudgetProgress[],
  transactions: Transaction[],
  ref: Date = new Date()
): string {
  const dayOfMonth = ref.getDate();
  const daysInMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
  const globalBalance = accounts.reduce((s, acc) => s + computeBalance(acc.soldeInitial, transactions, acc.id), 0);
  const monthDepenses = transactions
    .filter((t) => t.type === "depense" && isSameMonth(t.date, ref))
    .reduce((s, t) => s + t.montant, 0);
  const dailyRate = dayOfMonth > 0 ? monthDepenses / dayOfMonth : 0;
  const projectedRemaining = dailyRate * (daysInMonth - dayOfMonth);
  const projectedBalance = globalBalance - projectedRemaining;
  const overBudgets = budgets.filter((b) => b.montantLimite && b.spent / b.montantLimite >= 0.8);
  const advice = overBudgets.length
    ? `Réduire les dépenses restantes sur ${overBudgets.length > 1 ? "ces catégories" : "cette catégorie"} proche(s) du plafond permettrait de préserver votre solde.`
    : "Votre rythme de dépenses actuel est soutenable pour le reste du mois.";
  return `Au rythme actuel, vous devriez terminer le mois avec un solde global proche de ${fmtMRU(projectedBalance)}. ${advice}`;
}
