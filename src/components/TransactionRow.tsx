"use client";

import { Camera } from "lucide-react";
import type { Account, Category, Transaction } from "@/lib/types";
import { colors, glow } from "@/lib/theme";
import { presentTx } from "@/lib/present";

export function TransactionRow({
  tx,
  categories,
  accounts,
  isLast,
  onSelect,
}: {
  tx: Transaction;
  categories: Category[];
  accounts: Account[];
  isLast: boolean;
  onSelect?: (tx: Transaction) => void;
}) {
  const row = presentTx(tx, categories, accounts);
  return (
    <div
      onClick={onSelect ? () => onSelect(tx) : undefined}
      className={onSelect ? "tap" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 16px",
        borderBottom: isLast ? undefined : `1px solid ${colors.white5}`,
        cursor: onSelect ? "pointer" : undefined,
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
          boxShadow: glow(row.catColor, 0.35),
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
        <div style={{ fontSize: 11.5, color: colors.textFaint, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.subtitle}</span>
          {tx.justificatif && <Camera size={11} style={{ flexShrink: 0 }} />}
          {tx.tags.length > 0 && (
            <span style={{ display: "flex", gap: 4, flexShrink: 0 }}>
              {tx.tags.slice(0, 2).map((t) => (
                <span key={t} style={{ background: colors.white8, borderRadius: 100, padding: "1px 6px", fontSize: 10 }}>
                  {t}
                </span>
              ))}
            </span>
          )}
        </div>
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
  onSelect,
}: {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onSelect?: (tx: Transaction) => void;
}) {
  return (
    <div className="glass" style={{ borderRadius: 22, overflow: "hidden" }}>
      {transactions.length === 0 && (
        <div style={{ padding: "20px 16px", fontSize: 12.5, color: colors.textFaint, textAlign: "center" }}>Aucune transaction</div>
      )}
      {transactions.map((tx, i) => (
        <TransactionRow
          key={tx.clientId ?? tx.id}
          tx={tx}
          categories={categories}
          accounts={accounts}
          isLast={i === transactions.length - 1}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
