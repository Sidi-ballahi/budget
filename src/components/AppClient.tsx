"use client";

import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/hooks/useAuth";
import { LockScreen } from "./LockScreen";
import { MainApp } from "./MainApp";

export function AppClient() {
  const data = useAppData();
  const auth = useAuth(data.settings);

  return (
    <div className="app-bg" style={{ maxWidth: 480, margin: "0 auto", height: "100dvh", position: "relative", overflow: "hidden" }}>
      {auth.isLocked || auth.mode === "loading" ? (
        <LockScreen mode={auth.mode} pinEntry={auth.pinEntry} pinError={auth.pinError} onChange={auth.handlePinInput} />
      ) : (
        <MainApp data={data} />
      )}
    </div>
  );
}
