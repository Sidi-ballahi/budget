"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { colors, glassBorder, glassTint, glow } from "@/lib/theme";
import { fmtMoney, fmtNum } from "@/lib/present";
import { computeReleve } from "@/lib/finance";
import { downloadRelevePdf } from "@/lib/releve-pdf";
import { TransactionList } from "./TransactionRow";
import type { Account, Category, Transaction } from "@/lib/types";

const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export function AccountDetail({
  account,
  accounts,
  categories,
  transactions,
  onClose,
  onSelectTransaction,
}: {
  account: Account;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  onClose: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}) {
  const now = new Date();
  const [period, setPeriod] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const isCurrentMonth = period.year === now.getFullYear() && period.month === now.getMonth();

  function shiftMonth(delta: number) {
    setPeriod(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  const releve = computeReleve(account, transactions, period.year, period.month);

  const navBtn: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: colors.white8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: colors.textSecondary,
    cursor: "pointer",
    flexShrink: 0,
  };

  return (
    <div
      className="app-bg"
      style={{
        position: "absolute",
        inset: 0,
        animation: "panelInRight 0.3s cubic-bezier(0.32,0.72,0,1)",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        padding: `calc(env(safe-area-inset-top, 0px) + 24px) 18px 24px`,
        overflow: "auto",
      }}
    >
      <div
        onClick={onClose}
        className="tap"
        style={{ display: "flex", alignItems: "center", gap: 6, color: colors.accentGreen, fontSize: 14, fontWeight: 600, marginBottom: 18, cursor: "pointer" }}
      >
        ‹ Retour
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: account.couleur, boxShadow: glow(account.couleur, 0.55) }} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: colors.textPrimary }}>{account.nom}</div>
          <div style={{ fontSize: 12.5, color: colors.textFaint }}>{account.type === "cash" ? "Espèces" : "Compte bancaire"}</div>
        </div>
      </div>
      <div className="glass" style={{ background: glassTint(account.couleur, 0.22), borderColor: glassBorder(account.couleur), borderRadius: 20, padding: 18, marginBottom: 20 }}>
        <div style={{ fontSize: 12.5, color: colors.textMuted, marginBottom: 6 }}>Solde du compte</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: colors.textPrimary }}>{fmtMoney(account.solde, false, account.devise).replace("-", "")}</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>Relevé mensuel</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div onClick={() => shiftMonth(-1)} style={navBtn}>
            <ChevronLeft size={15} />
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textSecondary, minWidth: 108, textAlign: "center" }}>
            {MONTHS_FR[period.month]} {period.year}
          </div>
          <div
            onClick={() => !isCurrentMonth && shiftMonth(1)}
            style={{ ...navBtn, color: isCurrentMonth ? colors.textFaint : colors.textSecondary, cursor: isCurrentMonth ? "default" : "pointer" }}
          >
            <ChevronRight size={15} />
          </div>
        </div>
      </div>

      <div className="glass" style={{ borderRadius: 20, padding: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: colors.textMuted, padding: "6px 0" }}>
          <div>Solde d&apos;ouverture</div>
          <div style={{ color: colors.textSecondary, fontWeight: 600 }}>{fmtMoney(releve.soldeOuverture, false, account.devise)}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: colors.textMuted, padding: "6px 0" }}>
          <div>Entrées</div>
          <div style={{ color: colors.accentGreen, fontWeight: 600 }}>+{fmtNum(releve.entrees)} {account.devise}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: colors.textMuted, padding: "6px 0" }}>
          <div>Sorties</div>
          <div style={{ color: colors.accentRed, fontWeight: 600 }}>-{fmtNum(releve.sorties)} {account.devise}</div>
        </div>
        <div style={{ height: 1, background: colors.white8, margin: "8px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.textSecondary }}>Solde de clôture</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: colors.textPrimary }}>{fmtMoney(releve.soldeCloture, false, account.devise)}</div>
        </div>
        <div
          onClick={() => downloadRelevePdf(account, releve, categories, period.year, period.month)}
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            padding: 12,
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            background: colors.accentGold,
            color: colors.neutralIcon,
            boxShadow: glow(colors.accentGold, 0.4),
          }}
        >
          <Download size={15} />
          Télécharger le relevé PDF
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginBottom: 10 }}>
        Transactions de {MONTHS_FR[period.month]}
      </div>
      {releve.transactions.length ? (
        <TransactionList transactions={releve.transactions} categories={categories} accounts={accounts} onSelect={onSelectTransaction} />
      ) : (
        <div style={{ fontSize: 12.5, color: colors.textFaint }}>Aucune transaction ce mois-ci sur ce compte.</div>
      )}
    </div>
  );
}
