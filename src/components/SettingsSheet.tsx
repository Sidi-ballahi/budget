"use client";

import { useEffect, useState } from "react";
import { Bell, Download, Fingerprint, Moon, Settings as SettingsIcon, Sun, X } from "lucide-react";
import { applyTheme, colors, getStoredThemeMode, type ThemeMode } from "@/lib/theme";
import { downloadTransactionsCsv } from "@/lib/csv";
import { notificationsEnabled, requestNotificationPermission, setNotificationsEnabled } from "@/lib/notifications";
import { browserSupportsWebAuthn, hasRegisteredPasskey, registerPasskey } from "@/lib/webauthn";
import type { Account, Category, Transaction } from "@/lib/types";

export function SettingsSheet({
  transactions,
  categories,
  accounts,
  onClose,
}: {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onClose: () => void;
}) {
  const [notifOn, setNotifOn] = useState(() => notificationsEnabled());
  const [notifError, setNotifError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredThemeMode());
  const [hasPasskey, setHasPasskey] = useState(false);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const webauthnSupported = browserSupportsWebAuthn();

  useEffect(() => {
    if (webauthnSupported) void hasRegisteredPasskey().then(setHasPasskey);
  }, [webauthnSupported]);

  function chooseTheme(mode: ThemeMode) {
    applyTheme(mode);
    setTheme(mode);
  }

  async function addPasskey() {
    setPasskeyBusy(true);
    setPasskeyError(null);
    const result = await registerPasskey();
    setPasskeyBusy(false);
    if (result.ok) setHasPasskey(true);
    else setPasskeyError(result.error);
  }

  async function toggleNotifications() {
    if (notifOn) {
      setNotificationsEnabled(false);
      setNotifOn(false);
      return;
    }
    const granted = await requestNotificationPermission();
    if (!granted) {
      setNotifError("Notifications refusées ou indisponibles sur cet appareil.");
      return;
    }
    setNotifError(null);
    setNotificationsEnabled(true);
    setNotifOn(true);
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "oklch(0 0 0 / 0.5)", backdropFilter: "blur(2px)", zIndex: 20, animation: "backdropIn 0.22s ease" }} />
      <div
        className="glass-sheet"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: "88%",
          overflow: "auto",
          animation: "sheetUp 0.32s cubic-bezier(0.32,0.72,0,1)",
          borderRadius: "26px 26px 0 0",
          zIndex: 21,
          boxSizing: "border-box",
          padding: "14px 18px calc(env(safe-area-inset-bottom, 0px) + 28px)",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 100, background: colors.white15, alignSelf: "center", margin: "0 auto 16px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SettingsIcon size={18} color={colors.textSecondary} />
            <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>Réglages</div>
          </div>
          <div
            onClick={onClose}
            className="tap glass"
            style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: colors.textMuted, cursor: "pointer" }}
          >
            <X size={14} />
          </div>
        </div>

        <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>THÈME</div>
        <div className="glass" style={{ display: "flex", gap: 6, borderRadius: 12, padding: 4, marginBottom: 18 }}>
          {(
            [
              { key: "dark" as const, label: "Sombre", Icon: Moon },
              { key: "light" as const, label: "Clair", Icon: Sun },
            ]
          ).map(({ key, label, Icon }) => (
            <div
              key={key}
              onClick={() => chooseTheme(key)}
              className="tap"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "9px 0",
                borderRadius: 9,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
                background: theme === key ? colors.accentGreen : "transparent",
                color: theme === key ? colors.neutralIcon : colors.textMuted,
              }}
            >
              <Icon size={14} />
              {label}
            </div>
          ))}
        </div>

        {webauthnSupported && (
          <>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>SÉCURITÉ</div>
            <div
              onClick={hasPasskey ? undefined : addPasskey}
              className="tap glass"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderRadius: 14,
                padding: "13px 14px",
                marginBottom: passkeyError ? 8 : 18,
                cursor: hasPasskey ? "default" : "pointer",
              }}
            >
              <Fingerprint size={16} color={colors.accentGreen} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: colors.textSecondary }}>
                  {hasPasskey ? "Face ID / Touch ID activé" : "Activer Face ID / Touch ID"}
                </div>
                <div style={{ fontSize: 11, color: colors.textFaint }}>
                  {hasPasskey
                    ? "Le code reste disponible en secours"
                    : "Déverrouillage biométrique en plus du code"}
                </div>
              </div>
              {passkeyBusy && <div style={{ fontSize: 11, color: colors.textFaint }}>…</div>}
            </div>
            {passkeyError && <div style={{ fontSize: 11.5, color: colors.accentRed, marginBottom: 18 }}>{passkeyError}</div>}
          </>
        )}

        <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>RAPPELS</div>
        <div
          onClick={toggleNotifications}
          className="tap glass"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderRadius: 14,
            padding: "13px 14px",
            marginBottom: notifError ? 8 : 18,
            cursor: "pointer",
          }}
        >
          <Bell size={16} color={colors.accentGold} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: colors.textSecondary }}>Notifications</div>
            <div style={{ fontSize: 11, color: colors.textFaint }}>Échéances à venir et budgets dépassés, quand l&apos;app est ouverte</div>
          </div>
          <div
            style={{
              width: 40,
              height: 24,
              borderRadius: 100,
              flexShrink: 0,
              background: notifOn ? colors.accentGreen : colors.white15,
              position: "relative",
              transition: "background 0.2s ease",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 3,
                left: notifOn ? 19 : 3,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: colors.textPrimary,
                transition: "left 0.2s cubic-bezier(0.32,0.72,0,1)",
              }}
            />
          </div>
        </div>
        {notifError && <div style={{ fontSize: 11.5, color: colors.accentRed, marginBottom: 18 }}>{notifError}</div>}

        <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>DONNÉES</div>
        <div
          onClick={() => downloadTransactionsCsv(transactions, categories, accounts)}
          className="tap glass"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderRadius: 14,
            padding: "13px 14px",
            marginBottom: 18,
            cursor: "pointer",
          }}
        >
          <Download size={16} color={colors.accentGreen} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: colors.textSecondary }}>Exporter en CSV</div>
            <div style={{ fontSize: 11, color: colors.textFaint }}>Toutes les transactions, pour Excel ou une sauvegarde</div>
          </div>
        </div>
      </div>
    </>
  );
}
