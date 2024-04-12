-- AlterTable
ALTER TABLE "DSConfiguration" ADD COLUMN     "fieldRegexCreatedAt" TEXT NOT NULL DEFAULT '#rnf-date-creation-rnf#';

-- AlterTable
ALTER TABLE "Foundation" ADD COLUMN     "originalCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "FoundationHistory" ADD COLUMN     "originalCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
