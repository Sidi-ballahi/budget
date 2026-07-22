import { z } from "zod";

export const newTransactionSchema = z.object({
  clientId: z.string().min(1),
  type: z.enum(["depense", "revenu", "transfert"]),
  montant: z.number().positive(),
  compteId: z.string().min(1),
  compteDestinationId: z.string().min(1).nullable().optional(),
  categorieId: z.string().min(1).nullable().optional(),
  libelle: z.string().nullable().optional(),
  tags: z.array(z.string().min(1).max(30)).max(10).optional(),
  justificatif: z.string().max(2_000_000).nullable().optional(),
  date: z.string().min(1),
  creeHorsLigne: z.boolean().optional(),
});

export type NewTransactionParsed = z.infer<typeof newTransactionSchema>;

export const newAccountSchema = z.object({
  nom: z.string().min(1).max(60),
  type: z.enum(["banque", "cash"]),
  soldeInitial: z.number(),
  couleur: z.string().min(1),
  devise: z.string().min(1).default("MRU"),
});

export type NewAccountParsed = z.infer<typeof newAccountSchema>;

export const newBudgetSchema = z.object({
  categorieId: z.string().min(1),
  montantLimite: z.number().positive(),
  seuilAlerte: z.number().int().min(1).max(100).default(80),
  reporter: z.boolean().default(false),
});

export const updateBudgetSchema = z.object({
  id: z.string().min(1),
  montantLimite: z.number().positive().optional(),
  seuilAlerte: z.number().int().min(1).max(100).optional(),
  reporter: z.boolean().optional(),
});

export type NewBudgetParsed = z.infer<typeof newBudgetSchema>;

export const newCategorySchema = z.object({
  nom: z.string().min(1).max(60),
  type: z.enum(["depense", "revenu"]),
  couleur: z.string().min(1),
  icone: z.string().nullable().optional(),
});

export type NewCategoryParsed = z.infer<typeof newCategorySchema>;

export const newEcheanceSchema = z.object({
  nom: z.string().min(1).max(60),
  type: z.enum(["depense", "revenu"]),
  montant: z.number().positive(),
  recurrence: z.enum(["ponctuel", "hebdomadaire", "mensuel", "annuel"]),
  prochaineDate: z.string().min(1),
  compteId: z.string().min(1),
  categorieId: z.string().min(1).nullable().optional(),
});

export type NewEcheanceParsed = z.infer<typeof newEcheanceSchema>;

export const payerEcheanceSchema = z.object({
  id: z.string().min(1),
  clientId: z.string().min(1),
  date: z.string().min(1),
});

export const newAmiSchema = z.object({
  nom: z.string().min(1).max(60),
  couleur: z.string().min(1),
});

export const newPretSchema = z.object({
  clientId: z.string().min(1),
  amiId: z.string().min(1),
  direction: z.enum(["donne", "recu"]),
  montant: z.number().positive(),
  note: z.string().max(200).nullable().optional(),
  compteId: z.string().min(1).nullable().optional(),
  date: z.string().min(1),
});

export type NewPretParsed = z.infer<typeof newPretSchema>;

export const newProjetSchema = z.object({
  nom: z.string().min(1).max(60),
  couleur: z.string().min(1),
  montantCible: z.number().positive(),
  dateCible: z.string().min(1).nullable().optional(),
});

export type NewProjetParsed = z.infer<typeof newProjetSchema>;

export const newContributionSchema = z.object({
  projetId: z.string().min(1),
  sens: z.enum(["verse", "retire"]),
  montant: z.number().positive(),
  note: z.string().max(200).nullable().optional(),
  date: z.string().min(1),
});

export type NewContributionParsed = z.infer<typeof newContributionSchema>;
