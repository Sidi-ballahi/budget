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
