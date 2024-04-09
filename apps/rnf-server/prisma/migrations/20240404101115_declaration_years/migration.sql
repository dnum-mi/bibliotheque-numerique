-- AlterTable
ALTER TABLE "DSConfiguration" ADD COLUMN     "fieldRegexDeclarationYears" TEXT NOT NULL DEFAULT '#rnf-declaration-years-rnf#';

-- AlterTable
ALTER TABLE "Foundation" ADD COLUMN     "declarationYears" INTEGER[];

-- AlterTable
ALTER TABLE "FoundationHistory" ADD COLUMN     "declarationYears" INTEGER[];
