/*
  Warnings:

  - You are about to drop the column `rawDsJson` on the `FoundationHistory` table. All the data in the column will be lost.
  - Added the required column `status` to the `FoundationHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FileStorage" DROP CONSTRAINT "FileStorage_foundationId_fkey";

-- AlterTable
ALTER TABLE "FileStorage" ALTER COLUMN "foundationId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Foundation" ADD COLUMN     "dissolvedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "FoundationHistory" DROP COLUMN "rawDsJson",
ADD COLUMN     "dissolvedAt" TIMESTAMP(3),
ADD COLUMN     "status" JSONB NOT NULL;

-- CreateTable
CREATE TABLE "DSConfiguration" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "foundationRefreshedAt" TIMESTAMP(3) NOT NULL DEFAULT '1970-01-01 00:00:00 +00:00',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dsDemarcheFDDCreationId" INTEGER NOT NULL DEFAULT 37,
    "dsDemarcheFDDCreationAnnotationId" TEXT NOT NULL DEFAULT 'Q2hhbXAtMTE4',
    "dsDemarcheFDDModificationId" INTEGER NOT NULL DEFAULT 50,
    "dsDemarcheFDDDissolutionId" INTEGER NOT NULL DEFAULT 51,
    "dsDemarcheFECreationId" INTEGER NOT NULL DEFAULT 12,
    "dsDemarcheFECreationAnnotationId" TEXT NOT NULL DEFAULT 'Q2hhbXAtMzIx',
    "dsDemarcheFEModificationId" INTEGER NOT NULL DEFAULT 53,
    "dsDemarcheFEDissolutionId" INTEGER NOT NULL DEFAULT 54,
    "dsDemarcheDNRId" INTEGER NOT NULL DEFAULT 43,
    "dsDemarcheDNRAnnotationId" TEXT NOT NULL DEFAULT 'Q2hhbXAtMTQ3OQ==',
    "fieldRegexTitle" TEXT NOT NULL DEFAULT '#rnf-titre-rnf#',
    "fieldRegexType" TEXT NOT NULL DEFAULT '#rnf-type-rnf#',
    "fieldRegexAddress" TEXT NOT NULL DEFAULT '#rnf-addresse-rnf#',
    "fieldRegexEmail" TEXT NOT NULL DEFAULT '#rnf-courriel-rnf#',
    "fieldRegexPhone" TEXT NOT NULL DEFAULT '#rnf-telephone-rnf#',
    "fieldRegexPerson" TEXT NOT NULL DEFAULT '#rnf-personne-rnf#',
    "fieldRegexRnfId" TEXT NOT NULL DEFAULT '#rnf-numero-rnf-rnf#',
    "fieldRegexStatus" TEXT NOT NULL DEFAULT '#rnf-status-rnf#',
    "cronUpdateFrequency" TEXT NOT NULL DEFAULT '0 */5 * * * *',

    CONSTRAINT "DSConfiguration_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FileStorage" ADD CONSTRAINT "FileStorage_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "Foundation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
