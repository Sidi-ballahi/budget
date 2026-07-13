"use client";

import { colors } from "@/lib/theme";

const KEY_LABELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

export function LockScreen({
  mode,
  pinEntry,
  pinError,
  onDigit,
  onDelete,
}: {
  mode: "loading" | "create" | "confirm" | "enter";
  pinEntry: string;
  pinError: boolean;
  onDigit: (d: string) => void;
  onDelete: () => void;
}) {
  const subtitle =
    mode === "create" ? "Créez votre code" : mode === "confirm" ? "Confirmez votre code" : "Entrez votre code";

  return (
    <div
      style={{
        height: "100%",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        boxSizing: "border-box",
        padding: `calc(env(safe-area-inset-top, 0px) + 56px) 24px calc(env(safe-area-inset-bottom, 0px) + 40px)`,
        background: colors.bg,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: colors.accentGold,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 800,
            color: colors.neutralIcon,
          }}
        >
          D
        </div>
        <div style={{ marginTop: 14, fontSize: 15, color: colors.textMuted }}>Dépenses</div>
        <div style={{ fontSize: 14, color: colors.textFaint }}>{subtitle}</div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          animation: pinError ? "shake 0.4s" : undefined,
        }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: i < pinEntry.length ? colors.accentGreen : colors.white15,
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 13, color: colors.accentRed, height: 16 }}>
          {pinError ? "Code incorrect, réessayez" : ""}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 72px)",
          gap: "18px 22px",
          justifyContent: "center",
        }}
      >
        {KEY_LABELS.map((label, i) => {
          if (label === "") return <div key={i} style={{ width: 72, height: 72 }} />;
          const isDel = label === "del";
          return (
            <div
              key={i}
              onClick={() => (isDel ? onDelete() : onDigit(label))}
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isDel ? 20 : 26,
                fontWeight: 600,
                color: colors.textSecondary,
                background: colors.white5,
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {isDel ? "⌫" : label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
