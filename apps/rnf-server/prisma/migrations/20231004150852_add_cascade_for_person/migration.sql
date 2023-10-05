-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_addressId_fkey";

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;
