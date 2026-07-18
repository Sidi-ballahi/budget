"use client";

import { useState } from "react";
import { PiggyBank, Tag, X } from "lucide-react";
import { colors, glow } from "@/lib/theme";
import type { Category, NewBudgetInput } from "@/lib/types";

export function AddBudgetSheet({
  categories,
  onClose,
  onConfirm,
}: {
  categories: Category[];
  onClose: () => void;
  onConfirm: (input: NewBudgetInput) => Promise<void> | void;
}) {
  const [categorieId, setCategorieId] = useState<string | null>(categories[0]?.id ?? null);
  const [montantLimite, setMontantLimite] = useState("");
  const [seuilAlerte, setSeuilAlerte] = useState("80");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = !!categorieId && parseFloat(montantLimite) > 0 && !saving;

  async function save() {
    if (!canSave || !categorieId) return;
    setSaving(true);
    setError(null);
    try {
      await onConfirm({
        categorieId,
        montantLimite: parseFloat(montantLimite),
        seuilAlerte: seuilAlerte ? parseInt(seuilAlerte, 10) : 80,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de créer le budget");
      setSaving(false);
    }
  }

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
          borderRadius: "26px 26px 0 0",
          zIndex: 21,
          boxSizing: "border-box",
          padding: "14px 18px calc(env(safe-area-inset-bottom, 0px) + 28px)",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 100, background: colors.white15, alignSelf: "center", margin: "0 auto 16px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PiggyBank size={18} color={colors.accentGreen} />
            <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>Nouveau budget</div>
          </div>
          <div
            onClick={onClose}
            className="tap glass"
            style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: colors.textMuted, cursor: "pointer" }}
          >
            <X size={14} />
          </div>
        </div>

        {categories.length === 0 ? (
          <div style={{ fontSize: 13, color: colors.textFaint, marginBottom: 20 }}>
            Toutes les catégories ont déjà un budget.
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>CATÉGORIE</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 18 }}>
              {categories.map((cat) => {
                const selected = categorieId === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setCategorieId(cat.id)}
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

            <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>PLAFOND MENSUEL (MRU)</div>
            <input
              value={montantLimite}
              onChange={(e) => setMontantLimite(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0"
              inputMode="decimal"
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

            <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>SEUIL D&apos;ALERTE (%)</div>
            <input
              value={seuilAlerte}
              onChange={(e) => setSeuilAlerte(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
              placeholder="80"
              inputMode="numeric"
              className="glass-input"
              style={{
                width: "100%",
                boxSizing: "border-box",
                borderRadius: 12,
                padding: "12px 14px",
                color: colors.textSecondary,
                fontSize: 14,
                fontFamily: "inherit",
                marginBottom: 22,
              }}
            />

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
                boxShadow: canSave ? glow(colors.accentGold, 0.4) : "none",
              }}
            >
              {saving ? "Création…" : "Créer le budget"}
            </div>
          </>
        )}
      </div>
    </>
  );
}
