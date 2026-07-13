"use client";

import { colors } from "@/lib/theme";
import { fmtNum } from "@/lib/present";
import type { BudgetProgress, Category } from "@/lib/types";

export function BudgetsTab({ budgets, categories }: { budgets: BudgetProgress[]; categories: Category[] }) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, marginBottom: 6 }}>Budgets</div>
      <div style={{ fontSize: 12.5, color: colors.textFaint, marginBottom: 18 }}>Plafonds mensuels par catégorie</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {budgets.map((b) => {
          const cat = categories.find((c) => c.id === b.categorieId);
          const pct = b.montantLimite ? (b.spent / b.montantLimite) * 100 : 0;
          const isOver = pct >= 100;
          const isAlert = pct >= 80;
          const barColor = isOver ? colors.accentRed : isAlert ? colors.accentGold : colors.accentGreen;
          return (
            <div key={b.id} style={{ background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: 18, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 9, height: 9, borderRadius: 3, background: cat?.couleur ?? colors.textFaint }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.textSecondary }}>{cat?.nom ?? b.categorieId}</div>
                </div>
                {isAlert && (
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: colors.accentRed,
                      background: "oklch(0.68 0.15 25 / 0.15)",
                      padding: "3px 8px",
                      borderRadius: 100,
                    }}
                  >
                    {isOver ? "DÉPASSÉ" : "ALERTE"}
                  </div>
                )}
              </div>
              <div style={{ height: 8, borderRadius: 100, background: "oklch(0.3 0.01 60)", overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", borderRadius: 100, width: `${Math.min(100, Math.round(pct))}%`, background: barColor }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: colors.textMuted }}>
                <div>{fmtNum(b.spent)} MRU dépensés</div>
                <div>plafond {fmtNum(b.montantLimite)} MRU</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
