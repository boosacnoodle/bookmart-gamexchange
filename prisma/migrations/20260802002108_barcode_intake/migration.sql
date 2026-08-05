-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProductCategory" ADD VALUE 'ACCESSORIES';
ALTER TYPE "ProductCategory" ADD VALUE 'COLLECTIBLES';
ALTER TYPE "ProductCategory" ADD VALUE 'MISCELLANEOUS';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "catalogueProductId" TEXT,
ADD COLUMN     "collectionOnly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "conditionDetails" JSONB,
ADD COLUMN     "shippingProfile" TEXT,
ADD COLUMN     "staffNotes" TEXT;

-- CreateTable
CREATE TABLE "CatalogueProduct" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "category" "ProductCategory" NOT NULL,
    "creator" TEXT,
    "publisher" TEXT,
    "platform" TEXT,
    "region" TEXT,
    "format" TEXT,
    "isbn10" TEXT,
    "isbn13" TEXT,
    "ean" TEXT,
    "upc" TEXT,
    "language" TEXT,
    "publicationDate" TEXT,
    "releaseDate" TEXT,
    "edition" TEXT,
    "pageCount" INTEGER,
    "subjects" TEXT[],
    "description" TEXT,
    "coverImageUrl" TEXT,
    "sourceProvider" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourcePayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogueProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "intakeType" TEXT NOT NULL,
    "barcode" TEXT,
    "barcodeType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'STARTED',
    "candidatePayload" JSONB,
    "selectedCandidate" JSONB,
    "duplicatePayload" JSONB,
    "createdProductId" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntakeSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiExtraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "featureEnabled" BOOLEAN NOT NULL,
    "provider" TEXT NOT NULL,
    "inputImages" TEXT[],
    "rawValidatedResponse" JSONB,
    "staffEdits" JSONB,
    "finalApprovedValues" JSONB,
    "costMinor" INTEGER,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approvingUserId" TEXT,

    CONSTRAINT "AiExtraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CatalogueProduct_isbn10_idx" ON "CatalogueProduct"("isbn10");

-- CreateIndex
CREATE INDEX "CatalogueProduct_isbn13_idx" ON "CatalogueProduct"("isbn13");

-- CreateIndex
CREATE INDEX "CatalogueProduct_ean_idx" ON "CatalogueProduct"("ean");

-- CreateIndex
CREATE INDEX "CatalogueProduct_upc_idx" ON "CatalogueProduct"("upc");

-- CreateIndex
CREATE INDEX "Product_barcode_idx" ON "Product"("barcode");

-- CreateIndex
CREATE INDEX "Product_catalogueProductId_idx" ON "Product"("catalogueProductId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_catalogueProductId_fkey" FOREIGN KEY ("catalogueProductId") REFERENCES "CatalogueProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
