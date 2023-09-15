/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `FileStorage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[foundationId]` on the table `FileStorage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `foundationId` to the `FileStorage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FileStorage" ADD COLUMN     "foundationId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FileStorage_uuid_key" ON "FileStorage"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "FileStorage_foundationId_key" ON "FileStorage"("foundationId");

-- AddForeignKey
ALTER TABLE "FileStorage" ADD CONSTRAINT "FileStorage_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "Foundation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
