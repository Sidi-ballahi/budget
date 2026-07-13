-- CreateEnum
CREATE TYPE "Recurrence" AS ENUM ('ponctuel', 'hebdomadaire', 'mensuel', 'annuel');

-- CreateEnum
CREATE TYPE "PretDirection" AS ENUM ('donne', 'recu');

-- CreateTable
CREATE TABLE "echeances" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "montant" DECIMAL(14,2) NOT NULL,
    "recurrence" "Recurrence" NOT NULL DEFAULT 'mensuel',
    "prochaineDate" TIMESTAMP(3) NOT NULL,
    "compteId" TEXT,
    "categorieId" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "echeances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amis" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "couleur" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "amis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pret_mouvements" (
    "id" TEXT NOT NULL,
    "amiId" TEXT NOT NULL,
    "direction" "PretDirection" NOT NULL,
    "montant" DECIMAL(14,2) NOT NULL,
    "note" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "compteId" TEXT,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pret_mouvements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "echeances_prochaineDate_idx" ON "echeances"("prochaineDate");

-- CreateIndex
CREATE UNIQUE INDEX "pret_mouvements_transactionId_key" ON "pret_mouvements"("transactionId");

-- CreateIndex
CREATE INDEX "pret_mouvements_amiId_idx" ON "pret_mouvements"("amiId");

-- AddForeignKey
ALTER TABLE "echeances" ADD CONSTRAINT "echeances_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "echeances" ADD CONSTRAINT "echeances_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pret_mouvements" ADD CONSTRAINT "pret_mouvements_amiId_fkey" FOREIGN KEY ("amiId") REFERENCES "amis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pret_mouvements" ADD CONSTRAINT "pret_mouvements_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pret_mouvements" ADD CONSTRAINT "pret_mouvements_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
