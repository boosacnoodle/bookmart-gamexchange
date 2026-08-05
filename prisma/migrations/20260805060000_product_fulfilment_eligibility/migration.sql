ALTER TABLE "Product"
ADD COLUMN "deliveryEligible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "clickCollectEligible" BOOLEAN NOT NULL DEFAULT true;
