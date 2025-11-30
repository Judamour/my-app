-- CreateTable
CREATE TABLE "lease_tenants" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "share" INTEGER NOT NULL DEFAULT 100,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lease_tenants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lease_tenants_leaseId_idx" ON "lease_tenants"("leaseId");

-- CreateIndex
CREATE INDEX "lease_tenants_tenantId_idx" ON "lease_tenants"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "lease_tenants_leaseId_tenantId_key" ON "lease_tenants"("leaseId", "tenantId");

-- AddForeignKey
ALTER TABLE "lease_tenants" ADD CONSTRAINT "lease_tenants_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lease_tenants" ADD CONSTRAINT "lease_tenants_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
