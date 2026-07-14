import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  serializeAccount,
  serializeAmi,
  serializeBudget,
  serializeCategory,
  serializeContribution,
  serializeEcheance,
  serializePret,
  serializeProjet,
  serializeTransaction,
} from "@/lib/serialize";
import { computeBudgetProgress, computeTrend } from "@/lib/finance";
import type { Bootstrap } from "@/lib/types";

export async function GET() {
  const [accountRows, categoryRows, budgetRows, transactionRows, echeanceRows, amiRows, pretRows, projetRows, contributionRows, settingsRow] = await Promise.all([
    prisma.account.findMany({ where: { actif: true }, orderBy: { createdAt: "asc" } }),
    prisma.category.findMany({ orderBy: { nom: "asc" } }),
    prisma.budget.findMany(),
    prisma.transaction.findMany({ orderBy: { date: "desc" } }),
    prisma.echeance.findMany({ where: { actif: true }, orderBy: { prochaineDate: "asc" } }),
    prisma.ami.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.pretMouvement.findMany({ orderBy: { date: "desc" } }),
    prisma.projet.findMany({ where: { actif: true }, orderBy: { createdAt: "asc" } }),
    prisma.projetContribution.findMany({ orderBy: { date: "desc" } }),
    prisma.appSettings.findUnique({ where: { id: 1 } }),
  ]);

  const transactions = transactionRows.map(serializeTransaction);
  const accounts = accountRows.map((a) => serializeAccount(a, transactions));
  const categories = categoryRows.map(serializeCategory);
  const budgets = computeBudgetProgress(budgetRows.map(serializeBudget), transactions);
  const trend = computeTrend(accountRows.map((a) => ({ id: a.id, soldeInitial: Number(a.soldeInitial) })), transactions);

  const body: Bootstrap = {
    accounts,
    categories,
    budgets,
    transactions,
    echeances: echeanceRows.map(serializeEcheance),
    amis: amiRows.map(serializeAmi),
    prets: pretRows.map(serializePret),
    projets: projetRows.map(serializeProjet),
    contributions: contributionRows.map(serializeContribution),
    trend,
    settings: settingsRow
      ? {
          accentColor: settingsRow.accentColor,
          aiSuggestions: settingsRow.aiSuggestions,
          autoLockMinutes: settingsRow.autoLockMinutes,
          pinHash: settingsRow.pinHash,
          pinSalt: settingsRow.pinSalt,
        }
      : { accentColor: "oklch(0.72 0.14 150)", aiSuggestions: true, autoLockMinutes: 2, pinHash: "", pinSalt: "" },
  };

  return NextResponse.json(body);
}
