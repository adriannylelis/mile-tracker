-- CreateTable
CREATE TABLE "MileageSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MileageSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MileagePrice" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "milheiro" DOUBLE PRECISION NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MileagePrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MileagePrice_sourceId_idx" ON "MileagePrice"("sourceId");

-- CreateIndex
CREATE INDEX "MileagePrice_capturedAt_idx" ON "MileagePrice"("capturedAt");

-- AddForeignKey
ALTER TABLE "MileagePrice" ADD CONSTRAINT "MileagePrice_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "MileageSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
