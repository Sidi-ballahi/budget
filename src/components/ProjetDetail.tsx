"use client";

import { ArrowDownLeft, ArrowUpRight, Target } from "lucide-react";
import { colors, glassBorder, glassTint, glow } from "@/lib/theme";
import { fmtNum, shortDate } from "@/lib/present";
import { computeProjetProgress } from "@/lib/finance";
import { projetDeadlineLabel } from "./ProjetCard";
import type { ContributionSens, Projet, ProjetContribution } from "@/lib/types";

export function ProjetDetail({
  projet,
  contributions,
  onClose,
  onAddContribution,
}: {
  projet: Projet;
  contributions: ProjetContribution[];
  onClose: () => void;
  onAddContribution: (sens: ContributionSens) => void;
}) {
  const progress = computeProjetProgress(projet, contributions);
  const mouvements = contributions.filter((c) => c.projetId === projet.id);
  const done = progress.reste <= 0;

  const stat: React.CSSProperties = {
    flex: 1,
    borderRadius: 16,
    padding: 12,
  };

  return (
    <div
      className="app-bg"
      style={{
        position: "absolute",
        inset: 0,
        animation: "panelInRight 0.3s cubic-bezier(0.32,0.72,0,1)",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        padding: `calc(env(safe-area-inset-top, 0px) + 24px) 18px 24px`,
        overflow: "auto",
      }}
    >
      <div
        onClick={onClose}
        className="tap"
        style={{ display: "flex", alignItems: "center", gap: 6, color: colors.accentGreen, fontSize: 14, fontWeight: 600, marginBottom: 18, cursor: "pointer" }}
      >
        ‹ Retour
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: projet.couleur,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: glow(projet.couleur, 0.55),
          }}
        >
          <Target size={20} color={colors.neutralIcon} />
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: colors.textPrimary }}>{projet.nom}</div>
          <div style={{ fontSize: 12.5, color: colors.textFaint }}>
            {projet.dateCible ? `Objectif pour ${projetDeadlineLabel(projet.dateCible)}` : "Sans date limite"}
          </div>
        </div>
      </div>

      <div className="glass" style={{ background: glassTint(projet.couleur, 0.2), borderColor: glassBorder(projet.couleur), borderRadius: 20, padding: 18, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: colors.textPrimary }}>{fmtNum(progress.epargne)} MRU</div>
          <div style={{ fontSize: 12.5, color: colors.textMuted }}>sur {fmtNum(projet.montantCible)} MRU</div>
        </div>
        <div style={{ height: 10, borderRadius: 100, background: "oklch(1 0 0 / 0.1)", overflow: "hidden", marginBottom: 8 }}>
          <div
            style={{
              height: "100%",
              borderRadius: 100,
              width: `${Math.min(100, Math.round(progress.pct))}%`,
              background: done ? colors.accentGreen : projet.couleur,
              boxShadow: glow(done ? colors.accentGreen : projet.couleur, 0.5),
            }}
          />
        </div>
        <div style={{ fontSize: 12, color: done ? colors.accentGreen : colors.textMuted }}>
          {done ? "Objectif atteint 🎉" : `${Math.round(progress.pct)}% — reste ${fmtNum(progress.reste)} MRU`}
        </div>
      </div>

      {!done && projet.dateCible && (
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div className="glass" style={stat}>
            <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>Mois restants</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: colors.textPrimary }}>{progress.moisRestants}</div>
          </div>
          <div className="glass" style={stat}>
            <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>À épargner / mois</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: colors.accentGold }}>
              {fmtNum(progress.mensualiteRequise ?? 0)} MRU
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <div
          onClick={() => onAddContribution("verse")}
          className="tap"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            padding: 13,
            borderRadius: 14,
            fontSize: 13.5,
            fontWeight: 700,
            cursor: "pointer",
            background: colors.accentGreen,
            color: colors.neutralIcon,
            boxShadow: glow(colors.accentGreen, 0.4),
          }}
        >
          <ArrowUpRight size={16} />
          Verser
        </div>
        <div
          onClick={() => onAddContribution("retire")}
          className="tap glass"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            padding: 13,
            borderRadius: 14,
            fontSize: 13.5,
            fontWeight: 700,
            cursor: "pointer",
            color: colors.textSecondary,
          }}
        >
          <ArrowDownLeft size={16} />
          Retirer
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginBottom: 10 }}>Versements</div>
      {mouvements.length === 0 ? (
        <div style={{ fontSize: 12.5, color: colors.textFaint }}>
          Aucun versement. Chaque montant versé reste sur vos comptes mais est réservé pour ce projet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mouvements.map((m) => {
            const isVerse = m.sens === "verse";
            return (
              <div key={m.id} className="glass" style={{ borderRadius: 16, padding: 13, display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 11,
                    background: colors.white6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {isVerse ? <ArrowUpRight size={15} color={colors.accentGreen} /> : <ArrowDownLeft size={15} color={colors.accentGold} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary }}>
                    {isVerse ? "Versement" : "Retrait"}
                    {m.note ? ` · ${m.note}` : ""}
                  </div>
                  <div style={{ fontSize: 11, color: colors.textFaint, marginTop: 3 }}>{shortDate(m.date)}</div>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: isVerse ? colors.accentGreen : colors.textPrimary }}>
                  {isVerse ? "+" : "-"}{fmtNum(m.montant)} MRU
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
