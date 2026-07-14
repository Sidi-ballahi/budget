"use client";

import { useState } from "react";
import { Target, X } from "lucide-react";
import { colors, COLOR_SWATCHES } from "@/lib/theme";
import type { NewProjetInput } from "@/lib/types";

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

export function AddProjetSheet({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (input: NewProjetInput) => Promise<void> | void;
}) {
  const [nom, setNom] = useState("");
  const [montantCible, setMontantCible] = useState("");
  const [dateCible, setDateCible] = useState("");
  const [couleur, setCouleur] = useState(COLOR_SWATCHES[5]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = nom.trim().length > 0 && parseFloat(montantCible) > 0 && !saving;

  async function save() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await onConfirm({
        nom: nom.trim(),
        couleur,
        montantCible: parseFloat(montantCible),
        dateCible: dateCible ? new Date(dateCible + "T12:00:00").toISOString() : null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de créer le projet");
      setSaving(false);
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "oklch(0 0 0 / 0.5)", zIndex: 20 }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
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
            <Target size={18} color={colors.accentGreen} />
            <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>Nouveau projet</div>
          </div>
          <div
            onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: "50%", background: colors.white8, display: "flex", alignItems: "center", justifyContent: "center", color: colors.textMuted, cursor: "pointer" }}
          >
            <X size={14} />
          </div>
        </div>

        <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>NOM DU PROJET</div>
        <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Terrain, voiture, mariage…" style={inputStyle} />

        <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>MONTANT CIBLE (MRU)</div>
        <input
          value={montantCible}
          onChange={(e) => setMontantCible(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder="0"
          inputMode="decimal"
          style={inputStyle}
        />

        <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>DATE CIBLE (OPTIONNEL)</div>
        <input type="date" value={dateCible} onChange={(e) => setDateCible(e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />

        <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>COULEUR</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
          {COLOR_SWATCHES.map((c) => (
            <div
              key={c}
              onClick={() => setCouleur(c)}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: c,
                cursor: "pointer",
                border: `2px solid ${couleur === c ? colors.textPrimary : "transparent"}`,
              }}
            />
          ))}
        </div>

        {error && <div style={{ fontSize: 12, color: colors.accentRed, marginBottom: 12 }}>{error}</div>}

        <div
          onClick={save}
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
          {saving ? "Création…" : "Créer le projet"}
        </div>
      </div>
    </>
  );
}
