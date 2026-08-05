import type { ConditionGrade, ProductCategory } from "@prisma/client";

import { requireStaffOnServer } from "./auth-impl.server";
import { db } from "./db";
import { classifyCandidate } from "./intake/classification";
import { lookupMetadata, type MetadataCandidate } from "./intake/metadata";

type ItemKind = "book" | "game" | "music-film" | "rare";
type RoomId = "library" | "arcade" | "sound-vision" | "curiosity";

const fallbackImage =
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=82";

function kindCategory(kind: ItemKind): ProductCategory {
  if (kind === "book") return "BOOKS";
  if (kind === "game") return "GAMES";
  if (kind === "music-film") return "MUSIC_FILM";
  return "RARE_COLLECTIBLE";
}

function conditionGrade(condition: string): ConditionGrade {
  const normalized = condition.toLowerCase();
  if (normalized === "like new" || normalized === "excellent") return "LIKE_NEW";
  if (normalized === "very good" || normalized === "boxed") return "VERY_GOOD";
  if (normalized === "good") return "GOOD";
  if (
    normalized === "acceptable" ||
    normalized === "well read" ||
    normalized === "poor / reading copy"
  )
    return "ACCEPTABLE";
  if (normalized === "collectible") return "STAFF_REVIEWED_COLLECTIBLE";
  if (normalized === "for parts / repair") return "FOR_PARTS_UNTESTED";
  if (normalized === "new / sealed") return "NEW_SEALED";
  return "GOOD";
}

function roomPath(room: RoomId, slug: string) {
  const base = room === "curiosity" ? "/curiosity-cabinet" : `/${room}`;
  return `${base}/${slug}`;
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

async function generateSku() {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const sku = `BMGX-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.floor(
      Math.random() * 100000,
    )
      .toString()
      .padStart(5, "0")}`;
    if (!(await db.product.findUnique({ where: { sku }, select: { id: true } }))) return sku;
  }
  return `BMGX-${crypto.randomUUID().slice(0, 12).toUpperCase()}`;
}

function publicCandidate(candidate: MetadataCandidate) {
  return {
    id: candidate.id,
    provider: candidate.provider,
    category: candidate.category,
    title: candidate.title,
    creator: candidate.creator,
    publisher: candidate.publisher,
    platform: candidate.platform,
    format: candidate.format,
    isbn10: candidate.isbn10,
    isbn13: candidate.isbn13,
    ean: candidate.ean,
    upc: candidate.upc,
    publicationDate: candidate.publicationDate,
    edition: candidate.edition,
    coverImageUrl: candidate.coverImageUrl,
    description: candidate.description,
    subjects: candidate.subjects,
  };
}

export async function lookupBarcodeOnServer(data: { barcode: string; kind: ItemKind }) {
  const user = await requireStaffOnServer();
  const result = await lookupMetadata(data.barcode);
  const normalized = result.parsed.normalized;
  const duplicates = normalized
    ? await db.product.findMany({
        where: {
          OR: [
            { barcode: normalized },
            { isbn: normalized },
            { ean: normalized },
            { sku: normalized },
            {
              catalogueProduct: {
                OR: [
                  { isbn10: normalized },
                  { isbn13: normalized },
                  { ean: normalized },
                  { upc: normalized },
                ],
              },
            },
          ],
        },
        select: {
          id: true,
          title: true,
          sku: true,
          inventoryState: true,
          slug: true,
          subcategory: true,
        },
        take: 8,
      })
    : [];
  const candidate = result.candidates[0] ?? null;
  const intake = await db.intakeSession.create({
    data: {
      userId: user.id,
      intakeType: "BARCODE",
      barcode: normalized,
      barcodeType: result.parsed.type,
      status: candidate ? "CANDIDATES_FOUND" : result.parsed.valid ? "NO_MATCH" : "INVALID",
      candidatePayload: JSON.parse(JSON.stringify(result.candidates)),
      duplicatePayload: JSON.parse(JSON.stringify(duplicates)),
      errorMessage: result.errors.join(" ") || null,
    },
  });
  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "intake.lookup",
      entity: "IntakeSession",
      entityId: intake.id,
      after: {
        barcode: normalized,
        type: result.parsed.type,
        provider: candidate?.provider ?? null,
        duplicateCount: duplicates.length,
      },
    },
  });
  return {
    ok: result.parsed.valid,
    intakeId: intake.id,
    barcode: normalized,
    barcodeType: result.parsed.type,
    candidate: candidate ? publicCandidate(candidate) : null,
    suggestedDepartment: candidate
      ? classifyCandidate(candidate).publicDepartment
      : classifyCandidate({
          category: kindCategory(data.kind),
          platform: null,
          subjects: [],
          title: "",
          edition: null,
        }).publicDepartment,
    duplicates: duplicates.map((item) => ({
      id: item.id,
      title: item.title,
      sku: item.sku,
      state: item.inventoryState,
      publicPath: roomPath((item.subcategory as RoomId) || "library", item.slug),
    })),
    message: !result.parsed.valid
      ? (result.errors[0] ?? "That barcode is not valid.")
      : candidate
        ? `Found ${candidate.title}. Check it before publishing.`
        : "No reliable match found. Keep the barcode and fill in the item by hand.",
  };
}

function validatePhotos(photos: string[]) {
  for (const photo of photos) {
    if (!/^data:image\/(jpeg|png|webp);base64,/.test(photo))
      throw new Error("A photo is not a supported image.");
    if (photo.length > 1_400_000)
      throw new Error("One photo is too large. Retake it or choose a smaller image.");
  }
}

export async function publishListingOnServer(data: {
  intakeId?: string;
  kind: ItemKind;
  barcode?: string;
  candidate?: unknown;
  title: string;
  maker: string;
  year: string;
  extra: string;
  room: RoomId;
  shelf: string;
  condition: string;
  price: string;
  note: string;
  included: string;
  missing: string;
  deliveryEligible: boolean;
  clickCollectEligible: boolean;
  photos: string[];
}) {
  const user = await requireStaffOnServer();
  validatePhotos(data.photos);
  const intake = data.intakeId
    ? await db.intakeSession.findUnique({ where: { id: data.intakeId } })
    : null;
  if (intake?.createdProductId)
    throw new Error("This item was already published. Start a new scan for another copy.");

  const rawCandidate =
    data.candidate && typeof data.candidate === "object"
      ? (data.candidate as Partial<MetadataCandidate>)
      : null;
  const candidate: MetadataCandidate = {
    id: rawCandidate?.id || `manual-${data.barcode || crypto.randomUUID()}`,
    provider: rawCandidate?.provider || "Staff manual entry",
    confidence: rawCandidate?.confidence ?? 1,
    category: kindCategory(data.kind),
    title: data.title,
    subtitle: null,
    creator: data.maker || null,
    publisher: rawCandidate?.publisher || (data.kind === "book" ? data.extra || null : null),
    platform:
      data.kind === "game"
        ? data.maker || rawCandidate?.platform || null
        : rawCandidate?.platform || null,
    region: rawCandidate?.region || null,
    format: rawCandidate?.format || data.extra || null,
    isbn10: rawCandidate?.isbn10 || null,
    isbn13: rawCandidate?.isbn13 || null,
    ean: rawCandidate?.ean || null,
    upc: rawCandidate?.upc || null,
    language: rawCandidate?.language || null,
    publicationDate: data.year || rawCandidate?.publicationDate || null,
    releaseDate: rawCandidate?.releaseDate || null,
    edition: rawCandidate?.edition || null,
    pageCount: rawCandidate?.pageCount || null,
    subjects: rawCandidate?.subjects || [],
    description: rawCandidate?.description || null,
    coverImageUrl: rawCandidate?.coverImageUrl || null,
    sourcePayload: rawCandidate?.sourcePayload || {},
  };
  const roomCategory: Record<RoomId, ProductCategory> = {
    library: "BOOKS",
    arcade: "GAMES",
    "sound-vision": "MUSIC_FILM",
    curiosity: "RARE_COLLECTIBLE",
  };
  const classification = classifyCandidate(candidate, {
    category: roomCategory[data.room],
    platform: candidate.platform,
    rare: data.kind === "rare",
  });
  if ((data.kind === "rare" || data.condition === "Collectible") && data.photos.length === 0) {
    throw new Error("Take at least one real photo for rare or collectible items.");
  }
  const sku = await generateSku();
  const slug = `${slugify(data.title)}-${sku.toLowerCase()}`;
  const gallery = data.photos.length ? data.photos : [candidate.coverImageUrl || fallbackImage];
  const product = await db.$transaction(async (tx) => {
    const catalogue = await tx.catalogueProduct.upsert({
      where: { id: `catalogue-${candidate.id}` },
      create: {
        id: `catalogue-${candidate.id}`,
        title: data.title,
        category: classification.productCategory,
        creator: data.maker || null,
        publisher: candidate.publisher,
        platform: classification.platform,
        format: candidate.format,
        isbn10: candidate.isbn10,
        isbn13: candidate.isbn13,
        ean: candidate.ean,
        upc: candidate.upc,
        language: candidate.language,
        publicationDate: data.year || candidate.publicationDate,
        edition: candidate.edition,
        pageCount: candidate.pageCount,
        subjects: candidate.subjects,
        description: candidate.description,
        coverImageUrl: candidate.coverImageUrl,
        sourceProvider: candidate.provider,
        sourceId: candidate.id,
        sourcePayload: JSON.parse(JSON.stringify(candidate.sourcePayload ?? {})),
      },
      update: {
        category: classification.productCategory,
        platform: classification.platform,
        updatedAt: new Date(),
      },
    });
    const created = await tx.product.create({
      data: {
        title: data.title,
        slug,
        category: classification.productCategory,
        subcategory: data.room,
        creator: data.maker || null,
        publisher: candidate.publisher,
        platform: classification.platform,
        format: candidate.format,
        isbn: candidate.isbn13 || candidate.isbn10,
        ean: candidate.ean,
        barcode: data.barcode || intake?.barcode || null,
        catalogueProductId: catalogue.id,
        sku,
        priceMinor: Math.round(Number(data.price) * 100),
        shortDescription:
          data.note || `${data.title}, checked and priced in the Talbot Street shop.`,
        description:
          data.note || candidate.description || `${data.title}. One physical second-hand copy.`,
        conditionGrade: conditionGrade(data.condition),
        conditionReport: data.note || `${data.condition}. Checked by ${user.name}.`,
        included: data.included ? [data.included] : data.extra ? [data.extra] : [],
        missing: data.missing ? [data.missing] : [],
        shelfLocation: data.shelf,
        quantity: 1,
        inventoryState: "PUBLISHED",
        publishedAt: new Date(),
        imageUrl: gallery[0]!,
        gallery,
        shippingProfile: data.deliveryEligible ? "ireland-standard" : null,
        collectionOnly: !data.deliveryEligible,
        deliveryEligible: data.deliveryEligible,
        clickCollectEligible: data.clickCollectEligible,
        isRare: data.kind === "rare",
      },
    });
    if (intake) {
      await tx.intakeSession.update({
        where: { id: intake.id },
        data: {
          status: "PUBLISHED",
          selectedCandidate: JSON.parse(JSON.stringify(candidate)),
          createdProductId: created.id,
        },
      });
    }
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: "intake.publish",
        entity: "Product",
        entityId: created.id,
        after: {
          barcode: data.barcode || intake?.barcode || null,
          metadataProvider: candidate.provider,
          suggestedCategory: rawCandidate?.category || null,
          finalCategory: classification.productCategory,
          department: classification.publicDepartment,
          shelf: data.shelf,
          deliveryEligible: data.deliveryEligible,
          clickCollectEligible: data.clickCollectEligible,
          sku,
        },
      },
    });
    return created;
  });
  return {
    ok: true as const,
    id: product.id,
    title: product.title,
    slug: product.slug,
    sku: product.sku,
    publicPath: roomPath(data.room, product.slug),
    labelPath: `/staff/label/${product.id}`,
    category: classification.publicDepartment,
    condition: data.condition,
    shelf: product.shelfLocation,
    priceMinor: product.priceMinor,
    imageUrl: product.imageUrl,
  };
}

export async function staffDashboardOnServer() {
  await requireStaffOnServer();
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const [publishedToday, drafts, review, orders, recent] = await Promise.all([
    db.product.count({ where: { publishedAt: { gte: since } } }),
    db.product.count({ where: { inventoryState: "DRAFT" } }),
    db.product.count({ where: { inventoryState: "NEEDS_REVIEW" } }),
    db.order.count({ where: { status: { in: ["PAID", "PROCESSING", "READY_FOR_COLLECTION"] } } }),
    db.product.findMany({
      where: { inventoryState: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
  ]);
  return {
    publishedToday,
    drafts,
    review,
    orders,
    recent: recent.map((item) => ({
      id: item.id,
      title: item.title,
      shelf: item.shelfLocation,
      priceMinor: item.priceMinor,
      updated: item.updatedAt.toISOString(),
    })),
  };
}

export async function staffInventoryOnServer() {
  await requireStaffOnServer();
  const items = await db.product.findMany({
    where: { inventoryState: { in: ["PUBLISHED", "RESERVED"] } },
    orderBy: { updatedAt: "desc" },
    take: 250,
  });
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    maker: item.creator || item.publisher || "Bookmart",
    room: item.subcategory,
    shelf: item.shelfLocation,
    state: item.inventoryState,
    priceMinor: item.priceMinor,
    updated: item.updatedAt.toISOString(),
    sku: item.sku,
  }));
}
