-- CreateEnum
CREATE TYPE "ShareType" AS ENUM ('PROFILE', 'PROPERTY');

-- CreateTable
CREATE TABLE "share_links" (
    "id" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "type" "ShareType" NOT NULL,
    "userId" TEXT,
    "propertyId" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "share_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "share_links_shortCode_key" ON "share_links"("shortCode");

-- CreateIndex
CREATE INDEX "share_links_shortCode_idx" ON "share_links"("shortCode");

-- CreateIndex
CREATE INDEX "share_links_userId_idx" ON "share_links"("userId");

-- CreateIndex
CREATE INDEX "share_links_propertyId_idx" ON "share_links"("propertyId");

-- AddForeignKey
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
