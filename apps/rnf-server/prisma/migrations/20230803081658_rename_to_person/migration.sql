/*
  Warnings:

  - You are about to drop the column `peoples` on the `FoundationHistory` table. All the data in the column will be lost.
  - You are about to drop the `People` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PeopleInFoundation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "People" DROP CONSTRAINT "People_addressId_fkey";

-- DropForeignKey
ALTER TABLE "PeopleInFoundation" DROP CONSTRAINT "PeopleInFoundation_foundationId_fkey";

-- DropForeignKey
ALTER TABLE "PeopleInFoundation" DROP CONSTRAINT "PeopleInFoundation_peopleId_fkey";

-- AlterTable
ALTER TABLE "FoundationHistory" DROP COLUMN "peoples",
ADD COLUMN     "persons" JSONB[];

-- DropTable
DROP TABLE "People";

-- DropTable
DROP TABLE "PeopleInFoundation";

-- CreateTable
CREATE TABLE "Person" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "bornAt" TIMESTAMP(3) NOT NULL,
    "bornPlace" TEXT NOT NULL,
    "addressId" INTEGER NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonInFoundation" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "foundationId" INTEGER NOT NULL,
    "personId" INTEGER NOT NULL,
    "roles" "FoundationRole"[],

    CONSTRAINT "PersonInFoundation_pkey" PRIMARY KEY ("foundationId","personId")
);

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonInFoundation" ADD CONSTRAINT "PersonInFoundation_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "Foundation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonInFoundation" ADD CONSTRAINT "PersonInFoundation_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
