-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "telegramId" TEXT,
    "name" TEXT,
    "username" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
