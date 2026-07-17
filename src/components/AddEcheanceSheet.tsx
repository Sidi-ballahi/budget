"use client";

import { useState } from "react";
import { CalendarClock, Tag, X } from "lucide-react";
import { colors } from "@/lib/theme";
import { RECURRENCE_LABELS } from "@/lib/recurrence";
import type { Account, Category, CategoryType, NewEcheanceInput, Recurrence } from "@/lib/types";

const RECURRENCES: Recurrence[] = ["ponctuel", "hebdomadaire", "mensuel", "annuel"];

const inputStyle: React.CSSProperties = {
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
};

function labelStyle(): React.CSSProperties {
  return { fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 };
}

export function AddEcheanceSheet({
  accounts,
  categories,
  onClose,
  onConfirm,
}: {
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
  onConfirm: (input: NewEcheanceInput) => Promise<void> | void;
}) {
  const [type, setType] = useState<CategoryType>("depense");
  const [nom, setNom] = useState("");
  const [montant, setMontant] = useState("");
  const [recurrence, setRecurrence] = useState<Recurrence>("mensuel");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [compteId, setCompteId] = useState<string | null>(accounts[0]?.id ?? null);
  const [categorieId, setCategorieId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cats = categories.filter((c) => c.type === type);
  const canSave = nom.trim().length > 0 && parseFloat(montant) > 0 && !!compteId && !!date && !saving;

  async function save() {
    if (!canSave || !compteId) return;
    setSaving(true);
    setError(null);
    try {
      await onConfirm({
        nom: nom.trim(),
        type,
        montant: parseFloat(montant),
        recurrence,
        prochaineDate: new Date(date + "T12:00:00").toISOString(),
        compteId,
        categorieId,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de créer l'échéance");
      setSaving(false);
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "oklch(0 0 0 / 0.5)", zIndex: 20, animation: "backdropIn 0.22s ease" }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          animation: "sheetUp 0.32s cubic-bezier(0.32,0.72,0,1)",
          maxHeight: "88%",
          overflow: "auto",
          background: colors.sheetBg,
          borderRadius: "26px 26px 0 0",
          zIndex: 21,
          boxSizing: "border-box",
          padding: "14px 18px calc(env(safe-area-inset-bottom, 0px) + 28px)",
          boxShadow: "0 -20px 40px oklch(0 0 0 / 0.4)",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 100, background: colors.white15, margin: "0 auto 16px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarClock size={18} color={colors.accentGreen} />
            <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>Nouvelle échéance</div>
          </div>
          <div
            onClick={onClose}
            className="tap"
            style={{ width: 28, height: 28, borderRadius: "50%", background: colors.white8, display: "flex", alignItems: "center", justifyContent: "center", color: colors.textMuted, cursor: "pointer" }}
          >
            <X size={14} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {(["depense", "revenu"] as CategoryType[]).map((t) => (
            <div
              key={t}
              onClick={() => {
                setType(t);
                setCategorieId(null);
              }}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "10px 0",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                background: type === t ? colors.white8 : colors.white4,
                color: type === t ? colors.textPrimary : colors.textFaint,
                border: `1px solid ${type === t ? (t === "revenu" ? colors.accentGreen : colors.accentGold) : "transparent"}`,
              }}
            >
              {t === "depense" ? "Dépense" : "Revenu"}
            </div>
          ))}
        </div>

        <div style={labelStyle()}>NOM</div>
        <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder={type === "depense" ? "Loyer, Internet…" : "Salaire…"} style={inputStyle} />

        <div style={labelStyle()}>MONTANT (MRU)</div>
        <input
          value={montant}
          onChange={(e) => setMontant(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder="0"
          inputMode="decimal"
          style={inputStyle}
        />

        <div style={labelStyle()}>RÉCURRENCE</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {RECURRENCES.map((r) => (
            <div
              key={r}
              onClick={() => setRecurrence(r)}
              style={{
                padding: "8px 12px",
                borderRadius: 100,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background: recurrence === r ? colors.white8 : colors.white4,
                color: recurrence === r ? colors.textPrimary : colors.textFaint,
                border: `1px solid ${recurrence === r ? colors.accentGreen : "transparent"}`,
              }}
            >
              {RECURRENCE_LABELS[r]}
            </div>
          ))}
        </div>

        <div style={labelStyle()}>{recurrence === "ponctuel" ? "DATE PRÉVUE" : "PROCHAINE ÉCHÉANCE"}</div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />

        <div style={labelStyle()}>COMPTE</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {accounts.map((a) => (
            <div
              key={a.id}
              onClick={() => setCompteId(a.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 12px",
                borderRadius: 100,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background: compteId === a.id ? colors.white8 : colors.white4,
                color: compteId === a.id ? colors.textPrimary : colors.textFaint,
                border: `1px solid ${compteId === a.id ? a.couleur : "transparent"}`,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: 2, background: a.couleur }} />
              {a.nom}
            </div>
          ))}
        </div>

        {cats.length > 0 && (
          <>
            <div style={labelStyle()}>CATÉGORIE (OPTIONNEL)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 22 }}>
              {cats.map((cat) => {
                const selected = categorieId === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setCategorieId(selected ? null : cat.id)}
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
                    <Tag size={16} color={cat.couleur} style={{ margin: "0 auto 6px", display: "block" }} />
                    <div style={{ fontSize: 11.5, fontWeight: 600 }}>{cat.nom}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {error && <div style={{ fontSize: 12, color: colors.accentRed, marginBottom: 12 }}>{error}</div>}

        <div
          onClick={save}
          className="tap"
          style={{
            textAlign: "center",
            padding: 14,
            borderRadius: 14,
            fontSize: 14,
            fontWeight: 700,
            cursor: canSave ? "pointer" : "default",
            background: canSave ? colors.accentGold : colors.white8,
            color: canSave ? colors.neutralIcon : colors.textFaint,
          }}
        >
          {saving ? "Création…" : "Créer l'échéance"}
        </div>
      </div>
    </>
  );
}
