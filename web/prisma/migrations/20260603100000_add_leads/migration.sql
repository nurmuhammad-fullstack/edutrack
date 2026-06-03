-- Trainer applications / leads inbox.
-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEB', 'BOT', 'INSTAGRAM', 'TELEGRAM', 'REFERRAL', 'MANUAL');
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'VERIFIED', 'CONVERTED', 'REJECTED');

-- CreateTable
CREATE TABLE "Lead" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "sport" TEXT,
    "message" TEXT,
    "source" "LeadSource" NOT NULL DEFAULT 'WEB',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "referral" TEXT,
    "note" TEXT,
    "trainerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");
CREATE INDEX "Lead_source_idx" ON "Lead"("source");
