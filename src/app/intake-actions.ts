"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { categoryRoute, classifyCandidate } from "@/lib/intake/classification";
import { lookupMetadata, type MetadataCandidate } from "@/lib/intake/metadata";
import { parseBarcode } from "@/lib/intake/barcode";

export type LookupState = {
  ok: boolean;
  message: string;
  intakeId?: string;
  barcode?: string;
  barcodeType?: string;
  candidates?: MetadataCandidate[];
  duplicates?: Array<{ id: string; title: string; sku: string; state: string; publicPath: string }>;
  ambiguous?: boolean;
};

export type PublishState = { ok: boolean; message: string };

const defaultLookupState: LookupState = { ok: false, message: "" };

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 90);
}

function splitList(value: FormDataEntryValue | null) {
  return String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
}

async function audit(userId: string, action: string, entity: string, entityId: string, before: unknown, after: unknown) {
  await db.auditLog.create({ data: { userId, action, entity, entityId, before: before ? JSON.parse(JSON.stringify(before)) : undefined, after: after ? JSON.parse(JSON.stringify(after)) : undefined } });
}

async function saveImages(files: FormDataEntryValue[]) {
  const urls: string[] = [];
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  for (const entry of files) {
    if (!(entry instanceof File) || entry.size === 0) continue;
    if (!["image/jpeg", "image/png", "image/webp"].includes(entry.type)) throw new Error("Images must be JPG, PNG or WebP.");
    if (entry.size > 5_000_000) throw new Error("Each image must be under 5MB.");
    const ext = entry.type === "image/png" ? "png" : entry.type === "image/webp" ? "webp" : "jpg";
    const filename = `${Date.now()}-${slugify(entry.name)}.${ext}`;
    await writeFile(path.join(uploadDir, filename), Buffer.from(await entry.arrayBuffer()));
    urls.push(`/uploads/${filename}`);
  }
  return urls;
}

async function generateSku() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const sku = `BMGX-${Date.now()}-${Math.floor(Math.random() * 9999).toString().padStart(4, "0")}`;
    const existing = await db.product.findUnique({ where: { sku }, select: { id: true } });
    if (!existing) return sku;
  }
  return `BMGX-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function lookupBarcodeAction(_previous: LookupState = defaultLookupState, formData: FormData): Promise<LookupState> {
  void _previous;
  const user = await requireUser(["STAFF", "ADMIN"]);
  const barcode = z.string().min(1).parse(formData.get("barcode"));
  const result = await lookupMetadata(barcode);
  const duplicates = await db.product.findMany({
    where: {
      OR: [
        { barcode: result.parsed.normalized },
        { isbn: result.parsed.normalized },
        { ean: result.parsed.normalized },
        { sku: result.parsed.normalized },
        { catalogueProduct: { OR: [{ isbn10: result.parsed.normalized }, { isbn13: result.parsed.normalized }, { ean: result.parsed.normalized }, { upc: result.parsed.normalized }] } }
      ]
    },
    select: { id: true, title: true, sku: true, inventoryState: true, slug: true }
  });
  const session = await db.intakeSession.create({
    data: {
      userId: user.id,
      intakeType: "BARCODE",
      barcode: result.parsed.normalized,
      barcodeType: result.parsed.type,
      status: result.candidates.length ? "CANDIDATES_FOUND" : "NO_MATCH",
      candidatePayload: JSON.parse(JSON.stringify(result.candidates)),
      duplicatePayload: JSON.parse(JSON.stringify(duplicates))
    }
  });
  await audit(user.id, "intake.lookup", "IntakeSession", session.id, null, { barcode: result.parsed, candidates: result.candidates.length, duplicates: duplicates.length });
  if (!result.parsed.valid) return { ok: false, message: result.errors[0] ?? "Invalid barcode.", intakeId: session.id, barcode: result.parsed.normalized, barcodeType: result.parsed.type, candidates: [], duplicates: [], ambiguous: false };
  if (!result.candidates.length) return { ok: false, message: result.errors.length ? `No candidate found. ${result.errors.join(" ")}` : "No metadata candidate found for this barcode.", intakeId: session.id, barcode: result.parsed.normalized, barcodeType: result.parsed.type, candidates: [], duplicates: duplicates.map((item) => ({ id: item.id, title: item.title, sku: item.sku, state: item.inventoryState, publicPath: `/products/${item.slug}` })), ambiguous: false };
  return {
    ok: true,
    message: result.ambiguous ? "Multiple possible matches found. Staff selection is required." : "Candidate found. Confirm identity before creating stock.",
    intakeId: session.id,
    barcode: result.parsed.normalized,
    barcodeType: result.parsed.type,
    candidates: result.candidates,
    duplicates: duplicates.map((item) => ({ id: item.id, title: item.title, sku: item.sku, state: item.inventoryState, publicPath: `/products/${item.slug}` })),
    ambiguous: result.ambiguous
  };
}

const rapidListingSchema = z.object({
  intakeId: z.string(),
  candidate: z.string(),
  categoryOverride: z.enum(["BOOKS", "GAMES", "CONSOLES", "VINYL", "RARE_COLLECTIBLE", "MUSIC_FILM", "JEWELLERY_CURIOSITIES", "ACCESSORIES", "COLLECTIBLES", "MISCELLANEOUS"]),
  platformOverride: z.string().optional(),
  markRare: z.coerce.boolean().optional(),
  detectedType: z.string().optional(),
  publicDepartment: z.string().optional(),
  conditionGrade: z.enum(["NEW_SEALED", "LIKE_NEW", "VERY_GOOD", "GOOD", "ACCEPTABLE", "FOR_PARTS_UNTESTED", "STAFF_REVIEWED_COLLECTIBLE"]),
  priceMajor: z.coerce.number().min(0.01),
  quantity: z.coerce.number().int().min(1).max(1),
  shelfLocation: z.string().min(2),
  stockLocationId: z.string().optional(),
  conditionReport: z.string().min(8),
  included: z.string().optional(),
  missing: z.string().optional(),
  testedStatus: z.string().optional(),
  staffNotes: z.string().optional(),
  collectionOnly: z.coerce.boolean().optional(),
  shippingProfile: z.string().optional(),
  publishNow: z.coerce.boolean().optional(),
  dustJacketPresent: z.string().optional(),
  manualPresent: z.string().optional(),
  powersOn: z.string().optional(),
  serialNumber: z.string().optional(),
  otherDefects: z.string().optional()
});

export async function publishRapidListing(_: PublishState, formData: FormData): Promise<PublishState> {
  const user = await requireUser(["STAFF", "ADMIN"]);
  const parsed = rapidListingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check listing details." };
  const candidate = JSON.parse(parsed.data.candidate) as MetadataCandidate;
  const intake = await db.intakeSession.findUniqueOrThrow({ where: { id: parsed.data.intakeId } });
  if (intake.createdProductId) return { ok: false, message: "This intake has already created an inventory item. Scan another item to prevent duplicates." };
  const imageUrls = await saveImages(formData.getAll("images"));
  const classification = classifyCandidate(candidate, {
    category: parsed.data.categoryOverride,
    platform: parsed.data.platformOverride || null,
    rare: Boolean(parsed.data.markRare)
  });
  const requiresActualPhoto = classification.productCategory === "RARE_COLLECTIBLE" || classification.productCategory === "COLLECTIBLES" || parsed.data.conditionGrade === "STAFF_REVIEWED_COLLECTIBLE";
  if (requiresActualPhoto && imageUrls.length === 0) return { ok: false, message: "Actual item photographs are required for collectible or staff-reviewed items." };
  const sku = await generateSku();
  const title = candidate.creator ? `${candidate.title} - ${candidate.creator}` : candidate.title;
  const conditionDetails = {
    dustJacketPresent: parsed.data.dustJacketPresent ?? null,
    manualPresent: parsed.data.manualPresent ?? null,
    powersOn: parsed.data.powersOn ?? null,
    serialNumber: parsed.data.serialNumber || null,
    otherDefects: parsed.data.otherDefects || null
  };
  const product = await db.$transaction(async (tx) => {
    const catalogue = await tx.catalogueProduct.upsert({
      where: { id: `catalogue-${candidate.id}` },
      create: {
        id: `catalogue-${candidate.id}`,
        title: candidate.title,
        subtitle: candidate.subtitle,
        category: classification.productCategory,
        creator: candidate.creator,
        publisher: candidate.publisher,
        platform: classification.platform,
        region: candidate.region,
        format: candidate.format,
        isbn10: candidate.isbn10,
        isbn13: candidate.isbn13,
        ean: candidate.ean,
        upc: candidate.upc,
        language: candidate.language,
        publicationDate: candidate.publicationDate,
        releaseDate: candidate.releaseDate,
        edition: candidate.edition,
        pageCount: candidate.pageCount,
        subjects: candidate.subjects,
        description: candidate.description,
        coverImageUrl: candidate.coverImageUrl,
        sourceProvider: candidate.provider,
        sourceId: candidate.id,
        sourcePayload: JSON.parse(JSON.stringify(candidate.sourcePayload ?? {}))
      },
      update: {
        category: classification.productCategory,
        platform: classification.platform,
        updatedAt: new Date()
      }
    });
    const created = await tx.product.create({
      data: {
        title,
        slug: `${slugify(title)}-${sku.toLowerCase()}`,
        category: classification.productCategory,
        subcategory: classification.publicDepartment,
        creator: candidate.creator,
        publisher: candidate.publisher,
        platform: classification.platform,
        format: candidate.format,
        isbn: candidate.isbn13 ?? candidate.isbn10,
        ean: candidate.ean,
        barcode: intake.barcode,
        catalogueProductId: catalogue.id,
        sku,
        priceMinor: Math.round(parsed.data.priceMajor * 100),
        shortDescription: `${candidate.title}. Metadata from ${candidate.provider}; condition recorded by Bookmart staff.`,
        description: candidate.description ?? `${candidate.title}. Catalogue metadata supplied by ${candidate.provider}. This listing describes one physical shop copy.`,
        conditionGrade: parsed.data.conditionGrade,
        conditionReport: parsed.data.conditionReport,
        included: splitList(parsed.data.included ?? ""),
        missing: splitList(parsed.data.missing ?? ""),
        testedStatus: parsed.data.testedStatus || null,
        shelfLocation: parsed.data.shelfLocation,
        stockLocationId: parsed.data.stockLocationId || null,
        quantity: parsed.data.quantity,
        inventoryState: parsed.data.publishNow ? "PUBLISHED" : "DRAFT",
        publishedAt: parsed.data.publishNow ? new Date() : null,
        imageUrl: imageUrls[0] ?? candidate.coverImageUrl ?? "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=82",
        gallery: imageUrls.length ? imageUrls : [candidate.coverImageUrl ?? "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=82"],
        staffNotes: parsed.data.staffNotes || null,
        collectionOnly: Boolean(parsed.data.collectionOnly),
        shippingProfile: parsed.data.shippingProfile || "standard",
        conditionDetails,
        isRare: classification.productCategory === "RARE_COLLECTIBLE"
      }
    });
    await tx.intakeSession.update({
      where: { id: intake.id },
      data: {
        status: parsed.data.publishNow ? "PUBLISHED" : "DRAFT_CREATED",
        selectedCandidate: JSON.parse(JSON.stringify(candidate)),
        createdProductId: created.id
      }
    });
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: parsed.data.publishNow ? "intake.publish" : "intake.draft",
        entity: "Product",
        entityId: created.id,
        after: JSON.parse(JSON.stringify({
          productId: created.id,
          sku: created.sku,
          barcode: intake.barcode,
          metadataProvider: candidate.provider,
          classification,
          categoryOverride: parsed.data.categoryOverride,
          platformOverride: parsed.data.platformOverride || null,
          staffCategoryOverride: parsed.data.categoryOverride !== candidate.category
        }))
      }
    });
    return created;
  });
  revalidatePath("/");
  revalidatePath("/new-arrivals");
  revalidatePath("/search");
  revalidatePath("/staff/inventory");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath(categoryRoute(classification.productCategory, classification.platform).split("?")[0] ?? "/search");
  if (classification.productCategory === "GAMES") revalidatePath("/games");
  redirect(`/staff/intake/success/${product.id}`);
}

export async function ocrIdentifierAction(_: LookupState, formData: FormData): Promise<LookupState> {
  await requireUser(["STAFF", "ADMIN"]);
  const text = String(formData.get("ocrText") ?? "");
  const candidate = text.match(/[0-9X -]{6,20}/i)?.[0] ?? "";
  const parsed = parseBarcode(candidate);
  if (!candidate || !parsed.valid) return { ok: false, message: "OCR did not find a valid identifier. Confirm the digits manually before lookup." };
  const next = new FormData();
  next.set("barcode", candidate);
  return lookupBarcodeAction(defaultLookupState, next);
}
