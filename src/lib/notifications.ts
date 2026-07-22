import type { BudgetProgress, Category, Echeance } from "./types";

const PREF_KEY = "depenses:notifications-enabled";
const SEEN_KEY = "depenses:notifications-seen";

export function notificationsEnabled(): boolean {
  return typeof localStorage !== "undefined" && localStorage.getItem(PREF_KEY) === "1";
}

export function setNotificationsEnabled(enabled: boolean): void {
  localStorage.setItem(PREF_KEY, enabled ? "1" : "0");
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function seenToday(): Set<string> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "{}");
    return new Set(raw.date === today ? raw.ids : []);
  } catch {
    return new Set();
  }
}

function markSeen(ids: Set<string>): void {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(SEEN_KEY, JSON.stringify({ date: today, ids: [...ids] }));
}

// Fires a browser Notification (only while the app is open — there is no
// push server here, see AGENTS.md discussion) for echeances due within a day
// and budgets crossing their alert threshold. Each id notifies at most once
// per calendar day, tracked in localStorage.
export function checkAndNotify(echeances: Echeance[], budgets: BudgetProgress[], categories: Category[]): void {
  if (!notificationsEnabled()) return;
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

  const seen = seenToday();
  const newlySeen = new Set(seen);
  const in24h = Date.now() + 24 * 60 * 60 * 1000;

  for (const e of echeances) {
    if (!e.actif) continue;
    const id = `echeance:${e.id}`;
    if (seen.has(id)) continue;
    if (new Date(e.prochaineDate).getTime() > in24h) continue;
    new Notification("Échéance à venir", {
      body: `${e.nom} · ${e.montant} MRU`,
      tag: id,
    });
    newlySeen.add(id);
  }

  for (const b of budgets) {
    if (!b.limiteEffective || b.spent / b.limiteEffective < b.seuilAlerte / 100) continue;
    const id = `budget:${b.id}`;
    if (seen.has(id)) continue;
    const catName = categories.find((c) => c.id === b.categorieId)?.nom ?? "Budget";
    const over = b.spent > b.limiteEffective;
    new Notification(over ? "Budget dépassé" : "Budget bientôt atteint", {
      body: `${catName} : ${b.spent} / ${b.limiteEffective} MRU`,
      tag: id,
    });
    newlySeen.add(id);
  }

  if (newlySeen.size !== seen.size) markSeen(newlySeen);
}
