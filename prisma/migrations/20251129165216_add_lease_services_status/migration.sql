-- AlterTable
ALTER TABLE "leases" ADD COLUMN     "energyConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "hasEnergy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasInsurance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasInternet" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "insuranceConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "internetConfirmedAt" TIMESTAMP(3);
