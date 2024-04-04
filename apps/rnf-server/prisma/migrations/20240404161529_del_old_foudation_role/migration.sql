/*
  Warnings:

  - The values [DECLARANT,ADMIN,MANAGER] on the enum `FoundationRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FoundationRole_new" AS ENUM ('MEMBER_BOARD_DIRECTOR', 'MEMBER_ADVISORY_COMMITTEE', 'FUND_EMPLOYEE', 'NOT_SPECIFIED');
ALTER TABLE "PersonInFoundation" ALTER COLUMN "roles" TYPE "FoundationRole_new"[] USING ("roles"::text::"FoundationRole_new"[]);
ALTER TYPE "FoundationRole" RENAME TO "FoundationRole_old";
ALTER TYPE "FoundationRole_new" RENAME TO "FoundationRole";
DROP TYPE "FoundationRole_old";
COMMIT;
