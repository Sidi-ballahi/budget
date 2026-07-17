"use client";

import { CalendarClock, Check, Plus, RefreshCw, Tag } from "lucide-react";
import { colors } from "@/lib/theme";
import { fmtNum, shortDate } from "@/lib/present";
import { RECURRENCE_LABELS, monthlyEquivalent } from "@/lib/recurrence";
import type { Account, Category, Echeance } from "@/lib/types";

function dueLabel(iso: string): { text: string; color: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = new Date(iso);
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((day.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { text: `En retard (${shortDate(iso)})`, color: colors.accentRed };
  if (diff === 0) return { text: "Aujourd'hui", color: colors.accentGold };
  if (diff === 1) return { text: "Demain", color: colors.accentGold };
  if (diff <= 7) return { text: `Dans ${diff} jours`, color: colors.textMuted };
  return { text: shortDate(iso), color: colors.textMuted };
}

function EcheanceRow({
  echeance,
  categories,
  accounts,
  onPay,
  paying,
}: {
  echeance: Echeance;
  categories: Category[];
  accounts: Account[];
  onPay: (e: Echeance) => void;
  paying: boolean;
}) {
  const cat = categories.find((c) => c.id === echeance.categorieId);
  const acc = accounts.find((a) => a.id === echeance.compteId);
  const due = dueLabel(echeance.prochaineDate);
  const isRevenu = echeance.type === "revenu";
  return (
    <div style={{ background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: 18, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: colors.white6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {echeance.recurrence === "ponctuel" ? (
          <CalendarClock size={17} color={cat?.couleur ?? colors.textMuted} />
        ) : (
          <RefreshCw size={16} color={cat?.couleur ?? colors.textMuted} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: colors.textSecondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {echeance.nom}
        </div>
        <div style={{ fontSize: 11, color: due.color, marginTop: 3 }}>
          {due.text}
          {acc ? ` · ${acc.nom}` : ""}
          {echeance.recurrence !== "ponctuel" ? ` · ${RECURRENCE_LABELS[echeance.recurrence]}` : ""}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: isRevenu ? colors.accentGreen : colors.textPrimary }}>
          {isRevenu ? "+" : "-"}{fmtNum(echeance.montant)} MRU
        </div>
        <div
          onClick={() => !paying && onPay(echeance)}
          className={paying ? undefined : "tap"}
          style={{
            marginTop: 6,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
            fontWeight: 700,
            color: colors.neutralIcon,
            background: paying ? colors.white15 : colors.accentGold,
            borderRadius: 100,
            padding: "4px 10px",
            cursor: paying ? "default" : "pointer",
          }}
        >
          <Check size={12} />
          {paying ? "…" : isRevenu ? "Reçu" : "Payé"}
        </div>
      </div>
    </div>
  );
}

export function PlannedTab({
  echeances,
  categories,
  accounts,
  onAdd,
  onPay,
  payingId,
}: {
  echeances: Echeance[];
  categories: Category[];
  accounts: Account[];
  onAdd: () => void;
  onPay: (e: Echeance) => void;
  payingId: string | null;
}) {
  const actives = echeances.filter((e) => e.actif);
  const charges = actives.filter((e) => e.recurrence !== "ponctuel");
  const previsions = actives.filter((e) => e.recurrence === "ponctuel");
  const monthly = charges.filter((e) => e.type === "depense").reduce((s, e) => s + monthlyEquivalent(e.montant, e.recurrence), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, marginBottom: 6 }}>Prévu</div>
          <div style={{ fontSize: 12.5, color: colors.textFaint }}>
            {charges.length ? `Charges fixes ≈ ${fmtNum(monthly)} MRU / mois` : "Charges fixes et prévisions"}
          </div>
        </div>
        <div
          onClick={onAdd}
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
            flexShrink: 0,
          }}
        >
          <Plus size={16} />
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginBottom: 10 }}>Charges fixes</div>
      {charges.length === 0 ? (
        <div style={{ fontSize: 12.5, color: colors.textFaint, marginBottom: 18 }}>
          Aucune charge fixe. Ajoutez loyer, abonnements, factures… avec le bouton +.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {charges.map((e) => (
            <EcheanceRow key={e.id} echeance={e} categories={categories} accounts={accounts} onPay={onPay} paying={payingId === e.id} />
          ))}
        </div>
      )}

      <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginBottom: 10 }}>Prévisions</div>
      {previsions.length === 0 ? (
        <div style={{ fontSize: 12.5, color: colors.textFaint }}>
          Aucune prévision ponctuelle. Planifiez une dépense ou un revenu à venir.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {previsions.map((e) => (
            <EcheanceRow key={e.id} echeance={e} categories={categories} accounts={accounts} onPay={onPay} paying={payingId === e.id} />
          ))}
        </div>
      )}
      <div style={{ height: 8 }} />
      <div style={{ fontSize: 11, color: colors.textFaint, display: "flex", alignItems: "center", gap: 6 }}>
        <Tag size={11} />
        Marquer « Payé / Reçu » crée la transaction réelle et avance l&apos;échéance.
      </div>
    </div>
  );
}
