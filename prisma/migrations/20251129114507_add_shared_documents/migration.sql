-- CreateTable
CREATE TABLE "SharedDocument" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3),
    "viewedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SharedDocument_applicationId_idx" ON "SharedDocument"("applicationId");

-- CreateIndex
CREATE INDEX "SharedDocument_documentId_idx" ON "SharedDocument"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "SharedDocument_applicationId_documentId_key" ON "SharedDocument"("applicationId", "documentId");

-- AddForeignKey
ALTER TABLE "SharedDocument" ADD CONSTRAINT "SharedDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedDocument" ADD CONSTRAINT "SharedDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
