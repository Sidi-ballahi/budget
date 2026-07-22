import Dexie, { type EntityTable } from "dexie";
import type { Account, Ami, Category, Echeance, PretMouvement, Projet, ProjetContribution, Settings, Transaction } from "./types";

export interface LocalBudget {
  id: string;
  categorieId: string;
  montantLimite: number;
  seuilAlerte: number;
  reporter: boolean;
}

export interface LocalSettings extends Settings {
  id: 1;
}

class DepensesDB extends Dexie {
  accounts!: EntityTable<Account, "id">;
  categories!: EntityTable<Category, "id">;
  budgets!: EntityTable<LocalBudget, "id">;
  transactions!: EntityTable<Transaction, "clientId">;
  echeances!: EntityTable<Echeance, "id">;
  amis!: EntityTable<Ami, "id">;
  prets!: EntityTable<PretMouvement, "id">;
  projets!: EntityTable<Projet, "id">;
  contributions!: EntityTable<ProjetContribution, "id">;
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
    this.version(2).stores({
      echeances: "id, prochaineDate",
      amis: "id",
      prets: "id, amiId, date",
    });
    this.version(3).stores({
      projets: "id",
      contributions: "id, projetId, date",
    });
    this.version(4).stores({
      transactions: "clientId, date, compteId, synced, *tags",
    });
  }
}

export const db = new DepensesDB();
