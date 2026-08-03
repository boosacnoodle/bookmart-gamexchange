-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('BOOKS', 'GAMES', 'CONSOLES', 'VINYL', 'RARE_COLLECTIBLE', 'MUSIC_FILM', 'JEWELLERY_CURIOSITIES');

-- CreateEnum
CREATE TYPE "InventoryState" AS ENUM ('DRAFT', 'NEEDS_REVIEW', 'READY', 'PUBLISHED', 'RESERVED', 'SOLD', 'ARCHIVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ConditionGrade" AS ENUM ('NEW_SEALED', 'LIKE_NEW', 'VERY_GOOD', 'GOOD', 'ACCEPTABLE', 'FOR_PARTS_UNTESTED', 'STAFF_REVIEWED_COLLECTIBLE');

-- CreateEnum
CREATE TYPE "ShelfStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "subcategory" TEXT NOT NULL,
    "creator" TEXT,
    "publisher" TEXT,
    "platform" TEXT,
    "format" TEXT,
    "isbn" TEXT,
    "ean" TEXT,
    "sku" TEXT NOT NULL,
    "priceMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "shortDescription" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "conditionGrade" "ConditionGrade" NOT NULL,
    "conditionReport" TEXT NOT NULL,
    "included" TEXT[],
    "missing" TEXT[],
    "testedStatus" TEXT,
    "shelfLocation" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "inventoryState" "InventoryState" NOT NULL DEFAULT 'PUBLISHED',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isStaffPick" BOOLEAN NOT NULL DEFAULT false,
    "isRare" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT NOT NULL,
    "gallery" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuratedShelf" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "introduction" TEXT NOT NULL,
    "coverImageUrl" TEXT NOT NULL,
    "curatorName" TEXT,
    "homepageVisible" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ShelfStatus" NOT NULL DEFAULT 'PUBLISHED',
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CuratedShelf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuratedShelfProduct" (
    "shelfId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "CuratedShelfProduct_pkey" PRIMARY KEY ("shelfId","productId")
);

-- CreateTable
CREATE TABLE "WantedRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "author" TEXT,
    "isbn" TEXT,
    "platform" TEXT,
    "category" TEXT,
    "notes" TEXT NOT NULL,
    "maxPriceMinor" INTEGER,
    "preferredCondition" TEXT,
    "contactEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WantedRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellTradeSubmission" (
    "id" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "preference" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellTradeSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_inventoryState_idx" ON "Product"("inventoryState");

-- CreateIndex
CREATE INDEX "Product_title_idx" ON "Product"("title");

-- CreateIndex
CREATE UNIQUE INDEX "CuratedShelf_slug_key" ON "CuratedShelf"("slug");

-- CreateIndex
CREATE INDEX "CuratedShelfProduct_productId_idx" ON "CuratedShelfProduct"("productId");

-- AddForeignKey
ALTER TABLE "CuratedShelfProduct" ADD CONSTRAINT "CuratedShelfProduct_shelfId_fkey" FOREIGN KEY ("shelfId") REFERENCES "CuratedShelf"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuratedShelfProduct" ADD CONSTRAINT "CuratedShelfProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
