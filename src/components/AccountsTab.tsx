"use client";

import { useMemo, useState } from "react";
import { Landmark, Plus, Search, Wallet, X } from "lucide-react";
import { colors, glassBorder, glassTint, glow } from "@/lib/theme";
import { fmtMoney } from "@/lib/present";
import { TransactionList } from "./TransactionRow";
import type { Account, Category, Transaction, TransactionType } from "@/lib/types";

const TYPE_FILTERS: { key: TransactionType | "tous"; label: string }[] = [
  { key: "tous", label: "Tous" },
  { key: "depense", label: "Dépenses" },
  { key: "revenu", label: "Revenus" },
  { key: "transfert", label: "Transferts" },
];

export function AccountsTab({
  accounts,
  categories,
  transactions,
  onOpenAccount,
  onAddAccount,
  onSelectTransaction,
}: {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  onOpenAccount: (id: string) => void;
  onAddAccount: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "tous">("tous");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (typeFilter !== "tous" && t.type !== typeFilter) return false;
      if (categoryFilter && t.categorieId !== categoryFilter) return false;
      if (!q) return true;
      const cat = categories.find((c) => c.id === t.categorieId)?.nom ?? "";
      const acc = accounts.find((a) => a.id === t.compteId)?.nom ?? "";
      const haystack = [t.libelle ?? "", cat, acc, ...t.tags].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [transactions, query, typeFilter, categoryFilter, categories, accounts]);

  const hasActiveFilter = query.trim() !== "" || typeFilter !== "tous" || !!categoryFilter;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary }}>Comptes</div>
        <div
          onClick={onAddAccount}
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
            className="tap glass"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: glassTint(acc.couleur),
              borderColor: glassBorder(acc.couleur),
              borderRadius: 18,
              padding: 16,
              cursor: "pointer",
            }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 12, background: acc.couleur, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: glow(acc.couleur, 0.5) }}>
              {acc.type === "cash" ? <Wallet size={17} color={colors.neutralIcon} /> : <Landmark size={17} color={colors.neutralIcon} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: colors.textSecondary }}>{acc.nom}</div>
              <div style={{ fontSize: 12, color: colors.textFaint }}>{acc.type === "cash" ? "Espèces" : "Compte bancaire"}</div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary }}>{fmtMoney(acc.solde, false, acc.devise).replace("-", "")}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginBottom: 10 }}>Toutes les transactions</div>

      <div className="glass" style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 14, padding: "10px 14px", marginBottom: 10 }}>
        <Search size={15} color={colors.textFaint} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un libellé, une catégorie, un tag…"
          style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", fontSize: 13, color: colors.textSecondary, fontFamily: "inherit" }}
        />
        {query && (
          <X size={14} color={colors.textFaint} style={{ cursor: "pointer" }} onClick={() => setQuery("")} />
        )}
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 10, paddingBottom: 2 }}>
        {TYPE_FILTERS.map((f) => (
          <div
            key={f.key}
            onClick={() => setTypeFilter(f.key)}
            className="tap"
            style={{
              flex: "0 0 auto",
              padding: "6px 14px",
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              background: typeFilter === f.key ? colors.accentGreen : colors.white5,
              color: typeFilter === f.key ? colors.neutralIcon : colors.textMuted,
            }}
          >
            {f.label}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 14, paddingBottom: 2 }}>
        {categories.map((c) => {
          const active = categoryFilter === c.id;
          return (
            <div
              key={c.id}
              onClick={() => setCategoryFilter(active ? null : c.id)}
              className="tap"
              style={{
                flex: "0 0 auto",
                padding: "6px 12px",
                borderRadius: 100,
                fontSize: 11.5,
                fontWeight: 600,
                cursor: "pointer",
                background: active ? glassTint(c.couleur, 0.35) : colors.white4,
                color: active ? colors.textPrimary : colors.textFaint,
                border: `1px solid ${active ? glassBorder(c.couleur) : "transparent"}`,
              }}
            >
              {c.nom}
            </div>
          );
        })}
      </div>

      {hasActiveFilter && (
        <div style={{ fontSize: 11.5, color: colors.textFaint, marginBottom: 10 }}>
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        </div>
      )}

      <TransactionList transactions={filtered} categories={categories} accounts={accounts} onSelect={onSelectTransaction} />
    </div>
  );
}
