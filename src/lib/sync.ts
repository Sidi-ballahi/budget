import { db, type LocalBudget } from "./db";
import type {
  Account,
  Ami,
  Bootstrap,
  Category,
  Echeance,
  NewAccountInput,
  NewAmiInput,
  NewBudgetInput,
  NewCategoryInput,
  NewEcheanceInput,
  NewPretInput,
  NewTransactionInput,
  PretMouvement,
  Transaction,
} from "./types";

export function newClientId(): string {
  return crypto.randomUUID();
}

export async function hydrateFromServer(): Promise<Bootstrap | null> {
  try {
    const res = await fetch("/api/bootstrap");
    if (!res.ok) return null;
    const data: Bootstrap = await res.json();

    await db.transaction("rw", [db.accounts, db.categories, db.budgets, db.echeances, db.amis, db.prets, db.settings], async () => {
      await db.accounts.bulkPut(data.accounts);
      await db.categories.bulkPut(data.categories);
      const budgets: LocalBudget[] = data.budgets.map((b) => ({
        id: b.id,
        categorieId: b.categorieId,
        montantLimite: b.montantLimite,
        seuilAlerte: b.seuilAlerte,
      }));
      await db.budgets.bulkPut(budgets);
      // Server is the source of truth for these (no offline queue): replace.
      await db.echeances.clear();
      await db.echeances.bulkPut(data.echeances ?? []);
      await db.amis.clear();
      await db.amis.bulkPut(data.amis ?? []);
      await db.prets.clear();
      await db.prets.bulkPut(data.prets ?? []);
      await db.settings.put({ id: 1, ...data.settings });
    });

    // Merge server transactions with any not-yet-synced local ones (avoid
    // clobbering an offline write that hasn't reached the server yet).
    const pending = (await db.transactions.toArray()).filter((t) => !t.synced);
    const pendingIds = new Set(pending.map((t) => t.clientId));
    await db.transactions.bulkPut(data.transactions.filter((t) => !pendingIds.has(t.clientId ?? "")));

    return data;
  } catch {
    return null;
  }
}

export async function addTransaction(input: NewTransactionInput): Promise<Transaction> {
  const local: Transaction = {
    id: input.clientId,
    compteId: input.compteId,
    compteDestinationId: input.compteDestinationId ?? null,
    type: input.type,
    montant: input.montant,
    categorieId: input.categorieId ?? null,
    libelle: input.libelle ?? null,
    date: input.date,
    synced: false,
    creeHorsLigne: !navigator.onLine,
    clientId: input.clientId,
  };
  await db.transactions.put(local);
  void flushQueue();
  return local;
}

// Accounts and budgets are setup actions taken while online — unlike
// transactions they have no offline queue, so a failure surfaces immediately
// to the caller instead of being retried silently later.
export async function addAccount(input: NewAccountInput): Promise<Account> {
  const res = await fetch("/api/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Impossible de créer le compte");
  const { account } = (await res.json()) as { account: Account };
  await db.accounts.put(account);
  return account;
}

export async function addBudget(input: NewBudgetInput): Promise<LocalBudget> {
  const res = await fetch("/api/budgets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(typeof body?.error === "string" ? body.error : "Impossible de créer le budget");
  }
  const { budget } = (await res.json()) as { budget: LocalBudget };
  await db.budgets.put(budget);
  return budget;
}

export async function addCategory(input: NewCategoryInput): Promise<Category> {
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Impossible de créer la catégorie");
  const { category } = (await res.json()) as { category: Category };
  await db.categories.put(category);
  return category;
}

export async function addEcheance(input: NewEcheanceInput): Promise<Echeance> {
  const res = await fetch("/api/echeances", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Impossible de créer l'échéance");
  const { echeance } = (await res.json()) as { echeance: Echeance };
  await db.echeances.put(echeance);
  return echeance;
}

// Marks an echeance as paid: the server creates the real transaction and
// advances prochaineDate (or deactivates a one-off prevision).
export async function payerEcheance(id: string): Promise<Echeance> {
  const res = await fetch("/api/echeances/payer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, clientId: newClientId(), date: new Date().toISOString() }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(typeof body?.error === "string" ? body.error : "Impossible d'enregistrer le paiement");
  }
  const { echeance, transaction } = (await res.json()) as { echeance: Echeance; transaction: Transaction };
  await db.transactions.put(transaction);
  await db.echeances.put(echeance);
  return echeance;
}

export async function addAmi(input: NewAmiInput): Promise<Ami> {
  const res = await fetch("/api/amis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Impossible d'ajouter l'ami");
  const { ami } = (await res.json()) as { ami: Ami };
  await db.amis.put(ami);
  return ami;
}

export async function addPret(input: NewPretInput): Promise<PretMouvement> {
  const res = await fetch("/api/prets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Impossible d'enregistrer le mouvement");
  const { pret, transaction } = (await res.json()) as { pret: PretMouvement; transaction: Transaction | null };
  if (transaction) await db.transactions.put(transaction);
  await db.prets.put(pret);
  return pret;
}

let flushing = false;

export async function flushQueue(): Promise<void> {
  if (flushing || typeof navigator === "undefined" || !navigator.onLine) return;
  flushing = true;
  try {
    const pending = (await db.transactions.toArray()).filter((t) => !t.synced);
    if (!pending.length) return;
    const res = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactions: pending.map((t) => ({
          clientId: t.clientId,
          type: t.type,
          montant: t.montant,
          compteId: t.compteId,
          compteDestinationId: t.compteDestinationId,
          categorieId: t.categorieId,
          libelle: t.libelle,
          date: t.date,
          creeHorsLigne: t.creeHorsLigne,
        })),
      }),
    });
    if (!res.ok) return;
    const { results } = await res.json();
    await db.transaction("rw", db.transactions, async () => {
      for (const r of results as { clientId: string; ok: boolean; transaction?: Transaction }[]) {
        // Trust the server's own `synced` value rather than assuming a
        // successful round-trip means synced — a record can exist server-side
        // and still be marked unsynced (e.g. still pending confirmation).
        if (r.ok && r.transaction) await db.transactions.update(r.clientId, { synced: r.transaction.synced });
      }
    });
  } catch {
    // stay queued; will retry on next online event
  } finally {
    flushing = false;
  }
}

export function setupAutoSync(): () => void {
  const onOnline = () => void flushQueue();
  window.addEventListener("online", onOnline);
  void flushQueue();
  return () => window.removeEventListener("online", onOnline);
}
