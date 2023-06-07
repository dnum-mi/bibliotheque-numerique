-- CreateEnum
CREATE TYPE "FoundationType" AS ENUM ('FDD', 'FE', 'FRUP');

-- CreateEnum
CREATE TYPE "FoundationRole" AS ENUM ('DECLARANT', 'ADMIN', 'MANAGER');

-- CreateTable
CREATE TABLE "Foundation" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rnfId" TEXT NOT NULL,
    "type" "FoundationType" NOT NULL DEFAULT 'FDD',
    "department" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "addressId" INTEGER NOT NULL,
    "phone" TEXT,
    "email" TEXT,

    CONSTRAINT "Foundation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "streetAddress" TEXT,
    "streetNumber" TEXT,
    "streetName" TEXT,
    "postalCode" TEXT NOT NULL,
    "cityName" TEXT NOT NULL,
    "cityCode" TEXT NOT NULL,
    "departmentName" TEXT,
    "departmentCode" TEXT,
    "regionName" TEXT,
    "regionCode" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "People" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "bornAt" TIMESTAMP(3) NOT NULL,
    "bornPlace" TEXT NOT NULL,
    "addressId" INTEGER NOT NULL,

    CONSTRAINT "People_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeopleInFoundation" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "foundationId" INTEGER NOT NULL,
    "peopleId" INTEGER NOT NULL,
    "roles" "FoundationRole"[],

    CONSTRAINT "PeopleInFoundation_pkey" PRIMARY KEY ("foundationId","peopleId")
);

-- CreateTable
CREATE TABLE "FoundationHistory" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rnfId" TEXT NOT NULL,
    "historyNumber" INTEGER NOT NULL,
    "type" "FoundationType" NOT NULL DEFAULT 'FDD',
    "department" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "peoples" JSONB[],
    "address" JSONB NOT NULL,
    "rawDsJson" JSONB NOT NULL,

    CONSTRAINT "FoundationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Foundation_rnfId_key" ON "Foundation"("rnfId");

-- AddForeignKey
ALTER TABLE "Foundation" ADD CONSTRAINT "Foundation_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "People" ADD CONSTRAINT "People_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeopleInFoundation" ADD CONSTRAINT "PeopleInFoundation_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "Foundation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeopleInFoundation" ADD CONSTRAINT "PeopleInFoundation_peopleId_fkey" FOREIGN KEY ("peopleId") REFERENCES "People"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
