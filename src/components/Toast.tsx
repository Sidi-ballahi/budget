"use client";

export function Toast({ message }: { message: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: 110,
        transform: "translateX(-50%)",
        background: "oklch(0.95 0.01 70)",
        color: "oklch(0.15 0.02 60)",
        fontSize: 13,
        fontWeight: 600,
        padding: "10px 18px",
        borderRadius: 100,
        zIndex: 30,
        boxShadow: "0 8px 20px oklch(0 0 0 / 0.3)",
        animation: "fadeUp 0.25s ease",
        whiteSpace: "nowrap",
      }}
    >
      {message}
    </div>
  );
}
