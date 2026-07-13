import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBudget, serializeCategory, serializeTransaction } from "@/lib/serialize";
import {
  computeBudgetProgress,
  computeLocalAnomalies,
  computeLocalForecast,
  computeLocalSummary,
} from "@/lib/finance";
import { detectAnomaliesAI, generateForecastAI, generateMonthlySummaryAI } from "@/lib/ai";
import type { Insights } from "@/lib/types";

function monthStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

async function buildStatsJson(ref: Date) {
  const [accountRows, categoryRows, budgetRows, transactionRows] = await Promise.all([
    prisma.account.findMany({ where: { actif: true } }),
    prisma.category.findMany(),
    prisma.budget.findMany(),
    prisma.transaction.findMany(),
  ]);
  const transactions = transactionRows.map(serializeTransaction);
  const categories = categoryRows.map(serializeCategory);
  const budgets = computeBudgetProgress(budgetRows.map(serializeBudget), transactions, ref);
  const accounts = accountRows.map((a) => ({ id: a.id, soldeInitial: Number(a.soldeInitial) }));

  const monthDepenses = transactions.filter(
    (t) => t.type === "depense" && new Date(t.date).getMonth() === ref.getMonth() && new Date(t.date).getFullYear() === ref.getFullYear()
  );
  const statsJson = JSON.stringify({
    mois: ref.toISOString().slice(0, 7),
    depensesDuMois: monthDepenses.map((t) => ({
      libelle: t.libelle,
      montant: t.montant,
      categorie: categories.find((c) => c.id === t.categorieId)?.nom ?? "Autres",
      date: t.date,
    })),
    budgets: budgets.map((b) => ({
      categorie: categories.find((c) => c.id === b.categorieId)?.nom ?? b.categorieId,
      plafond: b.montantLimite,
      depense: b.spent,
    })),
    jourDuMois: ref.getDate(),
    joursDansLeMois: new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate(),
  });

  return { statsJson, categories, budgets, transactions, accounts };
}

export async function GET(req: NextRequest) {
  const force = req.nextUrl.searchParams.get("force") === "1";
  const ref = new Date();
  const period = monthStart(ref);

  if (!force) {
    const [resume, anomalie, prevision] = await Promise.all([
      prisma.insight.findFirst({ where: { type: "resume_mensuel", periodeConcernee: period }, orderBy: { dateGeneration: "desc" } }),
      prisma.insight.findFirst({ where: { type: "anomalie", periodeConcernee: period }, orderBy: { dateGeneration: "desc" } }),
      prisma.insight.findFirst({ where: { type: "prevision", periodeConcernee: period }, orderBy: { dateGeneration: "desc" } }),
    ]);
    if (resume && anomalie && prevision) {
      const body: Insights = {
        resume: resume.contenu,
        anomalies: JSON.parse(anomalie.contenu),
        prevision: prevision.contenu,
        source: "ai",
        generatedAt: resume.dateGeneration.toISOString(),
      };
      return NextResponse.json(body);
    }
  }

  const { statsJson, categories, budgets, transactions, accounts } = await buildStatsJson(ref);

  const [aiSummary, aiAnomalies, aiForecast] = await Promise.all([
    generateMonthlySummaryAI(statsJson),
    detectAnomaliesAI(statsJson),
    generateForecastAI(statsJson),
  ]);

  const source: "ai" | "local" = aiSummary && aiAnomalies && aiForecast ? "ai" : "local";
  const resumeText = aiSummary ?? computeLocalSummary(categories, budgets, transactions, ref);
  const anomaliesList = aiAnomalies ?? computeLocalAnomalies(categories, budgets, transactions, ref);
  const forecastText = aiForecast ?? computeLocalForecast(accounts, budgets, transactions, ref);

  await Promise.all([
    prisma.insight.create({ data: { type: "resume_mensuel", contenu: resumeText, periodeConcernee: period } }),
    prisma.insight.create({ data: { type: "anomalie", contenu: JSON.stringify(anomaliesList), periodeConcernee: period } }),
    prisma.insight.create({ data: { type: "prevision", contenu: forecastText, periodeConcernee: period } }),
  ]);

  const body: Insights = {
    resume: resumeText,
    anomalies: anomaliesList,
    prevision: forecastText,
    source,
    generatedAt: new Date().toISOString(),
  };
  return NextResponse.json(body);
}
