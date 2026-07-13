import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

// Lightweight in-app AI features (category suggestion, monthly summary,
// anomaly detection, forecast). Every function returns null on any failure
// (no API key, offline, rate limit, refusal) so callers can fall back to the
// local heuristics in src/lib/finance.ts — the app must stay fully usable
// without a working LLM call (cahier des charges 7.1, offline-first).
const MODEL = "claude-opus-4-8";

function client(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

export async function suggestCategoryAI(
  label: string,
  categories: { id: string; nom: string }[]
): Promise<string | null> {
  const c = client();
  if (!c || !label.trim()) return null;
  try {
    const ids = categories.map((cat) => cat.id) as [string, ...string[]];
    const schema = z.object({ categoryId: z.enum(ids) });
    const res = await c.messages.parse({
      model: MODEL,
      max_tokens: 200,
      output_config: { effort: "low", format: zodOutputFormat(schema) },
      system:
        "Tu catégorises des dépenses/revenus personnels pour une application de suivi financier en Mauritanie (MRU). Choisis la catégorie la plus pertinente pour le libellé donné.",
      messages: [
        {
          role: "user",
          content: `Libellé : "${label}"\nCatégories disponibles : ${categories
            .map((cat) => `${cat.id} = ${cat.nom}`)
            .join(", ")}`,
        },
      ],
    });
    return res.parsed_output?.categoryId ?? null;
  } catch {
    return null;
  }
}

export async function generateMonthlySummaryAI(statsJson: string): Promise<string | null> {
  const c = client();
  if (!c) return null;
  try {
    const res = await c.messages.create({
      model: MODEL,
      max_tokens: 500,
      output_config: { effort: "medium" },
      system:
        "Tu es l'assistant d'une application de suivi de dépenses personnelles en Mauritanie (devise MRU). Rédige un résumé mensuel concis (4-6 phrases) en français, en langage naturel, à partir des statistiques JSON fournies. Cite les montants en MRU. Pas de listes à puces, un paragraphe fluide.",
      messages: [{ role: "user", content: statsJson }],
    });
    const text = res.content.find((b) => b.type === "text");
    return text && text.type === "text" ? text.text.trim() : null;
  } catch {
    return null;
  }
}

const anomalySchema = z.object({
  anomalies: z.array(z.object({ title: z.string(), detail: z.string() })),
});

export async function detectAnomaliesAI(
  statsJson: string
): Promise<{ title: string; detail: string }[] | null> {
  const c = client();
  if (!c) return null;
  try {
    const res = await c.messages.parse({
      model: MODEL,
      max_tokens: 700,
      output_config: { effort: "medium", format: zodOutputFormat(anomalySchema) },
      system:
        "Tu détectes des dépenses inhabituelles (montant ou fréquence atypique) à partir de statistiques JSON pour une application de suivi financier personnel en Mauritanie (MRU). Réponds en français. Donne au maximum 4 anomalies réellement notables ; renvoie une liste vide s'il n'y en a pas.",
      messages: [{ role: "user", content: statsJson }],
    });
    return res.parsed_output?.anomalies ?? null;
  } catch {
    return null;
  }
}

export async function generateForecastAI(statsJson: string): Promise<string | null> {
  const c = client();
  if (!c) return null;
  try {
    const res = await c.messages.create({
      model: MODEL,
      max_tokens: 500,
      output_config: { effort: "medium" },
      system:
        "Tu es l'assistant d'une application de suivi de dépenses personnelles en Mauritanie (devise MRU). À partir des statistiques JSON du mois en cours (dépenses jusqu'ici, budgets, jours écoulés/restants), rédige une courte prévision budgétaire en français (3-5 phrases) : solde de fin de mois estimé et une recommandation concrète.",
      messages: [{ role: "user", content: statsJson }],
    });
    const text = res.content.find((b) => b.type === "text");
    return text && text.type === "text" ? text.text.trim() : null;
  } catch {
    return null;
  }
}
