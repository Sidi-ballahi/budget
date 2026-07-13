"use client";

import type { Account, Category, Transaction } from "@/lib/types";
import { colors } from "@/lib/theme";
import { presentTx } from "@/lib/present";

export function TransactionRow({
  tx,
  categories,
  accounts,
  isLast,
}: {
  tx: Transaction;
  categories: Category[];
  accounts: Account[];
  isLast: boolean;
}) {
  const row = presentTx(tx, categories, accounts);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 16px",
        borderBottom: isLast ? undefined : `1px solid ${colors.white5}`,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 11,
          background: row.catColor,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          color: colors.neutralIcon,
        }}
      >
        {row.initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            color: colors.textSecondary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {row.label}
        </div>
        <div style={{ fontSize: 11.5, color: colors.textFaint }}>{row.subtitle}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: row.amountColor }}>{row.amountFmt}</div>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: row.syncColor }} />
      </div>
    </div>
  );
}

export function TransactionList({
  transactions,
  categories,
  accounts,
}: {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
}) {
  return (
    <div style={{ background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: 22, overflow: "hidden" }}>
      {transactions.map((tx, i) => (
        <TransactionRow
          key={tx.clientId ?? tx.id}
          tx={tx}
          categories={categories}
          accounts={accounts}
          isLast={i === transactions.length - 1}
        />
      ))}
    </div>
  );
}
