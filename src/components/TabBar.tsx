"use client";

import { CalendarClock, Home, Sparkles, Users, Wallet, PiggyBank } from "lucide-react";
import { colors, glassBorder, glow } from "@/lib/theme";
import type { Tab } from "@/lib/types";

const TAB_DEFS: { key: Tab; label: string; Icon: typeof Home }[] = [
  { key: "dashboard", label: "Accueil", Icon: Home },
  { key: "accounts", label: "Comptes", Icon: Wallet },
  { key: "budgets", label: "Budgets", Icon: PiggyBank },
  { key: "planned", label: "Prévu", Icon: CalendarClock },
  { key: "friends", label: "Amis", Icon: Users },
  { key: "insights", label: "Insights", Icon: Sparkles },
];

export function TabBar({ tab, onTab, onAdd }: { tab: Tab; onTab: (t: Tab) => void; onAdd: () => void }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
      <div
        onClick={onAdd}
        className="tap"
        style={{
          pointerEvents: "auto",
          position: "relative",
          bottom: -14,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: `linear-gradient(155deg, oklch(0.85 0.14 80), ${colors.accentGold})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          fontWeight: 700,
          color: colors.neutralIcon,
          boxShadow: `${glow(colors.accentGold, 0.55)}, inset 0 1px 0 oklch(1 0 0 / 0.5)`,
          cursor: "pointer",
          zIndex: 3,
        }}
      >
        +
      </div>
      <div
        className="glass-bar"
        style={{
          pointerEvents: "auto",
          width: "100%",
          display: "flex",
          padding: `14px 8px calc(env(safe-area-inset-bottom, 0px) + 30px)`,
          boxSizing: "border-box",
        }}
      >
        {TAB_DEFS.map((t) => {
          const active = tab === t.key;
          const Icon = t.Icon;
          return (
            <div
              key={t.key}
              onClick={() => onTab(t.key)}
              className="tap"
              style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer" }}
            >
              <div
                style={{
                  width: 30,
                  height: 22,
                  borderRadius: 9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: active ? glassBorder(colors.accentGreen, 0.16) : "transparent",
                  transition: "background 0.2s ease",
                }}
              >
                <Icon
                  size={19}
                  color={active ? colors.accentGreen : colors.textFaint}
                  strokeWidth={active ? 2.4 : 2}
                  style={{ transition: "color 0.2s ease, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)", transform: active ? "scale(1.08)" : "scale(1)" }}
                />
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: active ? colors.textPrimary : colors.textFaint,
                  fontWeight: active ? 700 : 500,
                  whiteSpace: "nowrap",
                  transition: "color 0.2s ease",
                }}
              >
                {t.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
