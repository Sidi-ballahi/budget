"use client";

import { colors } from "@/lib/theme";
import { fmtMoney } from "@/lib/present";
import { TransactionList } from "./TransactionRow";
import type { Account, Category, Transaction } from "@/lib/types";

export function AccountDetail({
  account,
  accounts,
  categories,
  transactions,
  onClose,
}: {
  account: Account;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  onClose: () => void;
}) {
  const accountTx = transactions.filter((t) => t.compteId === account.id || t.compteDestinationId === account.id);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: colors.bg,
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
        style={{ display: "flex", alignItems: "center", gap: 6, color: colors.accentGreen, fontSize: 14, fontWeight: 600, marginBottom: 18, cursor: "pointer" }}
      >
        ‹ Retour
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: account.couleur }} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: colors.textPrimary }}>{account.nom}</div>
          <div style={{ fontSize: 12.5, color: colors.textFaint }}>{account.type === "cash" ? "Espèces" : "Compte bancaire"}</div>
        </div>
      </div>
      <div style={{ background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: 20, padding: 18, marginBottom: 20 }}>
        <div style={{ fontSize: 12.5, color: colors.textMuted, marginBottom: 6 }}>Solde du compte</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: colors.textPrimary }}>{fmtMoney(account.solde, false).replace("-", "")}</div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginBottom: 10 }}>Historique</div>
      {accountTx.length ? (
        <TransactionList transactions={accountTx} categories={categories} accounts={accounts} />
      ) : (
        <div style={{ fontSize: 12.5, color: colors.textFaint }}>Aucune transaction sur ce compte.</div>
      )}
    </div>
  );
}
