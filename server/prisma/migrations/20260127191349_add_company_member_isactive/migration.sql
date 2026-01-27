-- AlterTable
ALTER TABLE "CompanyMember" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "CompanyMember_isActive_idx" ON "CompanyMember"("isActive");
