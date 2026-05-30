-- CreateTable
CREATE TABLE "BotUser" (
    "chatId" TEXT NOT NULL,
    "lang" TEXT NOT NULL DEFAULT 'uz',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BotUser_pkey" PRIMARY KEY ("chatId")
);
