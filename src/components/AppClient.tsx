"use client";

import { colors } from "@/lib/theme";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { LockScreen } from "./LockScreen";
import { MainApp } from "./MainApp";

export function AppClient() {
  const data = useAppData();
  const auth = useAuth(data.settings);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", height: "100dvh", background: colors.bg, position: "relative", overflow: "hidden" }}>
      {auth.isLocked || auth.mode === "loading" ? (
        <LockScreen mode={auth.mode} pinEntry={auth.pinEntry} pinError={auth.pinError} onDigit={auth.pressDigit} onDelete={auth.pressDelete} />
      ) : (
        <MainApp data={data} />
      )}
    </div>
  );
}
