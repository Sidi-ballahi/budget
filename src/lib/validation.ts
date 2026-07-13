import { z } from "zod";

export const newTransactionSchema = z.object({
  clientId: z.string().min(1),
  type: z.enum(["depense", "revenu", "transfert"]),
  montant: z.number().positive(),
  compteId: z.string().min(1),
  compteDestinationId: z.string().min(1).nullable().optional(),
  categorieId: z.string().min(1).nullable().optional(),
  libelle: z.string().nullable().optional(),
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
});

export type NewBudgetParsed = z.infer<typeof newBudgetSchema>;
