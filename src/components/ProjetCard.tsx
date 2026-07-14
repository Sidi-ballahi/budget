"use client";

import { Target } from "lucide-react";
import { colors } from "@/lib/theme";
import { fmtNum } from "@/lib/present";
import type { ProjetProgress } from "@/lib/finance";

const MONTHS_FR_SHORT = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

export function projetDeadlineLabel(dateCible: string): string {
  const d = new Date(dateCible);
  return `${MONTHS_FR_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

export function ProjetCard({ progress, onOpen }: { progress: ProjetProgress; onOpen?: () => void }) {
  const { projet, epargne, pct, reste, mensualiteRequise } = progress;
  const done = reste <= 0;
  return (
    <div
      onClick={onOpen}
      style={{
        background: colors.card,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: 18,
        padding: 16,
        cursor: onOpen ? "pointer" : "default",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Target size={15} color={projet.couleur} />
          <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>{projet.nom}</div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: done ? colors.accentGreen : colors.textMuted }}>
          {Math.round(pct)}%
        </div>
      </div>
      <div style={{ height: 8, borderRadius: 100, background: "oklch(0.3 0.01 60)", overflow: "hidden", marginBottom: 8 }}>
        <div
          style={{
            height: "100%",
            borderRadius: 100,
            width: `${Math.min(100, Math.round(pct))}%`,
            background: done ? colors.accentGreen : projet.couleur,
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: colors.textMuted }}>
        <div>{fmtNum(epargne)} MRU épargnés</div>
        <div>cible {fmtNum(projet.montantCible)} MRU</div>
      </div>
      {!done && projet.dateCible && mensualiteRequise !== null && (
        <div style={{ fontSize: 11.5, color: colors.accentGold, marginTop: 8 }}>
          ≈ {fmtNum(mensualiteRequise)} MRU / mois pour finir en {projetDeadlineLabel(projet.dateCible)}
        </div>
      )}
      {done && <div style={{ fontSize: 11.5, color: colors.accentGreen, marginTop: 8 }}>Objectif atteint 🎉</div>}
    </div>
  );
}
