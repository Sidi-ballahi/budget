"use client";

import { CalendarClock } from "lucide-react";
import { colors } from "@/lib/theme";
import { fmtMoney, fmtNum, shortDate } from "@/lib/present";
import { computeCategoryBreakdown, totalReserveProjets } from "@/lib/finance";
import { TransactionList } from "./TransactionRow";
import type { Account, BudgetProgress, Category, Echeance, Projet, ProjetContribution, Transaction } from "@/lib/types";

export function DashboardTab({
  accounts,
  categories,
  budgets,
  transactions,
  echeances,
  projets,
  contributions,
  trend,
  onOpenAccount,
  onGoToBudgets,
  onGoToPlanned,
}: {
  accounts: Account[];
  categories: Category[];
  budgets: BudgetProgress[];
  transactions: Transaction[];
  echeances: Echeance[];
  projets: Projet[];
  contributions: ProjetContribution[];
  trend: { label: string; balance: number }[];
  onOpenAccount: (id: string) => void;
  onGoToBudgets: () => void;
  onGoToPlanned: () => void;
}) {
  const globalBalance = accounts.reduce((s, a) => s + a.solde, 0);
  const hasUnsynced = transactions.some((t) => !t.synced);
  const reserve = totalReserveProjets(projets, contributions);
  const disponible = globalBalance - reserve;

  const in7days = new Date();
  in7days.setDate(in7days.getDate() + 7);
  const upcoming = echeances
    .filter((e) => e.actif && new Date(e.prochaineDate).getTime() <= in7days.getTime())
    .slice(0, 4);
  const upcomingTotal = upcoming.filter((e) => e.type === "depense").reduce((s, e) => s + e.montant, 0);

  const overBudgets = budgets.filter((b) => b.montantLimite && b.spent / b.montantLimite >= 0.8);
  const alertsMsg = overBudgets.length
    ? `${overBudgets.length} catégorie${overBudgets.length > 1 ? "s" : ""} proche${
        overBudgets.length > 1 ? "s" : ""
      } ou au-delà du budget : ${overBudgets
        .map((b) => categories.find((c) => c.id === b.categorieId)?.nom ?? b.categorieId)
        .join(", ")}.`
    : "";

  const breakdown = computeCategoryBreakdown(categories, transactions);
  const totalBreakdown = breakdown.reduce((s, b) => s + b.total, 0);
  const stops = breakdown.reduce<{ list: string[]; cum: number }>(
    (acc, b) => {
      const pct = totalBreakdown ? (b.total / totalBreakdown) * 100 : 0;
      const end = acc.cum + pct;
      return { list: [...acc.list, `${b.category.couleur} ${acc.cum}% ${end}%`], cum: end };
    },
    { list: [], cum: 0 }
  ).list;
  const donutGradient = stops.length ? `conic-gradient(${stops.join(", ")})` : `conic-gradient(${colors.white5} 0% 100%)`;

  const maxTrend = Math.max(1, ...trend.map((t) => t.balance));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 13, color: colors.textMuted }}>Bonjour, Sidi</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary }}>Tableau de bord</div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: colors.card,
            borderRadius: 100,
            padding: "6px 12px",
            marginTop: 4,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: hasUnsynced ? colors.accentGold : colors.accentGreen,
            }}
          />
          <div style={{ fontSize: 11, color: colors.textMuted }}>{hasUnsynced ? "En attente" : "À jour"}</div>
        </div>
      </div>

      <div style={{ background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: 22, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 6 }}>Solde global</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: colors.textPrimary, letterSpacing: -0.5 }}>
          {fmtMoney(globalBalance, false)}
        </div>
        {reserve > 0 && (
          <div style={{ display: "flex", gap: 16, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${colors.white6}` }}>
            <div>
              <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 3 }}>Réservé projets</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.accentGold }}>{fmtNum(reserve)} MRU</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 3 }}>Disponible</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.accentGreen }}>{fmtMoney(disponible, false)}</div>
            </div>
          </div>
        )}
      </div>

      {upcoming.length > 0 && (
        <div
          onClick={onGoToPlanned}
          style={{
            background: colors.card,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 16,
            padding: "12px 14px",
            marginBottom: 16,
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <CalendarClock size={14} color={colors.accentGold} />
            <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textSecondary, flex: 1 }}>À venir (7 jours)</div>
            {upcomingTotal > 0 && (
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.accentGold }}>-{fmtNum(upcomingTotal)} MRU</div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {upcoming.map((e) => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: colors.textMuted }}>
                <div>
                  {e.nom} · {shortDate(e.prochaineDate)}
                </div>
                <div style={{ color: e.type === "revenu" ? colors.accentGreen : colors.textSecondary }}>
                  {e.type === "revenu" ? "+" : "-"}{fmtNum(e.montant)} MRU
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {alertsMsg && (
        <div
          onClick={onGoToBudgets}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "oklch(0.68 0.15 25 / 0.14)",
            border: "1px solid oklch(0.68 0.15 25 / 0.35)",
            borderRadius: 16,
            padding: "12px 14px",
            marginBottom: 16,
            cursor: "pointer",
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors.accentRed, flexShrink: 0 }} />
          <div style={{ fontSize: 12.5, color: "oklch(0.9 0.02 40)", lineHeight: 1.4 }}>{alertsMsg}</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, overflowX: "auto", margin: "0 -18px", padding: "0 18px 4px 18px", marginBottom: 18 }}>
        {accounts.map((acc) => (
          <div
            key={acc.id}
            onClick={() => onOpenAccount(acc.id)}
            className="tap"
            style={{
              flex: "0 0 128px",
              background: colors.card,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              padding: 14,
              cursor: "pointer",
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 3, background: acc.couleur, marginBottom: 20 }} />
            <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>{acc.nom}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary }}>{fmtMoney(acc.solde, false).replace("-", "")}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginBottom: 10 }}>Répartition des dépenses</div>
      <div style={{ background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: 22, padding: 20, marginBottom: 18, display: "flex", gap: 20, alignItems: "center" }}>
        <div style={{ width: 104, height: 104, borderRadius: "50%", flexShrink: 0, background: donutGradient, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: 14,
              borderRadius: "50%",
              background: colors.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              color: colors.textMuted,
              textAlign: "center",
            }}
          >
            Ce mois
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          {breakdown.length === 0 && <div style={{ fontSize: 12, color: colors.textFaint }}>Aucune dépense ce mois-ci</div>}
          {breakdown.map((b) => (
            <div key={b.category.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: b.category.couleur, flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: colors.textSecondary, flex: 1 }}>{b.category.nom}</div>
              <div style={{ fontSize: 12, color: colors.textMuted }}>{b.pctEntier}%</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginBottom: 10 }}>Évolution du solde</div>
      <div style={{ background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: 22, padding: "20px 16px", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 80 }}>
          {trend.map((bar, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
              <div
                style={{
                  width: "100%",
                  borderRadius: "6px 6px 2px 2px",
                  background: i === trend.length - 1 ? colors.accentGreen : colors.white15,
                  height: `${Math.max(2, Math.round((bar.balance / maxTrend) * 100))}%`,
                }}
              />
              <div style={{ fontSize: 10, color: colors.textFaint }}>{bar.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>Transactions récentes</div>
      </div>
      <TransactionList transactions={transactions.slice(0, 5)} categories={categories} accounts={accounts} />
    </div>
  );
}
