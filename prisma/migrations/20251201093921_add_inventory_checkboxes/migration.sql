-- AlterTable
ALTER TABLE "leases" ADD COLUMN     "inventoryInAt" TIMESTAMP(3),
ADD COLUMN     "inventoryInBy" TEXT,
ADD COLUMN     "inventoryInDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "inventoryOutAt" TIMESTAMP(3),
ADD COLUMN     "inventoryOutBy" TEXT,
ADD COLUMN     "inventoryOutDone" BOOLEAN NOT NULL DEFAULT false;
