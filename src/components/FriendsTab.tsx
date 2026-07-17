"use client";

import { ChevronRight, Plus, Users } from "lucide-react";
import { colors } from "@/lib/theme";
import { fmtNum } from "@/lib/present";
import { computeAmiBalance } from "@/lib/finance";
import type { Ami, PretMouvement } from "@/lib/types";

export function amiBalanceLabel(balance: number): { text: string; color: string } {
  if (balance > 0) return { text: `Vous doit ${fmtNum(balance)} MRU`, color: colors.accentGreen };
  if (balance < 0) return { text: `Vous lui devez ${fmtNum(-balance)} MRU`, color: colors.accentRed };
  return { text: "Réglé", color: colors.textFaint };
}

export function FriendsTab({
  amis,
  prets,
  onAddAmi,
  onOpenAmi,
}: {
  amis: Ami[];
  prets: PretMouvement[];
  onAddAmi: () => void;
  onOpenAmi: (id: string) => void;
}) {
  const balances = amis.map((a) => ({ ami: a, balance: computeAmiBalance(a.id, prets) }));
  const owedToMe = balances.filter((b) => b.balance > 0).reduce((s, b) => s + b.balance, 0);
  const iOwe = balances.filter((b) => b.balance < 0).reduce((s, b) => s - b.balance, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, marginBottom: 6 }}>Amis</div>
          <div style={{ fontSize: 12.5, color: colors.textFaint }}>Prêts, emprunts et remboursements</div>
        </div>
        <div
          onClick={onAddAmi}
          className="tap"
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: colors.white8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.textSecondary,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Plus size={16} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <div style={{ flex: 1, background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: 18, padding: 14 }}>
          <div style={{ fontSize: 11.5, color: colors.textMuted, marginBottom: 5 }}>On vous doit</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: colors.accentGreen }}>{fmtNum(owedToMe)} MRU</div>
        </div>
        <div style={{ flex: 1, background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: 18, padding: 14 }}>
          <div style={{ fontSize: 11.5, color: colors.textMuted, marginBottom: 5 }}>Vous devez</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: iOwe > 0 ? colors.accentRed : colors.textPrimary }}>{fmtNum(iOwe)} MRU</div>
        </div>
      </div>

      {amis.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: colors.textFaint }}>
          <Users size={28} style={{ margin: "0 auto 12px", display: "block" }} />
          <div style={{ fontSize: 13 }}>
            Aucun ami pour l&apos;instant. Ajoutez un ami avec le bouton + pour suivre l&apos;argent prêté et emprunté.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {balances.map(({ ami, balance }) => {
            const bal = amiBalanceLabel(balance);
            return (
              <div
                key={ami.id}
                onClick={() => onOpenAmi(ami.id)}
                className="tap"
                style={{
                  background: colors.card,
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: 18,
                  padding: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: ami.couleur,
                    color: colors.neutralIcon,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {ami.nom[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>{ami.nom}</div>
                  <div style={{ fontSize: 12, color: bal.color, marginTop: 3 }}>{bal.text}</div>
                </div>
                <ChevronRight size={16} color={colors.textFaint} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
