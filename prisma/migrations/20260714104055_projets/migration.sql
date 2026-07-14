-- CreateEnum
CREATE TYPE "ContributionSens" AS ENUM ('verse', 'retire');

-- CreateTable
CREATE TABLE "projets" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "couleur" TEXT NOT NULL,
    "montantCible" DECIMAL(14,2) NOT NULL,
    "dateCible" TIMESTAMP(3),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projet_contributions" (
    "id" TEXT NOT NULL,
    "projetId" TEXT NOT NULL,
    "sens" "ContributionSens" NOT NULL DEFAULT 'verse',
    "montant" DECIMAL(14,2) NOT NULL,
    "note" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projet_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projet_contributions_projetId_idx" ON "projet_contributions"("projetId");

-- AddForeignKey
ALTER TABLE "projet_contributions" ADD CONSTRAINT "projet_contributions_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "projets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
