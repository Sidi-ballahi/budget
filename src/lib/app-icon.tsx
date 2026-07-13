import { ImageResponse } from "next/og";

// Renders the same gold "D" mark used on the lock screen (LockScreen.tsx),
// scaled to whatever icon size Next/the manifest asks for.
export function renderAppIcon(size: number) {
  const radius = Math.round(size * 0.28);
  const fontSize = Math.round(size * 0.5);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c1a16",
        }}
      >
        <div
          style={{
            width: Math.round(size * 0.86),
            height: Math.round(size * 0.86),
            borderRadius: radius,
            background: "#e8c766",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize,
            fontWeight: 800,
            color: "#26241f",
            fontFamily: "sans-serif",
          }}
        >
          D
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
