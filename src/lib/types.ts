export type AccountType = "banque" | "cash";
export type TransactionType = "depense" | "revenu" | "transfert";
export type CategoryType = "depense" | "revenu";
export type Tab = "dashboard" | "accounts" | "budgets" | "insights";

export interface Account {
  id: string;
  nom: string;
  type: AccountType;
  couleur: string;
  devise: string;
  actif: boolean;
  soldeInitial: number;
  solde: number;
}

export interface Category {
  id: string;
  nom: string;
  type: CategoryType;
  couleur: string;
  icone: string | null;
  keywords: string[];
}

export interface Transaction {
  id: string;
  compteId: string;
  compteDestinationId: string | null;
  type: TransactionType;
  montant: number;
  categorieId: string | null;
  libelle: string | null;
  date: string; // ISO
  synced: boolean;
  creeHorsLigne: boolean;
  clientId: string | null;
}

export interface BudgetProgress {
  id: string;
  categorieId: string;
  montantLimite: number;
  seuilAlerte: number;
  spent: number;
}

export interface Settings {
  accentColor: string;
  aiSuggestions: boolean;
  autoLockMinutes: number;
  pinHash: string;
  pinSalt: string;
}

export interface TrendPoint {
  label: string;
  balance: number;
}

export interface Insights {
  resume: string;
  anomalies: { title: string; detail: string }[];
  prevision: string;
  source: "ai" | "local";
  generatedAt: string;
}

export interface Bootstrap {
  accounts: Account[];
  categories: Category[];
  budgets: BudgetProgress[];
  transactions: Transaction[];
  settings: Settings;
  trend: TrendPoint[];
}

export interface NewTransactionInput {
  clientId: string;
  type: TransactionType;
  montant: number;
  compteId: string;
  compteDestinationId?: string | null;
  categorieId?: string | null;
  libelle?: string | null;
  date: string;
  creeHorsLigne?: boolean;
}

export interface NewAccountInput {
  nom: string;
  type: AccountType;
  soldeInitial: number;
  couleur: string;
  devise?: string;
}

export interface NewBudgetInput {
  categorieId: string;
  montantLimite: number;
  seuilAlerte?: number;
}

export interface NewCategoryInput {
  nom: string;
  type: CategoryType;
  couleur: string;
  icone?: string | null;
}
