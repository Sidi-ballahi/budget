"use client";

import { CalendarClock, Home, Sparkles, Users, Wallet, PiggyBank } from "lucide-react";
import { colors } from "@/lib/theme";
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
        style={{
          pointerEvents: "auto",
          position: "relative",
          bottom: -14,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: colors.accentGold,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          fontWeight: 700,
          color: colors.neutralIcon,
          boxShadow: "0 8px 20px oklch(0.78 0.13 80 / 0.4)",
          cursor: "pointer",
          zIndex: 3,
        }}
      >
        +
      </div>
      <div
        style={{
          pointerEvents: "auto",
          width: "100%",
          background: "oklch(0.16 0.012 60 / 0.92)",
          backdropFilter: "blur(16px)",
          borderTop: `1px solid ${colors.white6}`,
          display: "flex",
          padding: `14px 8px calc(env(safe-area-inset-bottom, 0px) + 30px)`,
          boxSizing: "border-box",
        }}
      >
        {TAB_DEFS.map((t) => {
          const active = tab === t.key;
          const Icon = t.Icon;
          return (
            <div key={t.key} onClick={() => onTab(t.key)} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer" }}>
              <Icon size={19} color={active ? colors.accentGreen : colors.textFaint} strokeWidth={active ? 2.4 : 2} />
              <div style={{ fontSize: 10, color: active ? colors.textPrimary : colors.textFaint, fontWeight: active ? 700 : 500, whiteSpace: "nowrap" }}>{t.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
