-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FoundationRole" ADD VALUE 'MEMBER_BOARD_DIRECTOR';
ALTER TYPE "FoundationRole" ADD VALUE 'MEMBER_ADVISORY_COMMITTEE';
ALTER TYPE "FoundationRole" ADD VALUE 'FUND_EMPLOYEE';
ALTER TYPE "FoundationRole" ADD VALUE 'NOT_SPECIFIED';
