-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentType" ADD VALUE 'WORK_CONTRACT';
ALTER TYPE "DocumentType" ADD VALUE 'BANK_STATEMENT';
ALTER TYPE "DocumentType" ADD VALUE 'GUARANTOR_ID';
ALTER TYPE "DocumentType" ADD VALUE 'GUARANTOR_INCOME';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "contractType" TEXT,
ADD COLUMN     "currentCity" TEXT,
ADD COLUMN     "currentPostalCode" TEXT,
ADD COLUMN     "profession" TEXT,
ADD COLUMN     "salary" INTEGER;
