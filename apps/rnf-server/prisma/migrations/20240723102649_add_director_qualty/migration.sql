-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FoundationRole" ADD VALUE 'MEMBER_SUPERVIROY_BOARD';
ALTER TYPE "FoundationRole" ADD VALUE 'MEMBER_MANAGEMENT_BOARD';
ALTER TYPE "FoundationRole" ADD VALUE 'PERSON_IN_DIRECTOR_POSITION';
