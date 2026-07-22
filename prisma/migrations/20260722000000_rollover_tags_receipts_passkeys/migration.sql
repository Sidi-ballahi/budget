
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "justificatif" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "budgets" ADD COLUMN     "reporter" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "app_settings" ADD COLUMN     "webauthnChallenge" TEXT;

-- CreateTable
CREATE TABLE "passkeys" (
    "id" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "counter" BIGINT NOT NULL DEFAULT 0,
    "deviceName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passkeys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "passkeys_credentialId_key" ON "passkeys"("credentialId");

