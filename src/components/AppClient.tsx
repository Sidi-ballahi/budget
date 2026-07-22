"use client";

import { useEffect, useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { applyTheme, getStoredThemeMode, THEME_CHANGE_EVENT } from "@/lib/theme";
import { LockScreen } from "./LockScreen";
import { MainApp } from "./MainApp";

export function AppClient() {
  const data = useAppData();
  const auth = useAuth(data.settings);
  const [, forceRerender] = useState(0);

  useEffect(() => {
    applyTheme(getStoredThemeMode());
    const onChange = () => forceRerender((v) => v + 1);
    window.addEventListener(THEME_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  }, []);

  return (
    <div className="app-bg" style={{ maxWidth: 480, margin: "0 auto", height: "100dvh", position: "relative", overflow: "hidden" }}>
      {auth.isLocked || auth.mode === "loading" ? (
        <LockScreen
          mode={auth.mode}
          pinEntry={auth.pinEntry}
          pinError={auth.pinError}
          onChange={auth.handlePinInput}
          onUnlockBiometric={auth.unlockBiometric}
        />
      ) : (
        <MainApp data={data} />
      )}
    </div>
  );
}
