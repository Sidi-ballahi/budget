-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('banque', 'cash');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('depense', 'revenu');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('depense', 'revenu', 'transfert');

-- CreateEnum
CREATE TYPE "BudgetPeriod" AS ENUM ('mensuel');

-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('resume_mensuel', 'anomalie', 'prevision');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "soldeInitial" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "devise" TEXT NOT NULL DEFAULT 'MRU',
    "couleur" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "icone" TEXT,
    "couleur" TEXT NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "parentId" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "compteId" TEXT NOT NULL,
    "compteDestinationId" TEXT,
    "type" "TransactionType" NOT NULL,
    "montant" DECIMAL(14,2) NOT NULL,
    "categorieId" TEXT,
    "libelle" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced" BOOLEAN NOT NULL DEFAULT true,
    "creeHorsLigne" BOOLEAN NOT NULL DEFAULT false,
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "categorieId" TEXT NOT NULL,
    "montantLimite" DECIMAL(14,2) NOT NULL,
    "seuilAlerte" INTEGER NOT NULL DEFAULT 80,
    "periode" "BudgetPeriod" NOT NULL DEFAULT 'mensuel',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insights" (
    "id" TEXT NOT NULL,
    "type" "InsightType" NOT NULL,
    "contenu" TEXT NOT NULL,
    "periodeConcernee" TIMESTAMP(3) NOT NULL,
    "dateGeneration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "pinHash" TEXT NOT NULL,
    "pinSalt" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL DEFAULT 'oklch(0.72 0.14 150)',
    "aiSuggestions" BOOLEAN NOT NULL DEFAULT true,
    "autoLockMinutes" INTEGER NOT NULL DEFAULT 2,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_clientId_key" ON "transactions"("clientId");

-- CreateIndex
CREATE INDEX "transactions_compteId_idx" ON "transactions"("compteId");

-- CreateIndex
CREATE INDEX "transactions_date_idx" ON "transactions"("date");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_categorieId_key" ON "budgets"("categorieId");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_compteDestinationId_fkey" FOREIGN KEY ("compteDestinationId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
