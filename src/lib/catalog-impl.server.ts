import type { Product } from "@prisma/client";

import type { RoomId } from "@/data/rooms";
import type { StockItem } from "@/data/stock";

import { db } from "./db";

const visibleStates = ["PUBLISHED", "RESERVED"] as const;

function normalizeRoom(value: string): RoomId {
  if (value === "arcade" || value === "sound-vision" || value === "curiosity") return value;
  return "library";
}

function conditionLabel(value: Product["conditionGrade"]) {
  return {
    NEW_SEALED: "New / Sealed",
    LIKE_NEW: "Like New",
    VERY_GOOD: "Very Good",
    GOOD: "Good",
    ACCEPTABLE: "Acceptable",
    FOR_PARTS_UNTESTED: "For Parts / Repair",
    STAFF_REVIEWED_COLLECTIBLE: "Collectible",
  }[value];
}

function productToStock(item: Product): StockItem {
  const yearText = item.catalogueProductId
    ? undefined
    : item.description.match(/\b(18|19|20)\d{2}\b/)?.[0];
  return {
    id: item.id,
    slug: item.slug,
    sku: item.sku,
    title: item.title,
    maker: item.creator || item.publisher || item.platform || "Bookmart",
    room: normalizeRoom(item.subcategory),
    shelf: item.shelfLocation,
    tags: [item.platform, item.format, item.category.replaceAll("_", " ")].filter(
      (value): value is string => Boolean(value),
    ),
    price: item.priceMinor / 100,
    condition: conditionLabel(item.conditionGrade),
    year: yearText ? Number(yearText) : undefined,
    note: item.shortDescription,
    traded: item.publishedAt?.toISOString() ?? item.createdAt.toISOString(),
    featured: item.isFeatured || item.isStaffPick,
    archive: item.isRare,
    imageUrl: item.imageUrl,
    gallery: item.gallery,
    barcode: item.isbn || item.barcode || item.ean || undefined,
    publisher: item.publisher || undefined,
    platform: item.platform || undefined,
    quantity: item.quantity,
    availability: item.inventoryState === "RESERVED" ? "reserved" : "available",
    collectionOnly: item.collectionOnly,
    deliveryEligible: item.deliveryEligible,
    clickCollectEligible: item.clickCollectEligible,
  };
}

const includeCatalogue = { catalogueProduct: true } as const;

export async function roomInventoryOnServer(room: RoomId) {
  const products = await db.product.findMany({
    where: { subcategory: room, inventoryState: { in: [...visibleStates] }, quantity: { gt: 0 } },
    include: includeCatalogue,
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
  });
  return products.map(productToStock);
}

export async function publicProductOnServer(room: RoomId, slug: string) {
  const product = await db.product.findFirst({
    where: {
      slug,
      subcategory: room,
      inventoryState: { in: [...visibleStates] },
      quantity: { gt: 0 },
    },
    include: includeCatalogue,
  });
  if (!product) return null;
  const mapped = productToStock(product);
  if (product.catalogueProduct?.publicationDate) {
    const match = product.catalogueProduct.publicationDate.match(/\b(18|19|20)\d{2}\b/);
    if (match) mapped.year = Number(match[0]);
  }
  return mapped;
}

export async function searchInventoryOnServer(query: string) {
  const needle = query.trim();
  if (!needle) return [];
  const products = await db.product.findMany({
    where: {
      inventoryState: { in: [...visibleStates] },
      quantity: { gt: 0 },
      OR: [
        { title: { contains: needle, mode: "insensitive" } },
        { creator: { contains: needle, mode: "insensitive" } },
        { publisher: { contains: needle, mode: "insensitive" } },
        { platform: { contains: needle, mode: "insensitive" } },
        { shelfLocation: { contains: needle, mode: "insensitive" } },
        { sku: { contains: needle, mode: "insensitive" } },
        { barcode: { contains: needle, mode: "insensitive" } },
        { isbn: { contains: needle, mode: "insensitive" } },
      ],
    },
    include: includeCatalogue,
    orderBy: { publishedAt: "desc" },
    take: 100,
  });
  return products.map(productToStock);
}
