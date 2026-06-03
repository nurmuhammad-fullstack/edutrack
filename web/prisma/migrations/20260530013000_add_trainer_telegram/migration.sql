-- AlterTable
ALTER TABLE "Trainer" ADD COLUMN "telegramId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_telegramId_key" ON "Trainer"("telegramId");
