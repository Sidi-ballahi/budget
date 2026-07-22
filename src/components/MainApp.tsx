"use client";

import { useEffect, useRef, useState } from "react";
import { addAccount, addAmi, addBudget, addContribution, addEcheance, addPret, addProjet, addTransaction, payerEcheance } from "@/lib/sync";
import { checkAndNotify } from "@/lib/notifications";
import { DashboardTab } from "./DashboardTab";
import { AccountsTab } from "./AccountsTab";
import { BudgetsTab } from "./BudgetsTab";
import { PlannedTab } from "./PlannedTab";
import { FriendsTab } from "./FriendsTab";
import { InsightsTab } from "./InsightsTab";
import { AccountDetail } from "./AccountDetail";
import { AmiDetail } from "./AmiDetail";
import { ProjetDetail } from "./ProjetDetail";
import { AddTransactionSheet } from "./AddTransactionSheet";
import { AddAccountSheet } from "./AddAccountSheet";
import { AddBudgetSheet } from "./AddBudgetSheet";
import { AddEcheanceSheet } from "./AddEcheanceSheet";
import { AddAmiSheet } from "./AddAmiSheet";
import { AddPretSheet } from "./AddPretSheet";
import { AddProjetSheet } from "./AddProjetSheet";
import { AddContributionSheet } from "./AddContributionSheet";
import { TransactionDetailSheet } from "./TransactionDetailSheet";
import { SettingsSheet } from "./SettingsSheet";
import { TabBar } from "./TabBar";
import { Toast } from "./Toast";
import type { AppData } from "@/hooks/useAppData";
import type { ContributionSens, PretDirection, Tab, Transaction } from "@/lib/types";

export function MainApp({ data }: { data: AppData }) {
  const { accounts, categories, budgets, transactions, echeances, amis, prets, projets, contributions, trend } = data;
  const [tab, setTab] = useState<Tab>("dashboard");
  const [openAccountId, setOpenAccountId] = useState<string | null>(null);
  const [openAmiId, setOpenAmiId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [addBudgetOpen, setAddBudgetOpen] = useState(false);
  const [addEcheanceOpen, setAddEcheanceOpen] = useState(false);
  const [addAmiOpen, setAddAmiOpen] = useState(false);
  const [addPretDirection, setAddPretDirection] = useState<PretDirection | null>(null);
  const [openProjetId, setOpenProjetId] = useState<string | null>(null);
  const [openTransaction, setOpenTransaction] = useState<Transaction | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addProjetOpen, setAddProjetOpen] = useState(false);
  const [addContributionSens, setAddContributionSens] = useState<ContributionSens | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const categoriesWithoutBudget = categories.filter((c) => c.type === "depense" && !budgets.some((b) => b.categorieId === c.id));

  useEffect(() => {
    checkAndNotify(echeances, budgets, categories);
  }, [echeances, budgets, categories]);

  const openAccount = accounts.find((a) => a.id === openAccountId);
  const openAmi = amis.find((a) => a.id === openAmiId);
  const openProjet = projets.find((p) => p.id === openProjetId);

  function selectTab(t: Tab) {
    setTab(t);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
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
      className="app-bg"
      style={{
        height: "100%",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: `calc(env(safe-area-inset-top, 0px) + 24px) 18px 100px` }}>
        <div key={tab} style={{ animation: "tabFadeIn 0.22s ease" }}>
        {tab === "dashboard" && (
          <DashboardTab
            accounts={accounts}
            categories={categories}
            budgets={budgets}
            transactions={transactions}
            echeances={echeances}
            projets={projets}
            contributions={contributions}
            trend={trend}
            onOpenAccount={setOpenAccountId}
            onGoToBudgets={() => selectTab("budgets")}
            onGoToPlanned={() => selectTab("planned")}
            onSelectTransaction={setOpenTransaction}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}
        {tab === "accounts" && (
          <AccountsTab
            accounts={accounts}
            categories={categories}
            transactions={transactions}
            onOpenAccount={setOpenAccountId}
            onAddAccount={() => setAddAccountOpen(true)}
            onSelectTransaction={setOpenTransaction}
          />
        )}
        {tab === "budgets" && (
          <BudgetsTab
            budgets={budgets}
            categories={categories}
            projets={projets}
            contributions={contributions}
            transactions={transactions}
            onAddBudget={() => setAddBudgetOpen(true)}
            onAddProjet={() => setAddProjetOpen(true)}
            onOpenProjet={setOpenProjetId}
          />
        )}
        {tab === "planned" && (
          <PlannedTab
            echeances={echeances}
            categories={categories}
            accounts={accounts}
            transactions={transactions}
            onAdd={() => setAddEcheanceOpen(true)}
            onPay={(e) => handlePay(e.id)}
            payingId={payingId}
            onAcceptSuggestion={async (candidate, prochaineDate) => {
              await addEcheance({
                nom: candidate.libelle,
                type: candidate.type === "revenu" ? "revenu" : "depense",
                montant: candidate.montantMoyen,
                recurrence: "mensuel",
                prochaineDate,
                compteId: candidate.compteId,
                categorieId: candidate.categorieId,
              });
              showToast("Échéance ajoutée");
            }}
          />
        )}
        {tab === "friends" && (
          <FriendsTab amis={amis} prets={prets} onAddAmi={() => setAddAmiOpen(true)} onOpenAmi={setOpenAmiId} />
        )}
        {tab === "insights" && (
          <InsightsTab accounts={accounts} categories={categories} budgets={budgets} transactions={transactions} />
        )}
        </div>
      </div>

      <TabBar tab={tab} onTab={selectTab} onAdd={() => setAddOpen(true)} />

      {openAccount && (
        <AccountDetail
          account={openAccount}
          accounts={accounts}
          categories={categories}
          transactions={transactions}
          onClose={() => setOpenAccountId(null)}
          onSelectTransaction={setOpenTransaction}
        />
      )}

      {openTransaction && (
        <TransactionDetailSheet
          tx={openTransaction}
          categories={categories}
          accounts={accounts}
          onClose={() => setOpenTransaction(null)}
        />
      )}

      {settingsOpen && (
        <SettingsSheet
          transactions={transactions}
          categories={categories}
          accounts={accounts}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {openProjet && (
        <ProjetDetail
          projet={openProjet}
          contributions={contributions}
          onClose={() => setOpenProjetId(null)}
          onAddContribution={(sens) => setAddContributionSens(sens)}
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

      {addProjetOpen && (
        <AddProjetSheet
          onClose={() => setAddProjetOpen(false)}
          onConfirm={async (input) => {
            const projet = await addProjet(input);
            setAddProjetOpen(false);
            setOpenProjetId(projet.id);
            showToast("Projet créé");
          }}
        />
      )}

      {openProjet && addContributionSens && (
        <AddContributionSheet
          projet={openProjet}
          initialSens={addContributionSens}
          onClose={() => setAddContributionSens(null)}
          onConfirm={async (input) => {
            await addContribution(input);
            setAddContributionSens(null);
            showToast(input.sens === "verse" ? "Versement enregistré" : "Retrait enregistré");
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
