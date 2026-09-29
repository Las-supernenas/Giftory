-- CreateEnum
CREATE TYPE "Interest" AS ENUM ('TECHNOLOGY', 'GAMING', 'PHOTOGRAPHY', 'FILM_AND_TV', 'MUSIC', 'BOOKS_AND_READING', 'SCIENCE', 'HISTORY', 'LANGUAGES', 'EDUCATION', 'ART_AND_DESIGN', 'CRAFTS_AND_DIY', 'WRITING', 'FASHION', 'FITNESS', 'OUTDOOR_SPORTS', 'TEAM_SPORTS', 'WELLNESS_AND_SELF_CARE', 'YOGA_AND_MEDITATION', 'COOKING', 'BAKING', 'FOOD_AND_GASTRONOMY', 'COFFEE_AND_TEA', 'GARDENING', 'NATURE_AND_WILDLIFE', 'PETS', 'SUSTAINABILITY', 'TRAVEL', 'ADVENTURE', 'CULTURAL_EXPERIENCES', 'HOME_AND_DECOR', 'BEAUTY_AND_SKINCARE', 'COLLECTIBLES', 'CARS_AND_MOTORSPORTS', 'BOARD_GAMES_AND_PUZZLES');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "interests" "Interest"[],

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "personId" INTEGER NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftIdea" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "interests" "Interest"[],
    "userId" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "GiftIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryItem" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "giftIdeaId" INTEGER NOT NULL,

    CONSTRAINT "LibraryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedIdea" (
    "id" SERIAL NOT NULL,
    "personId" INTEGER NOT NULL,
    "giftIdeaId" INTEGER NOT NULL,
    "privateNote" TEXT,

    CONSTRAINT "SavedIdea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Person_userId_idx" ON "Person"("userId");

-- CreateIndex
CREATE INDEX "Event_personId_date_idx" ON "Event"("personId", "date");

-- CreateIndex
CREATE INDEX "GiftIdea_userId_idx" ON "GiftIdea"("userId");

-- CreateIndex
CREATE INDEX "LibraryItem_giftIdeaId_idx" ON "LibraryItem"("giftIdeaId");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryItem_userId_giftIdeaId_key" ON "LibraryItem"("userId", "giftIdeaId");

-- CreateIndex
CREATE INDEX "SavedIdea_giftIdeaId_idx" ON "SavedIdea"("giftIdeaId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedIdea_personId_giftIdeaId_key" ON "SavedIdea"("personId", "giftIdeaId");

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftIdea" ADD CONSTRAINT "GiftIdea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryItem" ADD CONSTRAINT "LibraryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryItem" ADD CONSTRAINT "LibraryItem_giftIdeaId_fkey" FOREIGN KEY ("giftIdeaId") REFERENCES "GiftIdea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedIdea" ADD CONSTRAINT "SavedIdea_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedIdea" ADD CONSTRAINT "SavedIdea_giftIdeaId_fkey" FOREIGN KEY ("giftIdeaId") REFERENCES "GiftIdea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
