import Dexie, { type EntityTable } from "dexie";
import type { Account, Category, Settings, Transaction } from "./types";

export interface LocalBudget {
  id: string;
  categorieId: string;
  montantLimite: number;
  seuilAlerte: number;
}

export interface LocalSettings extends Settings {
  id: 1;
}

class DepensesDB extends Dexie {
  accounts!: EntityTable<Account, "id">;
  categories!: EntityTable<Category, "id">;
  budgets!: EntityTable<LocalBudget, "id">;
  transactions!: EntityTable<Transaction, "clientId">;
  settings!: EntityTable<LocalSettings, "id">;

  constructor() {
    super("depenses-db");
    this.version(1).stores({
      accounts: "id",
      categories: "id",
      budgets: "id, categorieId",
      transactions: "clientId, date, compteId, synced",
      settings: "id",
    });
  }
}

export const db = new DepensesDB();
