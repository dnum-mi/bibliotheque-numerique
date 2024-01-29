-- AlterTable
ALTER TABLE "DSConfiguration" ADD COLUMN     "fieldRegexFiscalEndDate" TEXT NOT NULL DEFAULT '#rnf-date-fin-exercice-rnf#';

-- AlterTable
ALTER TABLE "Foundation" ADD COLUMN     "fiscalEndDateAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "FoundationHistory" ADD COLUMN     "fiscalEndDateAt" TIMESTAMP(3);
