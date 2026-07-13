"use client";

import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, X } from "lucide-react";
import { colors, COLOR_SWATCHES } from "@/lib/theme";
import type { CategoryType, NewCategoryInput } from "@/lib/types";

const TYPE_DEFS: { key: CategoryType; label: string; Icon: typeof ArrowDownCircle }[] = [
  { key: "depense", label: "Dépense", Icon: ArrowDownCircle },
  { key: "revenu", label: "Revenu", Icon: ArrowUpCircle },
];

export function AddCategorySheet({
  defaultType,
  onClose,
  onConfirm,
}: {
  defaultType: CategoryType;
  onClose: () => void;
  onConfirm: (input: NewCategoryInput) => Promise<void> | void;
}) {
  const [nom, setNom] = useState("");
  const [type, setType] = useState<CategoryType>(defaultType);
  const [couleur, setCouleur] = useState(COLOR_SWATCHES[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = nom.trim().length > 0 && !saving;

  async function save() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await onConfirm({ nom: nom.trim(), type, couleur });
    } catch {
      setError("Impossible de créer la catégorie. Vérifie ta connexion.");
      setSaving(false);
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "oklch(0 0 0 / 0.5)", zIndex: 30 }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          background: colors.sheetBg,
          borderRadius: "26px 26px 0 0",
          zIndex: 31,
          boxSizing: "border-box",
          padding: "14px 18px calc(env(safe-area-inset-bottom, 0px) + 28px)",
          boxShadow: "0 -20px 40px oklch(0 0 0 / 0.4)",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 100, background: colors.white15, alignSelf: "center", margin: "0 auto 16px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>Nouvelle catégorie</div>
          <div
            onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: "50%", background: colors.white8, display: "flex", alignItems: "center", justifyContent: "center", color: colors.textMuted, cursor: "pointer" }}
          >
            <X size={14} />
          </div>
        </div>

        <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>NOM</div>
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="ex : Assurance, Freelance…"
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

        <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>TYPE</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {TYPE_DEFS.map(({ key, label, Icon }) => (
            <div
              key={key}
              onClick={() => setType(key)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "12px 8px",
                borderRadius: 14,
                cursor: "pointer",
                background: type === key ? colors.accentGreen : colors.white5,
                color: type === key ? colors.neutralIcon : colors.textSecondary,
              }}
            >
              <Icon size={18} />
              <div style={{ fontSize: 11.5, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>COULEUR</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
          {COLOR_SWATCHES.map((c) => (
            <div
              key={c}
              onClick={() => setCouleur(c)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: c,
                cursor: "pointer",
                boxShadow: couleur === c ? `0 0 0 2px ${colors.sheetBg}, 0 0 0 4px ${c}` : "none",
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
          {saving ? "Création…" : "Créer la catégorie"}
        </div>
      </div>
    </>
  );
}
