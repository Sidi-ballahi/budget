"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { colors } from "@/lib/theme";
import { fmtNum, shortDate } from "@/lib/present";
import { computeAmiBalance } from "@/lib/finance";
import { amiBalanceLabel } from "./FriendsTab";
import type { Account, Ami, PretDirection, PretMouvement } from "@/lib/types";

export function AmiDetail({
  ami,
  prets,
  accounts,
  onClose,
  onAddMouvement,
}: {
  ami: Ami;
  prets: PretMouvement[];
  accounts: Account[];
  onClose: () => void;
  onAddMouvement: (direction: PretDirection) => void;
}) {
  const mouvements = prets.filter((p) => p.amiId === ami.id);
  const balance = computeAmiBalance(ami.id, prets);
  const bal = amiBalanceLabel(balance);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: colors.bg,
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
        style={{ display: "flex", alignItems: "center", gap: 6, color: colors.accentGreen, fontSize: 14, fontWeight: 600, marginBottom: 18, cursor: "pointer" }}
      >
        ‹ Retour
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: ami.couleur,
            color: colors.neutralIcon,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 800,
          }}
        >
          {ami.nom[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: colors.textPrimary }}>{ami.nom}</div>
          <div style={{ fontSize: 12.5, color: bal.color }}>{bal.text}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <div
          onClick={() => onAddMouvement("donne")}
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
            background: colors.accentGold,
            color: colors.neutralIcon,
          }}
        >
          <ArrowUpRight size={16} />
          J&apos;ai donné
        </div>
        <div
          onClick={() => onAddMouvement("recu")}
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
          }}
        >
          <ArrowDownLeft size={16} />
          J&apos;ai reçu
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginBottom: 10 }}>Historique</div>
      {mouvements.length === 0 ? (
        <div style={{ fontSize: 12.5, color: colors.textFaint }}>
          Aucun mouvement. Utilisez « J&apos;ai donné » quand vous prêtez ou remboursez, « J&apos;ai reçu » quand on vous rend ou vous prête de l&apos;argent.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mouvements.map((m) => {
            const acc = accounts.find((a) => a.id === m.compteId);
            const isDonne = m.direction === "donne";
            return (
              <div key={m.id} style={{ background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: 16, padding: 13, display: "flex", alignItems: "center", gap: 12 }}>
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
                  {isDonne ? <ArrowUpRight size={15} color={colors.accentGold} /> : <ArrowDownLeft size={15} color={colors.accentGreen} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary }}>
                    {isDonne ? "Donné" : "Reçu"}
                    {m.note ? ` · ${m.note}` : ""}
                  </div>
                  <div style={{ fontSize: 11, color: colors.textFaint, marginTop: 3 }}>
                    {shortDate(m.date)}
                    {acc ? ` · ${acc.nom}` : " · hors compte"}
                  </div>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: isDonne ? colors.textPrimary : colors.accentGreen }}>
                  {isDonne ? "-" : "+"}{fmtNum(m.montant)} MRU
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
