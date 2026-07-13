"use client";

import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { hydrateFromServer, setupAutoSync } from "@/lib/sync";
import { computeBudgetProgress, computeTrend } from "@/lib/finance";
import type { Account, BudgetProgress, Category, Transaction } from "@/lib/types";

const EMPTY: never[] = [];

export function useAppData() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hydrateFromServer().finally(() => {
      if (!cancelled) setReady(true);
    });
    const teardown = setupAutoSync();
    return () => {
      cancelled = true;
      teardown();
    };
  }, []);

  const rawAccounts = useLiveQuery(() => db.accounts.toArray(), [], EMPTY);
  const categories = (useLiveQuery(() => db.categories.toArray(), [], EMPTY) as Category[]) ?? EMPTY;
  const rawBudgets = useLiveQuery(() => db.budgets.toArray(), [], EMPTY);
  const transactions = (useLiveQuery(() => db.transactions.orderBy("date").reverse().toArray(), [], EMPTY) ?? EMPTY) as Transaction[];
  const settings = useLiveQuery(() => db.settings.get(1), []);

  const accounts: Account[] = useMemo(() => {
    return (rawAccounts ?? EMPTY).map((a) => ({
      ...a,
      solde:
        a.soldeInitial +
        transactions.reduce((sum, t) => {
          if (t.compteId === a.id) return sum + (t.type === "revenu" ? t.montant : -t.montant);
          if (t.compteDestinationId === a.id && t.type === "transfert") return sum + t.montant;
          return sum;
        }, 0),
    }));
  }, [rawAccounts, transactions]);

  const budgets: BudgetProgress[] = useMemo(
    () => computeBudgetProgress(rawBudgets ?? EMPTY, transactions),
    [rawBudgets, transactions]
  );

  const trend = useMemo(() => computeTrend(rawAccounts ?? EMPTY, transactions), [rawAccounts, transactions]);

  return { ready, accounts, categories, budgets, transactions, settings, trend };
}

export type AppData = ReturnType<typeof useAppData>;
