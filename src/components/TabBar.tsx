"use client";

import { colors } from "@/lib/theme";
import type { Tab } from "@/lib/types";

const TAB_DEFS: { key: Tab; label: string }[] = [
  { key: "dashboard", label: "Accueil" },
  { key: "accounts", label: "Comptes" },
  { key: "budgets", label: "Budgets" },
  { key: "insights", label: "Insights" },
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
          return (
            <div key={t.key} onClick={() => onTab(t.key)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: active ? colors.accentGreen : colors.textFaint }} />
              <div style={{ fontSize: 10.5, color: active ? colors.textPrimary : colors.textFaint, fontWeight: active ? 700 : 500 }}>{t.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
