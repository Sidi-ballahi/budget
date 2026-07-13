import "dotenv/config";
import { randomUUID } from "crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPin } from "../src/lib/pin";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ACCOUNTS = [
  { id: "a", nom: "Banque A", type: "banque" as const, couleur: "oklch(0.72 0.14 230)", soldeInitial: 96600 },
  { id: "b", nom: "Banque B", type: "banque" as const, couleur: "oklch(0.72 0.14 300)", soldeInitial: 188650 },
  { id: "c", nom: "Banque C", type: "banque" as const, couleur: "oklch(0.72 0.14 80)", soldeInitial: 60200 },
  { id: "cash", nom: "Cash", type: "cash" as const, couleur: "oklch(0.72 0.14 150)", soldeInitial: 2800 },
];

const CATEGORIES = [
  {
    id: "alim",
    nom: "Alimentation",
    couleur: "oklch(0.72 0.14 80)",
    keywords: ["resto", "restaurant", "cafe", "supermarche", "nema", "course", "courses", "alimentation"],
  },
  {
    id: "transport",
    nom: "Transport",
    couleur: "oklch(0.72 0.14 230)",
    keywords: ["taxi", "essence", "bus", "aeroport", "transport", "carburant"],
  },
  {
    id: "logement",
    nom: "Logement",
    couleur: "oklch(0.72 0.14 300)",
    keywords: ["loyer", "logement", "appartement", "electricite", "eau"],
  },
  {
    id: "loisirs",
    nom: "Loisirs",
    couleur: "oklch(0.72 0.14 150)",
    keywords: ["cinema", "loisir", "sport", "sortie"],
  },
  {
    id: "sante",
    nom: "Santé",
    couleur: "oklch(0.68 0.15 25)",
    keywords: ["pharmacie", "medecin", "sante", "hopital"],
  },
  { id: "autres", nom: "Autres", couleur: "oklch(0.55 0.02 70)", keywords: [] },
];

const BUDGETS = [
  { categorieId: "alim", montantLimite: 70000 },
  { categorieId: "transport", montantLimite: 30000 },
  { categorieId: "logement", montantLimite: 90000 },
  { categorieId: "loisirs", montantLimite: 25000 },
  { categorieId: "sante", montantLimite: 20000 },
  { categorieId: "autres", montantLimite: 15000 },
];

const TRANSACTIONS = [
  { date: "2026-07-12", label: "Supermarché Nema", catId: "alim", accountId: "a", montant: 4500, type: "depense" as const },
  { date: "2026-07-11", label: "Taxi aéroport", catId: "transport", accountId: "cash", montant: 3000, type: "depense" as const },
  { date: "2026-07-10", label: "Salaire Juillet", catId: "autres", accountId: "a", montant: 180000, type: "revenu" as const },
  { date: "2026-07-09", label: "Loyer appartement", catId: "logement", accountId: "b", montant: 95000, type: "depense" as const },
  { date: "2026-07-08", label: "Retrait espèces", catId: null, accountId: "a", destAccountId: "cash", montant: 20000, type: "transfert" as const },
  { date: "2026-07-07", label: "Pharmacie", catId: "sante", accountId: "c", montant: 2200, type: "depense" as const },
  { date: "2026-07-06", label: "Cinéma", catId: "loisirs", accountId: "cash", montant: 1800, type: "depense" as const, synced: false },
  { date: "2026-07-05", label: "Restaurant", catId: "alim", accountId: "a", montant: 6800, type: "depense" as const },
  { date: "2026-07-04", label: "Abonnement internet", catId: "autres", accountId: "b", montant: 4500, type: "depense" as const },
  { date: "2026-07-03", label: "Essence", catId: "transport", accountId: "c", montant: 5200, type: "depense" as const },
];

async function main() {
  for (const acc of ACCOUNTS) {
    await prisma.account.upsert({
      where: { id: acc.id },
      update: {},
      create: { ...acc, devise: "MRU" },
    });
  }

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: { ...cat, type: "depense" },
    });
  }

  for (const b of BUDGETS) {
    await prisma.budget.upsert({
      where: { categorieId: b.categorieId },
      update: {},
      create: b,
    });
  }

  for (const tx of TRANSACTIONS) {
    await prisma.transaction.create({
      data: {
        clientId: randomUUID(),
        compteId: tx.accountId,
        compteDestinationId: "destAccountId" in tx ? tx.destAccountId : null,
        type: tx.type,
        montant: tx.montant,
        categorieId: tx.catId ?? null,
        libelle: tx.label,
        date: new Date(tx.date),
        synced: "synced" in tx ? tx.synced : true,
      },
    });
  }

  const { hash, salt } = await hashPin("1234");
  await prisma.appSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, pinHash: hash, pinSalt: salt },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
