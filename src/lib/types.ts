export type AccountType = "banque" | "cash";
export type TransactionType = "depense" | "revenu" | "transfert";
export type CategoryType = "depense" | "revenu";
export type Recurrence = "ponctuel" | "hebdomadaire" | "mensuel" | "annuel";
export type PretDirection = "donne" | "recu";
export type ContributionSens = "verse" | "retire";
export type Tab = "dashboard" | "accounts" | "budgets" | "planned" | "friends" | "insights";

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
  tags: string[];
  justificatif: string | null; // base64 data URL of a compressed receipt photo
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
  reporter: boolean;
  spent: number;
  limiteEffective: number; // montantLimite, adjusted by the previous month's reliquat when reporter is on
}

export interface Echeance {
  id: string;
  nom: string;
  type: CategoryType;
  montant: number;
  recurrence: Recurrence;
  prochaineDate: string; // ISO
  compteId: string | null;
  categorieId: string | null;
  actif: boolean;
}

export interface Ami {
  id: string;
  nom: string;
  couleur: string;
}

export interface PretMouvement {
  id: string;
  amiId: string;
  direction: PretDirection;
  montant: number;
  note: string | null;
  date: string; // ISO
  compteId: string | null;
  transactionId: string | null;
}

export interface Projet {
  id: string;
  nom: string;
  couleur: string;
  montantCible: number;
  dateCible: string | null; // ISO
  actif: boolean;
}

export interface ProjetContribution {
  id: string;
  projetId: string;
  sens: ContributionSens;
  montant: number;
  note: string | null;
  date: string; // ISO
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
  echeances: Echeance[];
  amis: Ami[];
  prets: PretMouvement[];
  projets: Projet[];
  contributions: ProjetContribution[];
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
  tags?: string[];
  justificatif?: string | null;
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
  reporter?: boolean;
}

export interface NewCategoryInput {
  nom: string;
  type: CategoryType;
  couleur: string;
  icone?: string | null;
}

export interface NewEcheanceInput {
  nom: string;
  type: CategoryType;
  montant: number;
  recurrence: Recurrence;
  prochaineDate: string;
  compteId: string;
  categorieId?: string | null;
}

export interface NewAmiInput {
  nom: string;
  couleur: string;
}

export interface NewProjetInput {
  nom: string;
  couleur: string;
  montantCible: number;
  dateCible?: string | null;
}

export interface NewContributionInput {
  projetId: string;
  sens: ContributionSens;
  montant: number;
  note?: string | null;
  date: string;
}

export interface NewPretInput {
  clientId: string; // dedupe key for the linked transaction
  amiId: string;
  direction: PretDirection;
  montant: number;
  note?: string | null;
  compteId?: string | null;
  date: string;
}
