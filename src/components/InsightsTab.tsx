"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Sparkles, TrendingUp, X } from "lucide-react";
import { colors } from "@/lib/theme";
import { computeLocalAnomalies, computeLocalForecast, computeLocalSummary } from "@/lib/finance";
import type { Account, BudgetProgress, Category, Insights, Transaction } from "@/lib/types";

export function InsightsTab({
  accounts,
  categories,
  budgets,
  transactions,
}: {
  accounts: Account[];
  categories: Category[];
  budgets: BudgetProgress[];
  transactions: Transaction[];
}) {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loadedKey, setLoadedKey] = useState(-1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [dismissedCards, setDismissedCards] = useState<Set<"resume" | "anomalies" | "previsions">>(new Set());
  const loading = loadedKey !== refreshKey;

  const localFallback = (): Insights => ({
    resume: computeLocalSummary(categories, budgets, transactions),
    anomalies: computeLocalAnomalies(categories, budgets, transactions),
    prevision: computeLocalForecast(accounts, budgets, transactions),
    source: "local",
    generatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/insights${refreshKey > 0 ? "?force=1" : ""}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Insights) => {
        if (cancelled) return;
        setInsights(data);
        setLoadedKey(refreshKey);
      })
      .catch(() => {
        if (cancelled) return;
        setInsights(localFallback());
        setLoadedKey(refreshKey);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const data = insights ?? localFallback();
  const visibleAnomalies = data.anomalies.filter((an) => !dismissed.has(an.title));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary }}>Insights</div>
        <div
          onClick={() => {
            setDismissed(new Set());
            setDismissedCards(new Set());
            setRefreshKey((k) => k + 1);
          }}
          style={{ fontSize: 12, color: colors.accentGreen, cursor: "pointer", fontWeight: 600 }}
        >
          {loading ? "…" : "Régénérer"}
        </div>
      </div>

      {!dismissedCards.has("resume") && (
        <div style={{ background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: 20, padding: 18, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={15} color={colors.accentGold} />
              <div style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary }}>Résumé du mois — IA</div>
            </div>
            <div
              onClick={() => setDismissedCards((prev) => new Set(prev).add("resume"))}
              style={{ color: colors.textFaint, cursor: "pointer", padding: 2 }}
            >
              <X size={14} />
            </div>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: colors.textSecondary }}>{data.resume}</div>
        </div>
      )}

      {!dismissedCards.has("anomalies") && (
        <div style={{ background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: 20, padding: 18, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={15} color={colors.accentRed} />
              <div style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary }}>Anomalies détectées</div>
            </div>
            <div
              onClick={() => setDismissedCards((prev) => new Set(prev).add("anomalies"))}
              style={{ color: colors.textFaint, cursor: "pointer", padding: 2 }}
            >
              <X size={14} />
            </div>
          </div>
          {visibleAnomalies.length === 0 ? (
            <div style={{ fontSize: 12.5, color: colors.textFaint }}>Aucune anomalie détectée ce mois-ci.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {visibleAnomalies.map((an, i) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <div style={{ width: 4, borderRadius: 2, background: colors.accentRed, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: colors.textSecondary, fontWeight: 600, marginBottom: 2 }}>{an.title}</div>
                    <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.5 }}>{an.detail}</div>
                  </div>
                  <div
                    onClick={() => setDismissed((prev) => new Set(prev).add(an.title))}
                    style={{ color: colors.textFaint, cursor: "pointer", flexShrink: 0, padding: 2 }}
                  >
                    <X size={14} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!dismissedCards.has("previsions") && (
        <div style={{ background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: 20, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={15} color={colors.accentGreen} />
              <div style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary }}>Prévisions budgétaires</div>
            </div>
            <div
              onClick={() => setDismissedCards((prev) => new Set(prev).add("previsions"))}
              style={{ color: colors.textFaint, cursor: "pointer", padding: 2 }}
            >
              <X size={14} />
            </div>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: colors.textSecondary }}>{data.prevision}</div>
        </div>
      )}

      {dismissedCards.size === 3 && (
        <div style={{ fontSize: 12.5, color: colors.textFaint, textAlign: "center", padding: "24px 0" }}>
          Tout a été masqué. Appuie sur « Régénérer » pour tout retrouver.
        </div>
      )}
    </div>
  );
}
