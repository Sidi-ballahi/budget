"use client";

import { colors, glow } from "@/lib/theme";

export function Toast({ message }: { message: string }) {
  return (
    <div
      className="glass"
      style={{
        position: "absolute",
        left: "50%",
        bottom: 110,
        transform: "translateX(-50%)",
        background: `linear-gradient(155deg, oklch(0.3 0.03 150 / 0.65), oklch(0.18 0.02 150 / 0.85))`,
        color: colors.textPrimary,
        fontSize: 13,
        fontWeight: 600,
        padding: "10px 18px",
        borderRadius: 100,
        zIndex: 30,
        boxShadow: `0 8px 24px oklch(0 0 0 / 0.4), ${glow(colors.accentGreen, 0.25)}`,
        animation: "fadeUp 0.25s ease",
        whiteSpace: "nowrap",
      }}
    >
      {message}
    </div>
  );
}
