"use client";

import { Landmark, Plus, Wallet } from "lucide-react";
import { colors } from "@/lib/theme";
import { fmtMoney } from "@/lib/present";
import { TransactionList } from "./TransactionRow";
import type { Account, Category, Transaction } from "@/lib/types";

export function AccountsTab({
  accounts,
  categories,
  transactions,
  onOpenAccount,
  onAddAccount,
}: {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  onOpenAccount: (id: string) => void;
  onAddAccount: () => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary }}>Comptes</div>
        <div
          onClick={onAddAccount}
          className="tap"
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: colors.white8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.textSecondary,
            cursor: "pointer",
          }}
        >
          <Plus size={16} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {accounts.map((acc) => (
          <div
            key={acc.id}
            onClick={() => onOpenAccount(acc.id)}
            className="tap"
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
            <div style={{ width: 38, height: 38, borderRadius: 12, background: acc.couleur, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {acc.type === "cash" ? <Wallet size={17} color={colors.neutralIcon} /> : <Landmark size={17} color={colors.neutralIcon} />}
            </div>
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
