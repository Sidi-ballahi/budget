"use client";

import { useRef, useState } from "react";
import { colors } from "@/lib/theme";
import { addTransaction } from "@/lib/sync";
import { DashboardTab } from "./DashboardTab";
import { AccountsTab } from "./AccountsTab";
import { BudgetsTab } from "./BudgetsTab";
import { InsightsTab } from "./InsightsTab";
import { AccountDetail } from "./AccountDetail";
import { AddTransactionSheet } from "./AddTransactionSheet";
import { TabBar } from "./TabBar";
import { Toast } from "./Toast";
import type { AppData } from "@/hooks/useAppData";
import type { Tab } from "@/lib/types";

export function MainApp({ data }: { data: AppData }) {
  const { accounts, categories, budgets, transactions, trend } = data;
  const [tab, setTab] = useState<Tab>("dashboard");
  const [openAccountId, setOpenAccountId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const openAccount = accounts.find((a) => a.id === openAccountId);

  function selectTab(t: Tab) {
    setTab(t);
    scrollRef.current?.scrollTo({ top: 0 });
  }

  return (
    <div
      style={{
        height: "100%",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        background: colors.bg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: `calc(env(safe-area-inset-top, 0px) + 24px) 18px 100px` }}>
        {tab === "dashboard" && (
          <DashboardTab
            accounts={accounts}
            categories={categories}
            budgets={budgets}
            transactions={transactions}
            trend={trend}
            onOpenAccount={setOpenAccountId}
            onGoToBudgets={() => selectTab("budgets")}
          />
        )}
        {tab === "accounts" && (
          <AccountsTab accounts={accounts} categories={categories} transactions={transactions} onOpenAccount={setOpenAccountId} />
        )}
        {tab === "budgets" && <BudgetsTab budgets={budgets} categories={categories} />}
        {tab === "insights" && (
          <InsightsTab accounts={accounts} categories={categories} budgets={budgets} transactions={transactions} />
        )}
      </div>

      <TabBar tab={tab} onTab={selectTab} onAdd={() => setAddOpen(true)} />

      {openAccount && (
        <AccountDetail
          account={openAccount}
          accounts={accounts}
          categories={categories}
          transactions={transactions}
          onClose={() => setOpenAccountId(null)}
        />
      )}

      {addOpen && (
        <AddTransactionSheet
          accounts={accounts}
          categories={categories}
          onClose={() => setAddOpen(false)}
          onConfirm={(input) => {
            addTransaction(input);
            setAddOpen(false);
            setToast("Transaction ajoutée");
            window.setTimeout(() => setToast(null), 2200);
          }}
        />
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
