"use client";

import { useState } from "react";
import { Plus, Repeat, Tag, Target } from "lucide-react";
import { colors, glassBorder, glassTint, glow } from "@/lib/theme";
import { fmtNum } from "@/lib/present";
import { computeBudgetHistory, computeProjetProgress } from "@/lib/finance";
import { updateBudget } from "@/lib/sync";
import { ProjetCard } from "./ProjetCard";
import type { BudgetProgress, Category, Projet, ProjetContribution, Transaction } from "@/lib/types";

export function BudgetsTab({
  budgets,
  categories,
  projets,
  contributions,
  transactions,
  onAddBudget,
  onAddProjet,
  onOpenProjet,
}: {
  budgets: BudgetProgress[];
  categories: Category[];
  projets: Projet[];
  contributions: ProjetContribution[];
  transactions: Transaction[];
  onAddBudget: () => void;
  onAddProjet: () => void;
  onOpenProjet: (id: string) => void;
}) {
  const actifs = projets.filter((p) => p.actif);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, marginBottom: 6 }}>Budgets</div>
          <div style={{ fontSize: 12.5, color: colors.textFaint }}>Projets à financer et plafonds mensuels</div>
        </div>
        <div
          onClick={onAddBudget}
          className="tap glass"
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.textSecondary,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Plus size={16} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>Projets à financer</div>
        <div
          onClick={onAddProjet}
          className="tap"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11.5,
            fontWeight: 700,
            color: colors.accentGreen,
            cursor: "pointer",
          }}
        >
          <Target size={13} />
          Nouveau projet
        </div>
      </div>
      {actifs.length === 0 ? (
        <div style={{ fontSize: 12.5, color: colors.textFaint, marginBottom: 20 }}>
          Aucun projet. Créez un objectif (terrain, voiture…) et versez-y votre épargne petit à petit.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {actifs.map((p) => (
            <ProjetCard key={p.id} progress={computeProjetProgress(p, contributions)} onOpen={() => onOpenProjet(p.id)} />
          ))}
        </div>
      )}

      <div style={{ height: 1, background: colors.white6, margin: "4px 0 18px" }} />

      <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginBottom: 2 }}>Plafonds mensuels</div>
      <div style={{ fontSize: 11.5, color: colors.textFaint, marginBottom: 12 }}>
        Dépenses plafonnées par catégorie, remises à zéro chaque mois (ou reportées si activé)
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {budgets.map((b) => {
          const cat = categories.find((c) => c.id === b.categorieId);
          const pct = b.limiteEffective ? (b.spent / b.limiteEffective) * 100 : 0;
          const isOver = pct >= 100;
          const isAlert = pct >= 80;
          const barColor = isOver ? colors.accentRed : isAlert ? colors.accentGold : colors.accentGreen;
          const cardTint = cat?.couleur ?? barColor;
          const reliquat = b.limiteEffective - b.montantLimite;
          const expanded = expandedId === b.id;
          const history = expanded ? computeBudgetHistory(b, transactions) : [];
          const maxHistory = Math.max(1, ...history.map((h) => Math.max(h.spent, h.limite)));
          return (
            <div
              key={b.id}
              className="glass tap"
              onClick={() => setExpandedId(expanded ? null : b.id)}
              style={{ background: glassTint(cardTint, 0.2), borderColor: glassBorder(cardTint, 0.3), borderRadius: 18, padding: 16, cursor: "pointer" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Tag size={14} color={cat?.couleur ?? colors.textFaint} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.textSecondary }}>{cat?.nom ?? b.categorieId}</div>
                  {b.reporter && <Repeat size={12} color={colors.textFaint} />}
                </div>
                {isAlert && (
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: colors.accentRed,
                      background: "oklch(0.68 0.15 25 / 0.18)",
                      padding: "3px 8px",
                      borderRadius: 100,
                    }}
                  >
                    {isOver ? "DÉPASSÉ" : "ALERTE"}
                  </div>
                )}
              </div>
              <div style={{ height: 8, borderRadius: 100, background: "oklch(1 0 0 / 0.1)", overflow: "hidden", marginBottom: 8 }}>
                <div
                  style={{
                    height: "100%",
                    borderRadius: 100,
                    width: `${Math.min(100, Math.round(pct))}%`,
                    background: barColor,
                    boxShadow: glow(barColor, 0.5),
                    transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: colors.textMuted }}>
                <div>{fmtNum(b.spent)} MRU dépensés</div>
                <div>
                  plafond {fmtNum(b.limiteEffective)} MRU
                  {reliquat !== 0 && (
                    <span style={{ color: reliquat > 0 ? colors.accentGreen : colors.accentRed }}>
                      {" "}
                      ({reliquat > 0 ? "+" : ""}
                      {fmtNum(reliquat)} reporté)
                    </span>
                  )}
                </div>
              </div>

              {expanded && (
                <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${colors.white6}` }}>
                  <div
                    onClick={() => void updateBudget({ id: b.id, reporter: !b.reporter })}
                    className="tap glass"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderRadius: 12,
                      padding: "10px 12px",
                      marginBottom: 16,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 12, color: colors.textSecondary }}>Reporter le reliquat au mois suivant</div>
                    <div
                      style={{
                        width: 36,
                        height: 21,
                        borderRadius: 100,
                        flexShrink: 0,
                        background: b.reporter ? colors.accentGreen : colors.white15,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 2.5,
                          left: b.reporter ? 17 : 2.5,
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: colors.textPrimary,
                          transition: "left 0.2s cubic-bezier(0.32,0.72,0,1)",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ fontSize: 11.5, fontWeight: 700, color: colors.textMuted, marginBottom: 10 }}>6 DERNIERS MOIS</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 60 }}>
                    {history.map((h, i) => {
                      const over = h.spent > h.limite;
                      return (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                          <div
                            style={{
                              width: "100%",
                              borderRadius: "4px 4px 1px 1px",
                              background: over ? colors.accentRed : colors.white15,
                              height: `${Math.max(2, Math.round((h.spent / maxHistory) * 100))}%`,
                            }}
                          />
                          <div style={{ fontSize: 9.5, color: colors.textFaint }}>{h.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
