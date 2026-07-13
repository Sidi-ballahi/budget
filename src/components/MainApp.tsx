"use client";

import { useRef, useState } from "react";
import { colors } from "@/lib/theme";
import { addAccount, addAmi, addBudget, addEcheance, addPret, addTransaction, payerEcheance } from "@/lib/sync";
import { DashboardTab } from "./DashboardTab";
import { AccountsTab } from "./AccountsTab";
import { BudgetsTab } from "./BudgetsTab";
import { PlannedTab } from "./PlannedTab";
import { FriendsTab } from "./FriendsTab";
import { InsightsTab } from "./InsightsTab";
import { AccountDetail } from "./AccountDetail";
import { AmiDetail } from "./AmiDetail";
import { AddTransactionSheet } from "./AddTransactionSheet";
import { AddAccountSheet } from "./AddAccountSheet";
import { AddBudgetSheet } from "./AddBudgetSheet";
import { AddEcheanceSheet } from "./AddEcheanceSheet";
import { AddAmiSheet } from "./AddAmiSheet";
import { AddPretSheet } from "./AddPretSheet";
import { TabBar } from "./TabBar";
import { Toast } from "./Toast";
import type { AppData } from "@/hooks/useAppData";
import type { PretDirection, Tab } from "@/lib/types";

export function MainApp({ data }: { data: AppData }) {
  const { accounts, categories, budgets, transactions, echeances, amis, prets, trend } = data;
  const [tab, setTab] = useState<Tab>("dashboard");
  const [openAccountId, setOpenAccountId] = useState<string | null>(null);
  const [openAmiId, setOpenAmiId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [addBudgetOpen, setAddBudgetOpen] = useState(false);
  const [addEcheanceOpen, setAddEcheanceOpen] = useState(false);
  const [addAmiOpen, setAddAmiOpen] = useState(false);
  const [addPretDirection, setAddPretDirection] = useState<PretDirection | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const categoriesWithoutBudget = categories.filter((c) => c.type === "depense" && !budgets.some((b) => b.categorieId === c.id));

  const openAccount = accounts.find((a) => a.id === openAccountId);
  const openAmi = amis.find((a) => a.id === openAmiId);

  function selectTab(t: Tab) {
    setTab(t);
    scrollRef.current?.scrollTo({ top: 0 });
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  async function handlePay(echeanceId: string) {
    setPayingId(echeanceId);
    try {
      await payerEcheance(echeanceId);
      showToast("Transaction enregistrée");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Échec du paiement");
    } finally {
      setPayingId(null);
    }
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
          <AccountsTab
            accounts={accounts}
            categories={categories}
            transactions={transactions}
            onOpenAccount={setOpenAccountId}
            onAddAccount={() => setAddAccountOpen(true)}
          />
        )}
        {tab === "budgets" && <BudgetsTab budgets={budgets} categories={categories} onAddBudget={() => setAddBudgetOpen(true)} />}
        {tab === "planned" && (
          <PlannedTab
            echeances={echeances}
            categories={categories}
            accounts={accounts}
            onAdd={() => setAddEcheanceOpen(true)}
            onPay={(e) => handlePay(e.id)}
            payingId={payingId}
          />
        )}
        {tab === "friends" && (
          <FriendsTab amis={amis} prets={prets} onAddAmi={() => setAddAmiOpen(true)} onOpenAmi={setOpenAmiId} />
        )}
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

      {openAmi && (
        <AmiDetail
          ami={openAmi}
          prets={prets}
          accounts={accounts}
          onClose={() => setOpenAmiId(null)}
          onAddMouvement={(direction) => setAddPretDirection(direction)}
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
            showToast("Transaction ajoutée");
          }}
        />
      )}

      {addAccountOpen && (
        <AddAccountSheet
          onClose={() => setAddAccountOpen(false)}
          onConfirm={async (input) => {
            await addAccount(input);
            setAddAccountOpen(false);
            showToast("Compte créé");
          }}
        />
      )}

      {addBudgetOpen && (
        <AddBudgetSheet
          categories={categoriesWithoutBudget}
          onClose={() => setAddBudgetOpen(false)}
          onConfirm={async (input) => {
            await addBudget(input);
            setAddBudgetOpen(false);
            showToast("Budget créé");
          }}
        />
      )}

      {addEcheanceOpen && (
        <AddEcheanceSheet
          accounts={accounts}
          categories={categories}
          onClose={() => setAddEcheanceOpen(false)}
          onConfirm={async (input) => {
            await addEcheance(input);
            setAddEcheanceOpen(false);
            showToast("Échéance créée");
          }}
        />
      )}

      {addAmiOpen && (
        <AddAmiSheet
          onClose={() => setAddAmiOpen(false)}
          onConfirm={async (input) => {
            const ami = await addAmi(input);
            setAddAmiOpen(false);
            setOpenAmiId(ami.id);
            showToast("Ami ajouté");
          }}
        />
      )}

      {openAmi && addPretDirection && (
        <AddPretSheet
          ami={openAmi}
          accounts={accounts}
          initialDirection={addPretDirection}
          onClose={() => setAddPretDirection(null)}
          onConfirm={async (input) => {
            await addPret(input);
            setAddPretDirection(null);
            showToast("Mouvement enregistré");
          }}
        />
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
