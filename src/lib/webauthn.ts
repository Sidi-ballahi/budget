import { browserSupportsWebAuthn, startAuthentication, startRegistration } from "@simplewebauthn/browser";

export { browserSupportsWebAuthn };

export async function hasRegisteredPasskey(): Promise<boolean> {
  try {
    const res = await fetch("/api/webauthn/auth-options");
    return res.ok;
  } catch {
    return false;
  }
}

export async function registerPasskey(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const optionsRes = await fetch("/api/webauthn/register-options");
    if (!optionsRes.ok) return { ok: false, error: "Impossible de démarrer l'enregistrement" };
    const options = await optionsRes.json();
    const response = await startRegistration({ optionsJSON: options });
    const verifyRes = await fetch("/api/webauthn/register-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response, deviceName: navigator.userAgent.slice(0, 60) }),
    });
    if (!verifyRes.ok) return { ok: false, error: "Vérification refusée par le serveur" };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Annulé" };
  }
}

export async function authenticateWithPasskey(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const optionsRes = await fetch("/api/webauthn/auth-options");
    if (!optionsRes.ok) return { ok: false, error: "Aucune clé d'accès enregistrée" };
    const options = await optionsRes.json();
    const response = await startAuthentication({ optionsJSON: options });
    const verifyRes = await fetch("/api/webauthn/auth-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    });
    if (!verifyRes.ok) return { ok: false, error: "Vérification refusée" };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Annulé" };
  }
}
