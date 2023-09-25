-- AlterTable
ALTER TABLE "DSConfiguration" ADD COLUMN     "fieldRegexAdministator" TEXT NOT NULL DEFAULT '#rnf-administrateur-rnf#',
ADD COLUMN     "fieldRegexPersonAddress" TEXT NOT NULL DEFAULT '#rnf-person-adresse-rnf#',
ADD COLUMN     "fieldRegexPersonBornAt" TEXT NOT NULL DEFAULT '#rnf-person-date-naissance-rnf#',
ADD COLUMN     "fieldRegexPersonBornPlace" TEXT NOT NULL DEFAULT '#rnf-person-lieu-naissance-rnf#',
ADD COLUMN     "fieldRegexPersonCivility" TEXT NOT NULL DEFAULT '#rnf-person-civilite-rnf#',
ADD COLUMN     "fieldRegexPersonFirstName" TEXT NOT NULL DEFAULT '#rnf-person-prenom-rnf#',
ADD COLUMN     "fieldRegexPersonLastName" TEXT NOT NULL DEFAULT '#rnf-person-nom-rnf#',
ADD COLUMN     "fieldRegexPersonNationality" TEXT NOT NULL DEFAULT '#rnf-person-nationalite-rnf#',
ADD COLUMN     "fieldRegexPersonPhone" TEXT NOT NULL DEFAULT '#rnf-person-telephone-rnf#',
ADD COLUMN     "fieldRegexPersonProfession" TEXT NOT NULL DEFAULT '#rnf-person-profession-rnf#',
ADD COLUMN     "fieldRegexPersonQuality" TEXT NOT NULL DEFAULT '#rnf-person-qualite-rnf#';
