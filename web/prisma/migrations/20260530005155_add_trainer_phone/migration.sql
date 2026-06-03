-- AlterTable
ALTER TABLE "Trainer" ADD COLUMN "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_phone_key" ON "Trainer"("phone");
