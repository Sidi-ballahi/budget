"use client";

import { useEffect, useMemo, useState } from "react";
import { colors } from "@/lib/theme";
import { fmtNum, todayLong } from "@/lib/present";
import { suggestCategoryLocal } from "@/lib/finance";
import type { Account, Category, NewTransactionInput, TransactionType } from "@/lib/types";

const AMOUNT_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];
const TYPE_DEFS: { key: TransactionType; label: string }[] = [
  { key: "depense", label: "Dépense" },
  { key: "revenu", label: "Revenu" },
  { key: "transfert", label: "Transfert" },
];

export function AddTransactionSheet({
  accounts,
  categories,
  onClose,
  onConfirm,
}: {
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
  onConfirm: (input: NewTransactionInput) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [type, setType] = useState<TransactionType>("depense");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [destAccountId, setDestAccountId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<{ label: string; categoryId: string } | null>(null);

  const isTransfert = type === "transfert";
  const amountNum = amount ? parseInt(amount, 10) : 0;

  const localSuggestion = useMemo(
    () => (isTransfert ? null : suggestCategoryLocal(label, categories)),
    [label, categories, isTransfert]
  );
  const suggestedCategoryId = (aiSuggestion?.label === label ? aiSuggestion.categoryId : null) ?? localSuggestion;
  const effectiveCategoryId = categoryId ?? suggestedCategoryId;

  useEffect(() => {
    if (isTransfert || !label.trim() || (typeof navigator !== "undefined" && !navigator.onLine)) {
      return;
    }
    const timeout = window.setTimeout(() => {
      fetch("/api/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => data?.categoryId && setAiSuggestion({ label, categoryId: data.categoryId }))
        .catch(() => {});
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [label, isTransfert]);

  function pressDigit(d: string) {
    if (amount.length >= 9) return;
    setAmount(amount + d);
  }
  function pressDelete() {
    setAmount(amount.slice(0, -1));
  }
  function selectType(t: TransactionType) {
    setType(t);
    setCategoryId(null);
    setDestAccountId(null);
  }

  const canGoStep2 = amountNum > 0;
  const canGoStep3 = isTransfert ? !!accountId && !!destAccountId : !!accountId;

  function confirm() {
    if (!accountId) return;
    const clientId = crypto.randomUUID();
    onConfirm({
      clientId,
      type,
      montant: amountNum,
      compteId: accountId,
      compteDestinationId: isTransfert ? destAccountId : null,
      categorieId: isTransfert ? null : effectiveCategoryId ?? "autres",
      libelle: label || null,
      date: new Date().toISOString(),
      creeHorsLigne: typeof navigator !== "undefined" && !navigator.onLine,
    });
  }

  const accountName = accounts.find((a) => a.id === accountId)?.nom ?? "—";
  const destAccountName = accounts.find((a) => a.id === destAccountId)?.nom ?? "—";
  const categoryName = effectiveCategoryId ? categories.find((c) => c.id === effectiveCategoryId)?.nom ?? "—" : "—";
  const typeLabel = { depense: "Dépense", revenu: "Revenu", transfert: "Transfert" }[type];

  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "oklch(0 0 0 / 0.5)", zIndex: 20 }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "88%",
          background: colors.sheetBg,
          borderRadius: "26px 26px 0 0",
          zIndex: 21,
          boxSizing: "border-box",
          padding: "14px 18px calc(env(safe-area-inset-bottom, 0px) + 28px)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -20px 40px oklch(0 0 0 / 0.4)",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 100, background: colors.white15, alignSelf: "center", marginBottom: 16 }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>Nouvelle opération</div>
          <div
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: colors.white8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colors.textMuted,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            ✕
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, background: colors.card, borderRadius: 12, padding: 4, marginBottom: 20 }}>
          {TYPE_DEFS.map((t) => (
            <div
              key={t.key}
              onClick={() => selectType(t.key)}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "8px 0",
                borderRadius: 9,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
                background: type === t.key ? colors.accentGreen : "transparent",
                color: type === t.key ? colors.neutralIcon : colors.textMuted,
              }}
            >
              {t.label}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, overflow: "auto" }}>
          {step === 1 && (
            <>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "20px 0 30px" }}>
                <div style={{ fontSize: 12.5, color: colors.textFaint }}>Montant</div>
                <div style={{ fontSize: 38, fontWeight: 800, color: colors.textPrimary }}>
                  {(amount ? fmtNum(parseInt(amount, 10)) : "0") + " MRU"}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px 18px", maxWidth: 280, margin: "0 auto" }}>
                {AMOUNT_KEYS.map((label2, i) => {
                  if (label2 === "") return <div key={i} style={{ height: 52 }} />;
                  const isDel = label2 === "del";
                  return (
                    <div
                      key={i}
                      onClick={() => (isDel ? pressDelete() : pressDigit(label2))}
                      style={{
                        height: 52,
                        borderRadius: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isDel ? 18 : 20,
                        fontWeight: 600,
                        color: colors.textSecondary,
                        background: colors.white5,
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      {isDel ? "⌫" : label2}
                    </div>
                  );
                })}
              </div>
              <div
                onClick={() => canGoStep2 && setStep(2)}
                style={{
                  textAlign: "center",
                  padding: 14,
                  borderRadius: 14,
                  marginTop: 22,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: canGoStep2 ? "pointer" : "default",
                  background: canGoStep2 ? colors.accentGreen : colors.white8,
                  color: canGoStep2 ? colors.neutralIcon : colors.textFaint,
                }}
              >
                Continuer
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>LIBELLÉ (optionnel)</div>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="ex : Restaurant, Taxi, Loyer…"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: colors.card,
                  border: `1px solid ${colors.white8}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  color: colors.textSecondary,
                  fontSize: 14,
                  fontFamily: "inherit",
                  marginBottom: 18,
                }}
              />

              <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>COMPTE</div>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 18 }}>
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => setAccountId(acc.id)}
                    style={{
                      flex: "0 0 92px",
                      padding: "12px 10px",
                      borderRadius: 14,
                      textAlign: "center",
                      cursor: "pointer",
                      background: accountId === acc.id ? colors.accentGreen : colors.white5,
                      color: accountId === acc.id ? colors.neutralIcon : colors.textSecondary,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{acc.nom}</div>
                  </div>
                ))}
              </div>

              {isTransfert ? (
                <>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>VERS LE COMPTE</div>
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 18 }}>
                    {accounts
                      .filter((a) => a.id !== accountId)
                      .map((acc) => (
                        <div
                          key={acc.id}
                          onClick={() => setDestAccountId(acc.id)}
                          style={{
                            flex: "0 0 92px",
                            padding: "12px 10px",
                            borderRadius: 14,
                            textAlign: "center",
                            cursor: "pointer",
                            background: destAccountId === acc.id ? colors.accentGreen : colors.white5,
                            color: destAccountId === acc.id ? colors.neutralIcon : colors.textSecondary,
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{acc.nom}</div>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted }}>CATÉGORIE</div>
                    {suggestedCategoryId && (
                      <div
                        style={{
                          fontSize: 10.5,
                          color: colors.accentGold,
                          background: "oklch(0.78 0.13 80 / 0.14)",
                          padding: "2px 8px",
                          borderRadius: 100,
                        }}
                      >
                        Suggéré par IA : {categories.find((c) => c.id === suggestedCategoryId)?.nom}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
                    {categories.map((cat) => {
                      const selected = effectiveCategoryId === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => setCategoryId(cat.id)}
                          style={{
                            padding: "12px 8px",
                            borderRadius: 14,
                            textAlign: "center",
                            cursor: "pointer",
                            background: selected ? colors.white8 : colors.white4,
                            color: selected ? colors.textPrimary : colors.textSecondary,
                            border: `1px solid ${selected ? cat.couleur : "transparent"}`,
                          }}
                        >
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: cat.couleur, margin: "0 auto 6px" }} />
                          <div style={{ fontSize: 11.5, fontWeight: 600 }}>{cat.nom}</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <div
                  onClick={() => setStep(1)}
                  style={{ flex: 1, textAlign: "center", padding: 14, borderRadius: 14, background: colors.white6, color: colors.textSecondary, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  Retour
                </div>
                <div
                  onClick={() => canGoStep3 && setStep(3)}
                  style={{
                    flex: 2,
                    textAlign: "center",
                    padding: 14,
                    borderRadius: 14,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: canGoStep3 ? "pointer" : "default",
                    background: canGoStep3 ? colors.accentGreen : colors.white6,
                    color: canGoStep3 ? colors.neutralIcon : colors.textFaint,
                  }}
                >
                  Continuer
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 12 }}>RÉCAPITULATIF</div>
              <div style={{ background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: 18, padding: 18, marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                <Row label="Type" value={typeLabel} strong />
                <Row label="Montant" value={fmtNum(amountNum) + " MRU"} big />
                <Row label="Compte" value={accountName} strong />
                {isTransfert ? <Row label="Vers" value={destAccountName} strong /> : <Row label="Catégorie" value={categoryName} strong />}
                <Row label="Libellé" value={label || "—"} strong />
                <Row label="Date" value={todayLong()} strong />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div
                  onClick={() => setStep(2)}
                  style={{ flex: 1, textAlign: "center", padding: 14, borderRadius: 14, background: colors.white6, color: colors.textSecondary, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  Retour
                </div>
                <div
                  onClick={confirm}
                  style={{ flex: 2, textAlign: "center", padding: 14, borderRadius: 14, background: colors.accentGold, color: colors.neutralIcon, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                >
                  Valider
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ label, value, strong, big }: { label: string; value: string; strong?: boolean; big?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ fontSize: 13, color: colors.textMuted }}>{label}</div>
      <div style={{ fontSize: big ? 15 : 13, fontWeight: strong || big ? 700 : 600, color: colors.textPrimary }}>{value}</div>
    </div>
  );
}
