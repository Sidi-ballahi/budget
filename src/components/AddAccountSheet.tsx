"use client";

import { useState } from "react";
import { Landmark, Wallet, X } from "lucide-react";
import { colors, COLOR_SWATCHES } from "@/lib/theme";
import type { AccountType, NewAccountInput } from "@/lib/types";

const TYPE_DEFS: { key: AccountType; label: string; Icon: typeof Landmark }[] = [
  { key: "banque", label: "Compte bancaire", Icon: Landmark },
  { key: "cash", label: "Espèces", Icon: Wallet },
];

export function AddAccountSheet({ onClose, onConfirm }: { onClose: () => void; onConfirm: (input: NewAccountInput) => Promise<void> | void }) {
  const [nom, setNom] = useState("");
  const [type, setType] = useState<AccountType>("banque");
  const [soldeInitial, setSoldeInitial] = useState("");
  const [couleur, setCouleur] = useState(COLOR_SWATCHES[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = nom.trim().length > 0 && !saving;

  async function save() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await onConfirm({
        nom: nom.trim(),
        type,
        soldeInitial: soldeInitial ? parseFloat(soldeInitial) : 0,
        couleur,
      });
    } catch {
      setError("Impossible de créer le compte. Vérifie ta connexion.");
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
          background: colors.sheetBg,
          borderRadius: "26px 26px 0 0",
          zIndex: 21,
          boxSizing: "border-box",
          padding: "14px 18px calc(env(safe-area-inset-bottom, 0px) + 28px)",
          boxShadow: "0 -20px 40px oklch(0 0 0 / 0.4)",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 100, background: colors.white15, alignSelf: "center", margin: "0 auto 16px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>Nouveau compte</div>
          <div
            onClick={onClose}
            className="tap"
            style={{ width: 28, height: 28, borderRadius: "50%", background: colors.white8, display: "flex", alignItems: "center", justifyContent: "center", color: colors.textMuted, cursor: "pointer" }}
          >
            <X size={14} />
          </div>
        </div>

        <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>NOM</div>
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="ex : Banque D, Épargne…"
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

        <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>SOLDE INITIAL (MRU)</div>
        <input
          value={soldeInitial}
          onChange={(e) => setSoldeInitial(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder="0"
          inputMode="decimal"
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
          {saving ? "Création…" : "Créer le compte"}
        </div>
      </div>
    </>
  );
}
