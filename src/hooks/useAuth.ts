"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "@/lib/db";
import { hashPin, verifyPin } from "@/lib/pin";
import type { LocalSettings } from "@/lib/db";

type Mode = "loading" | "create" | "confirm" | "enter";

export function useAuth(settings: LocalSettings | undefined) {
  const [isLocked, setIsLocked] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [pinEntry, setPinEntry] = useState("");
  const [pinError, setPinError] = useState(false);
  const [pendingNewPin, setPendingNewPin] = useState("");
  const lastActivity = useRef(0);

  const baseMode: "loading" | "create" | "enter" = !settings ? "loading" : settings.pinHash ? "enter" : "create";
  const mode: Mode = confirming ? "confirm" : baseMode;

  const bump = useCallback(() => {
    lastActivity.current = Date.now();
  }, []);

  useEffect(() => {
    if (isLocked) return;
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const minutes = settings?.autoLockMinutes ?? 2;
    const interval = window.setInterval(() => {
      if (Date.now() - lastActivity.current > minutes * 60_000) {
        setIsLocked(true);
        setPinEntry("");
      }
    }, 15_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, bump));
      window.clearInterval(interval);
    };
  }, [isLocked, settings, bump]);

  const finishCreate = useCallback(
    async (pin: string) => {
      const { hash, salt } = await hashPin(pin);
      await db.settings.put({
        id: 1,
        accentColor: settings?.accentColor ?? "oklch(0.72 0.14 150)",
        aiSuggestions: settings?.aiSuggestions ?? true,
        autoLockMinutes: settings?.autoLockMinutes ?? 2,
        pinHash: hash,
        pinSalt: salt,
      });
      fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinHash: hash, pinSalt: salt }),
      }).catch(() => {});
      setConfirming(false);
      setIsLocked(false);
      setPinEntry("");
      bump();
    },
    [settings, bump]
  );

  const handlePinInput = useCallback(
    (raw: string) => {
      const next = raw.replace(/\D/g, "").slice(0, 4);
      setPinEntry(next);
      setPinError(false);
      if (next.length !== 4) return;

      window.setTimeout(async () => {
        if (mode === "create") {
          setPendingNewPin(next);
          setConfirming(true);
          setPinEntry("");
        } else if (mode === "confirm") {
          if (next === pendingNewPin) {
            await finishCreate(next);
          } else {
            setPinError(true);
            setPinEntry("");
            setConfirming(false);
            setPendingNewPin("");
          }
        } else {
          const ok = settings ? await verifyPin(next, settings.pinHash, settings.pinSalt) : false;
          if (ok) {
            setIsLocked(false);
            setPinEntry("");
            bump();
          } else {
            setPinError(true);
            setPinEntry("");
          }
        }
      }, 150);
    },
    [mode, pendingNewPin, settings, finishCreate, bump]
  );

  const lock = useCallback(() => {
    setIsLocked(true);
    setPinEntry("");
  }, []);

  return { isLocked, mode, pinEntry, pinError, handlePinInput, lock };
}
