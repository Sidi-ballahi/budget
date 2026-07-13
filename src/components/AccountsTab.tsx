"use client";

import { colors } from "@/lib/theme";
import { fmtMoney } from "@/lib/present";
import { TransactionList } from "./TransactionRow";
import type { Account, Category, Transaction } from "@/lib/types";

export function AccountsTab({
  accounts,
  categories,
  transactions,
  onOpenAccount,
}: {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  onOpenAccount: (id: string) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, marginBottom: 18 }}>Comptes</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {accounts.map((acc) => (
          <div
            key={acc.id}
            onClick={() => onOpenAccount(acc.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: colors.card,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 18,
              padding: 16,
              cursor: "pointer",
            }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 12, background: acc.couleur, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: colors.textSecondary }}>{acc.nom}</div>
              <div style={{ fontSize: 12, color: colors.textFaint }}>{acc.type === "cash" ? "Espèces" : "Compte bancaire"}</div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary }}>{fmtMoney(acc.solde, false).replace("-", "")}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginBottom: 10 }}>Toutes les transactions</div>
      <TransactionList transactions={transactions} categories={categories} accounts={accounts} />
    </div>
  );
}
