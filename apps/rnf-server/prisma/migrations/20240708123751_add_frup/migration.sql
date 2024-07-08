-- AlterTable
ALTER TABLE "DSConfiguration"
ADD COLUMN     "dsDemarcheFRUPCreationAnnotationId" TEXT NOT NULL DEFAULT 'Q2hhbXAtMTczMw==',
ADD COLUMN     "dsDemarcheFRUPCreationId" INTEGER NOT NULL DEFAULT 70,
ADD COLUMN     "dsDemarcheFRUPDissolutionId" INTEGER NOT NULL DEFAULT 72,
ADD COLUMN     "dsDemarcheFRUPModificationId" INTEGER NOT NULL DEFAULT 71,
ALTER COLUMN "fieldRegexDepartment" SET DEFAULT '#rnf-departement-rnf#';
