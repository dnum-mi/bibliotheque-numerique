-- DropForeignKey
ALTER TABLE "PersonInFoundation" DROP CONSTRAINT "PersonInFoundation_foundationId_fkey";

-- DropForeignKey
ALTER TABLE "PersonInFoundation" DROP CONSTRAINT "PersonInFoundation_personId_fkey";

-- AddForeignKey
ALTER TABLE "PersonInFoundation" ADD CONSTRAINT "PersonInFoundation_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "Foundation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonInFoundation" ADD CONSTRAINT "PersonInFoundation_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
