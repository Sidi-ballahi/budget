"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Plus, Tag, X } from "lucide-react";
import { colors, glassBorder, glassTint, glow } from "@/lib/theme";
import { fmtNum, todayLong } from "@/lib/present";
import { suggestCategoryLocal } from "@/lib/finance";
import { addCategory } from "@/lib/sync";
import { compressImageFile } from "@/lib/image";
import { AddCategorySheet } from "./AddCategorySheet";
import type { Account, Category, NewTransactionInput, TransactionType } from "@/lib/types";

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
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{ label: string; categoryId: string } | null>(null);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  function addTag() {
    const t = tagInput.trim().slice(0, 30);
    if (t && !tags.includes(t) && tags.length < 10) setTags((prev) => [...prev, t]);
    setTagInput("");
  }

  async function handlePhotoPick(file: File | null) {
    if (!file) return;
    setPhotoBusy(true);
    try {
      setPhoto(await compressImageFile(file));
    } catch {
      // ignore: photo is optional, a bad file just gets dropped
    } finally {
      setPhotoBusy(false);
    }
  }

  const isTransfert = type === "transfert";
  const amountNum = amount ? parseFloat(amount) : 0;

  const categoriesForType = useMemo(
    () => (isTransfert ? [] : categories.filter((c) => c.type === type)),
    [categories, type, isTransfert]
  );

  const localSuggestion = useMemo(
    () => (isTransfert ? null : suggestCategoryLocal(label, categoriesForType)),
    [label, categoriesForType, isTransfert]
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
      categorieId: isTransfert ? null : effectiveCategoryId ?? categoriesForType[0]?.id ?? null,
      libelle: label || null,
      tags,
      justificatif: photo,
      date: new Date().toISOString(),
      creeHorsLigne: typeof navigator !== "undefined" && !navigator.onLine,
    });
  }

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const accountName = selectedAccount?.nom ?? "—";
  const destAccountName = accounts.find((a) => a.id === destAccountId)?.nom ?? "—";
  const categoryName = effectiveCategoryId ? categories.find((c) => c.id === effectiveCategoryId)?.nom ?? "—" : "—";
  const typeLabel = { depense: "Dépense", revenu: "Revenu", transfert: "Transfert" }[type];

  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "oklch(0 0 0 / 0.5)", backdropFilter: "blur(2px)", zIndex: 20, animation: "backdropIn 0.22s ease" }} />
      <div
        className="glass-sheet"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          animation: "sheetUp 0.32s cubic-bezier(0.32,0.72,0,1)",
          height: "88%",
          borderRadius: "26px 26px 0 0",
          zIndex: 21,
          boxSizing: "border-box",
          padding: "14px 18px calc(env(safe-area-inset-bottom, 0px) + 28px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 100, background: colors.white15, alignSelf: "center", marginBottom: 16 }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>Nouvelle opération</div>
          <div
            onClick={onClose}
            className="tap glass"
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
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

        <div className="glass" style={{ display: "flex", gap: 6, borderRadius: 12, padding: 4, marginBottom: 20 }}>
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
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <input
                    autoFocus
                    value={amount}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
                      setAmount(cleaned);
                    }}
                    placeholder="0"
                    inputMode="decimal"
                    style={{
                      width: 200,
                      textAlign: "right",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      fontSize: 38,
                      fontWeight: 800,
                      color: colors.textPrimary,
                      fontFamily: "inherit",
                    }}
                  />
                  <div style={{ fontSize: 16, fontWeight: 700, color: colors.textFaint }}>MRU</div>
                </div>
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
                  boxShadow: canGoStep2 ? glow(colors.accentGreen, 0.4) : "none",
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
                className="glass-input"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  borderRadius: 12,
                  padding: "12px 14px",
                  color: colors.textSecondary,
                  fontSize: 14,
                  fontFamily: "inherit",
                  marginBottom: 18,
                }}
              />

              <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>TAGS (optionnel)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                {tags.map((t) => (
                  <span
                    key={t}
                    style={{ display: "flex", alignItems: "center", gap: 4, background: colors.white8, color: colors.textSecondary, borderRadius: 100, padding: "5px 6px 5px 12px", fontSize: 12 }}
                  >
                    {t}
                    <X size={12} style={{ cursor: "pointer" }} onClick={() => setTags((prev) => prev.filter((x) => x !== t))} />
                  </span>
                ))}
              </div>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                onBlur={addTag}
                placeholder="ex : remboursable, voyage… (Entrée pour ajouter)"
                className="glass-input"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  borderRadius: 12,
                  padding: "12px 14px",
                  color: colors.textSecondary,
                  fontSize: 14,
                  fontFamily: "inherit",
                  marginBottom: 18,
                }}
              />

              <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>JUSTIFICATIF (optionnel)</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                onChange={(e) => handlePhotoPick(e.target.files?.[0] ?? null)}
              />
              {photo ? (
                <div style={{ position: "relative", marginBottom: 18 }}>
                  <img src={photo} alt="Justificatif" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 12 }} />
                  <div
                    onClick={() => setPhoto(null)}
                    className="tap glass"
                    style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  >
                    <X size={13} color={colors.textPrimary} />
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="tap"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 18,
                    border: `1px dashed ${colors.white15}`,
                    color: colors.textFaint,
                    fontSize: 12.5,
                    cursor: "pointer",
                  }}
                >
                  <Camera size={15} />
                  {photoBusy ? "Traitement…" : "Ajouter une photo du reçu"}
                </div>
              )}

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
                    {categoriesForType.map((cat) => {
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
                            background: selected ? glassTint(cat.couleur, 0.32) : colors.white4,
                            color: selected ? colors.textPrimary : colors.textSecondary,
                            border: `1px solid ${selected ? glassBorder(cat.couleur) : "transparent"}`,
                          }}
                        >
                          <Tag size={16} color={cat.couleur} style={{ margin: "0 auto 6px", display: "block" }} />
                          <div style={{ fontSize: 11.5, fontWeight: 600 }}>{cat.nom}</div>
                        </div>
                      );
                    })}
                    <div
                      onClick={() => setAddCategoryOpen(true)}
                      style={{
                        padding: "12px 8px",
                        borderRadius: 14,
                        textAlign: "center",
                        cursor: "pointer",
                        background: colors.white4,
                        color: colors.textFaint,
                        border: `1px dashed ${colors.white15}`,
                      }}
                    >
                      <Plus size={16} style={{ margin: "0 auto 6px", display: "block" }} />
                      <div style={{ fontSize: 11.5, fontWeight: 600 }}>Ajouter</div>
                    </div>
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
                    boxShadow: canGoStep3 ? glow(colors.accentGreen, 0.4) : "none",
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
              <div className="glass" style={{ borderRadius: 18, padding: 18, marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                <Row label="Type" value={typeLabel} strong />
                <Row label="Montant" value={fmtNum(amountNum) + " " + (selectedAccount?.devise ?? "MRU")} big />
                <Row label="Compte" value={accountName} strong />
                {isTransfert ? <Row label="Vers" value={destAccountName} strong /> : <Row label="Catégorie" value={categoryName} strong />}
                <Row label="Libellé" value={label || "—"} strong />
                {tags.length > 0 && <Row label="Tags" value={tags.join(", ")} strong />}
                {photo && <Row label="Justificatif" value="Photo ajoutée" strong />}
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
                  className="tap"
                  style={{ flex: 2, textAlign: "center", padding: 14, borderRadius: 14, background: colors.accentGold, color: colors.neutralIcon, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: glow(colors.accentGold, 0.4) }}
                >
                  Valider
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {addCategoryOpen && (
        <AddCategorySheet
          defaultType={isTransfert ? "depense" : type}
          onClose={() => setAddCategoryOpen(false)}
          onConfirm={async (input) => {
            const created = await addCategory(input);
            setCategoryId(created.id);
            setAddCategoryOpen(false);
          }}
        />
      )}
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
