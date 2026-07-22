"use client";

import { useEffect, useRef, useState } from "react";
import { Fingerprint } from "lucide-react";
import { colors, glow } from "@/lib/theme";
import { authenticateWithPasskey, browserSupportsWebAuthn, hasRegisteredPasskey } from "@/lib/webauthn";

export function LockScreen({
  mode,
  pinEntry,
  pinError,
  onChange,
  onUnlockBiometric,
}: {
  mode: "loading" | "create" | "confirm" | "enter";
  pinEntry: string;
  pinError: boolean;
  onChange: (value: string) => void;
  onUnlockBiometric: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const subtitle =
    mode === "create" ? "Créez votre code" : mode === "confirm" ? "Confirmez votre code" : "Entrez votre code";
  const [canBiometric, setCanBiometric] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);
  const autoTriedRef = useRef(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    if (mode !== "enter" || !browserSupportsWebAuthn()) return;
    let cancelled = false;
    hasRegisteredPasskey().then((has) => {
      if (!cancelled) setCanBiometric(has);
    });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  async function tryBiometric() {
    setBiometricBusy(true);
    setBiometricError(null);
    const result = await authenticateWithPasskey();
    setBiometricBusy(false);
    if (result.ok) onUnlockBiometric();
    else setBiometricError(result.error);
  }

  // Auto-prompt once per lock screen appearance, like iOS apps do — the user
  // can still tap the button below to retry if they dismiss the system sheet.
  useEffect(() => {
    if (canBiometric && !autoTriedRef.current) {
      autoTriedRef.current = true;
      void tryBiometric();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canBiometric]);

  return (
    <div
      className="app-bg"
      onClick={() => inputRef.current?.focus()}
      style={{
        height: "100%",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 64,
        boxSizing: "border-box",
        padding: `calc(env(safe-area-inset-top, 0px) + 56px) 24px calc(env(safe-area-inset-bottom, 0px) + 40px)`,
      }}
    >
      <input
        ref={inputRef}
        value={pinEntry}
        onChange={(e) => onChange(e.target.value)}
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        autoFocus
        maxLength={4}
        aria-label="Code"
        style={{
          position: "absolute",
          opacity: 0,
          width: 1,
          height: 1,
          fontSize: 16,
          border: "none",
          outline: "none",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: `linear-gradient(155deg, oklch(0.85 0.14 80), ${colors.accentGold})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 800,
            color: colors.neutralIcon,
            boxShadow: `${glow(colors.accentGold, 0.5)}, inset 0 1px 0 oklch(1 0 0 / 0.5)`,
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
                boxShadow: i < pinEntry.length ? glow(colors.accentGreen, 0.6) : "none",
                transition: "background 0.15s ease, box-shadow 0.15s ease",
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 13, color: colors.accentRed, height: 16 }}>
          {pinError ? "Code incorrect, réessayez" : ""}
        </div>
      </div>

      {canBiometric && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              void tryBiometric();
            }}
            className="tap glass"
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colors.accentGreen,
              cursor: "pointer",
            }}
          >
            <Fingerprint size={24} />
          </div>
          <div style={{ fontSize: 12, color: colors.textFaint }}>
            {biometricBusy ? "Vérification…" : "Déverrouiller avec Face ID / Touch ID"}
          </div>
          {biometricError && <div style={{ fontSize: 11.5, color: colors.accentRed }}>{biometricError}</div>}
        </div>
      )}
    </div>
  );
}
