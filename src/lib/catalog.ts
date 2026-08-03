import "server-only";
import { PrismaClient } from "@prisma/client";
import type { Product as DbProduct } from "@prisma/client";
import { categories } from "./routes";
import { demoProducts, demoShelves } from "./demo-data";
import type { CuratedShelf, Product, ProductCategory } from "./types";

export type ProductQuery = {
  q?: string;
  category?: ProductCategory;
  condition?: string;
  platform?: string;
  maxPrice?: number;
  availability?: "available" | "sold";
};

const normalize = (value: string) => value.toLowerCase().trim();
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = process.env.DATABASE_URL
  ? (globalForPrisma.prisma ?? new PrismaClient())
  : null;

if (process.env.NODE_ENV !== "production" && prisma) globalForPrisma.prisma = prisma;

function mapProduct(product: DbProduct): Product {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    category: product.category as ProductCategory,
    subcategory: product.subcategory,
    creator: product.creator ?? undefined,
    publisher: product.publisher ?? undefined,
    platform: product.platform ?? undefined,
    format: product.format ?? undefined,
    isbn: product.isbn ?? undefined,
    ean: product.ean ?? undefined,
    sku: product.sku,
    priceMinor: product.priceMinor,
    shortDescription: product.shortDescription,
    description: product.description,
    conditionGrade: product.conditionGrade as Product["conditionGrade"],
    conditionReport: product.conditionReport,
    included: product.included,
    missing: product.missing,
    testedStatus: product.testedStatus ?? undefined,
    shelfLocation: product.shelfLocation,
    quantity: product.quantity,
    inventoryState: product.inventoryState === "SOLD" ? "SOLD" : product.inventoryState === "RESERVED" ? "RESERVED" : "PUBLISHED",
    isFeatured: product.isFeatured,
    isStaffPick: product.isStaffPick,
    isRare: product.isRare,
    imageUrl: product.imageUrl,
    gallery: product.gallery
  };
}

async function tryDatabase<T>(read: (client: PrismaClient) => Promise<T>, fallback: T) {
  if (!prisma) return fallback;
  try {
    return await read(prisma);
  } catch {
    return fallback;
  }
}

function matchesSearch(product: Product, q: string) {
  const haystack = [
    product.title,
    product.creator,
    product.publisher,
    product.platform,
    product.format,
    product.isbn,
    product.ean,
    product.sku,
    product.shortDescription,
    product.description,
    product.subcategory
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

export async function getProducts(query: ProductQuery = {}) {
  const source = await tryDatabase(
    async (client) => (await client.product.findMany({ orderBy: { createdAt: "desc" } })).map(mapProduct),
    demoProducts
  );
  return source.filter((product) => {
    if (query.q && !matchesSearch(product, query.q)) return false;
    if (query.category && product.category !== query.category) return false;
    if (query.condition && product.conditionGrade !== query.condition) return false;
    if (query.platform && normalize(product.platform ?? "") !== normalize(query.platform)) return false;
    if (query.maxPrice && product.priceMinor > query.maxPrice * 100) return false;
    if (query.availability === "available" && product.inventoryState !== "PUBLISHED") return false;
    if (query.availability === "sold" && product.inventoryState !== "SOLD") return false;
    return true;
  });
}

export async function getProduct(slug: string) {
  return tryDatabase(
    async (client) => {
      const product = await client.product.findUnique({ where: { slug } });
      return product ? mapProduct(product) : null;
    },
    demoProducts.find((product) => product.slug === slug) ?? null
  );
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const products = await getProducts();
  return products
    .filter((candidate) => candidate.slug !== product.slug)
    .filter((candidate) => candidate.category === product.category || candidate.isStaffPick === product.isStaffPick)
    .slice(0, limit);
}

export async function getNewArrivals(limit = 8) {
  return (await getProducts()).slice(0, limit);
}

export async function getFeaturedProducts(limit = 8) {
  return (await getProducts()).filter((product) => product.isFeatured).slice(0, limit);
}

export async function getStaffPicks(limit = 8) {
  return (await getProducts()).filter((product) => product.isStaffPick).slice(0, limit);
}

export async function getRareProducts(limit = 8) {
  return (await getProducts()).filter((product) => product.isRare).slice(0, limit);
}

export async function getShelves() {
  return tryDatabase(
    async (client) => {
      const shelves = await client.curatedShelf.findMany({
        orderBy: { displayOrder: "asc" },
        include: { products: { orderBy: { sortOrder: "asc" }, include: { product: true } } }
      });
      return shelves.map((shelf) => ({
        id: shelf.id,
        title: shelf.title,
        slug: shelf.slug,
        introduction: shelf.introduction,
        coverImageUrl: shelf.coverImageUrl,
        curatorName: shelf.curatorName ?? undefined,
        homepageVisible: shelf.homepageVisible,
        displayOrder: shelf.displayOrder,
        productSlugs: shelf.products.map((item) => item.product.slug),
        productNotes: Object.fromEntries(shelf.products.filter((item) => item.note).map((item) => [item.product.slug, item.note ?? ""]))
      }));
    },
    [...demoShelves].sort((a, b) => a.displayOrder - b.displayOrder)
  );
}

export async function getShelf(slug: string): Promise<(CuratedShelf & { products: Product[] }) | null> {
  const dbShelf = await tryDatabase(
    async (client) => {
      const shelf = await client.curatedShelf.findUnique({
        where: { slug },
        include: { products: { orderBy: { sortOrder: "asc" }, include: { product: true } } }
      });
      if (!shelf) return null;
      return {
        id: shelf.id,
        title: shelf.title,
        slug: shelf.slug,
        introduction: shelf.introduction,
        coverImageUrl: shelf.coverImageUrl,
        curatorName: shelf.curatorName ?? undefined,
        homepageVisible: shelf.homepageVisible,
        displayOrder: shelf.displayOrder,
        productSlugs: shelf.products.map((item) => item.product.slug),
        productNotes: Object.fromEntries(shelf.products.filter((item) => item.note).map((item) => [item.product.slug, item.note ?? ""])),
        products: shelf.products.map((item) => mapProduct(item.product))
      };
    },
    null
  );
  if (dbShelf) return dbShelf;

  const shelf = demoShelves.find((item) => item.slug === slug);
  if (!shelf) return null;
  const products = shelf.productSlugs
    .map((productSlug) => demoProducts.find((product) => product.slug === productSlug))
    .filter((product): product is Product => Boolean(product));
  return { ...shelf, products };
}

export async function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug) ?? null;
}

export function getSearchFacets(products: Product[]) {
  return {
    conditions: Array.from(new Set(products.map((product) => product.conditionGrade))).sort(),
    platforms: Array.from(new Set(products.map((product) => product.platform).filter((value): value is string => Boolean(value)))).sort()
  };
}
