-- Drop InspectionPhoto if it exists (may not exist in all environments)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'InspectionPhoto') THEN
    ALTER TABLE "InspectionPhoto" DROP CONSTRAINT IF EXISTS "InspectionPhoto_tenantId_fkey";
    ALTER TABLE "InspectionPhoto" DROP CONSTRAINT IF EXISTS "InspectionPhoto_inspectionId_fkey";
    DROP TABLE "InspectionPhoto";
  END IF;
END $$;

-- CreateTable
CREATE TABLE "FindingPhoto" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FindingPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FindingPhoto_tenantId_idx" ON "FindingPhoto"("tenantId");

-- CreateIndex
CREATE INDEX "FindingPhoto_findingId_idx" ON "FindingPhoto"("findingId");

-- AddForeignKey
ALTER TABLE "FindingPhoto" ADD CONSTRAINT "FindingPhoto_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FindingPhoto" ADD CONSTRAINT "FindingPhoto_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
