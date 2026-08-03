import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";
import { demoProducts, demoShelves } from "../src/lib/demo-data";

const prisma = new PrismaClient();

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.emailEvent.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.stripeWebhookEvent.deleteMany();
  await prisma.inventoryReservation.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.session.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.curatedShelfProduct.deleteMany();
  await prisma.curatedShelf.deleteMany();
  await prisma.product.deleteMany();
  await prisma.stockLocation.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.legalPage.deleteMany();

  await prisma.user.createMany({
    data: [
      { email: "customer@bookmart.demo", name: "Demo Customer", role: "CUSTOMER", passwordHash: hashPassword("Customer123!") },
      { email: "staff@bookmart.demo", name: "Demo Staff", role: "STAFF", passwordHash: hashPassword("Staff123!") },
      { email: "admin@bookmart.demo", name: "Demo Admin", role: "ADMIN", passwordHash: hashPassword("Admin123!") }
    ]
  });

  const locations = await Promise.all([
    prisma.stockLocation.create({ data: { name: "Front Books", publicLabel: "Books / Front shelves" } }),
    prisma.stockLocation.create({ data: { name: "Games Wall", publicLabel: "Games / Main wall" } }),
    prisma.stockLocation.create({ data: { name: "Glass Cabinet", publicLabel: "Cabinet / Collectibles" } }),
    prisma.stockLocation.create({ data: { name: "Vinyl Bay", publicLabel: "Vinyl / Browse bay" } })
  ]);

  await prisma.product.createMany({
    data: demoProducts.map((product, index) => ({
      title: product.title,
      slug: product.slug,
      category: product.category,
      subcategory: product.subcategory,
      creator: product.creator,
      publisher: product.publisher,
      platform: product.platform,
      format: product.format,
      isbn: product.isbn,
      ean: product.ean,
      sku: product.sku,
      priceMinor: product.priceMinor,
      currency: "EUR",
      shortDescription: product.shortDescription,
      description: product.description,
      conditionGrade: product.conditionGrade,
      conditionReport: product.conditionReport,
      included: product.included,
      missing: product.missing,
      testedStatus: product.testedStatus,
      shelfLocation: product.shelfLocation,
      stockLocationId: locations[index % locations.length].id,
      quantity: product.quantity,
      inventoryState: product.inventoryState,
      isFeatured: product.isFeatured,
      isStaffPick: product.isStaffPick,
      isRare: product.isRare,
      imageUrl: product.imageUrl,
      gallery: product.gallery,
      publishedAt: new Date()
    }))
  });

  for (const shelf of demoShelves) {
    const createdShelf = await prisma.curatedShelf.create({
      data: {
        title: shelf.title,
        slug: shelf.slug,
        introduction: shelf.introduction,
        coverImageUrl: shelf.coverImageUrl,
        curatorName: shelf.curatorName,
        homepageVisible: shelf.homepageVisible,
        displayOrder: shelf.displayOrder,
        status: "PUBLISHED"
      }
    });

    for (const [index, productSlug] of shelf.productSlugs.entries()) {
      const product = await prisma.product.findUniqueOrThrow({ where: { slug: productSlug } });
      await prisma.curatedShelfProduct.create({
        data: {
          shelfId: createdShelf.id,
          productId: product.id,
          sortOrder: index,
          note: shelf.productNotes[productSlug]
        }
      });
    }
  }

  const orderProduct = await prisma.product.findFirstOrThrow({ where: { slug: "playstation-2-racing-collection" } });
  await prisma.order.create({
    data: {
      orderNumber: "BMGX-1001",
      checkoutReference: "demo-checkout-reference",
      customerEmail: "customer@bookmart.demo",
      customerName: "Demo Customer",
      customerPhone: "+353 1 000 0000",
      status: "READY_FOR_COLLECTION",
      paymentStatus: "PAID",
      deliveryMethod: "CLICK_AND_COLLECT",
      subtotalMinor: orderProduct.priceMinor,
      shippingCostMinor: 0,
      totalMinor: orderProduct.priceMinor,
      paidAt: new Date(),
      readyAt: new Date(),
      emailStatus: "SKIPPED",
      items: {
        create: [{
          productId: orderProduct.id,
          productSlug: orderProduct.slug,
          title: orderProduct.title,
          skuSnapshot: orderProduct.sku,
          priceMinor: orderProduct.priceMinor,
          quantity: 1,
          categorySnapshot: orderProduct.category,
          imageUrlSnapshot: orderProduct.imageUrl,
          conditionSnapshot: orderProduct.conditionGrade
        }]
      }
    }
  });

  await prisma.siteSetting.createMany({
    data: [
      { key: "shipping.ireland.standard", label: "Ireland standard shipping", group: "Shipping", value: "EUR 5.95 flat rate" },
      { key: "shipping.allowed.countries", label: "Allowed shipping countries", group: "Shipping", value: "IE" },
      { key: "shipping.free.threshold", label: "Free shipping threshold", group: "Shipping", value: "7500" },
      { key: "shipping.standard.minor", label: "Ireland standard shipping minor units", group: "Shipping", value: "595" },
      { key: "shipping.handling.time", label: "Handling time", group: "Shipping", value: "Demo configuration: 1-2 shop days after payment" },
      { key: "collection.instructions", label: "Click and collect instructions", group: "Shipping", value: "Bring your order number and photo ID to 73 Talbot Street, Dublin 1." },
      { key: "stripe.mode", label: "Stripe mode", group: "Stripe", value: "Inactive until STRIPE_SECRET_KEY is configured" },
      { key: "stripe.enabled", label: "Stripe enabled", group: "Stripe", value: process.env.STRIPE_ENABLED ?? "false" },
      { key: "stripe.webhook.status", label: "Stripe webhook status", group: "Stripe", value: process.env.STRIPE_WEBHOOK_SECRET ? "configured" : "missing" },
      { key: "email.enabled", label: "Email enabled", group: "Email", value: process.env.EMAIL_ENABLED ?? "false" },
      { key: "email.provider", label: "Email provider", group: "Email", value: process.env.EMAIL_PROVIDER ?? "disabled" },
      { key: "openai.mode", label: "OpenAI mode", group: "OpenAI", value: "Inactive until Milestone 4" },
      { key: "email.from", label: "Transactional email sender", group: "Email", value: "Not configured" },
      { key: "homepage.hero", label: "Homepage headline", group: "Homepage", value: "Books, games, vinyl and curious finds from Talbot Street." },
      { key: "opening.hours", label: "Opening hours", group: "Store", value: "Owner confirmation required" }
      ,
      { key: "intake.barcode.enabled", label: "Barcode intake enabled", group: "Intake", value: process.env.BARCODE_INTAKE_ENABLED ?? "true" },
      { key: "intake.ocr.enabled", label: "OCR fallback enabled", group: "Intake", value: process.env.OCR_FALLBACK_ENABLED ?? "false" },
      { key: "intake.ai.enabled", label: "AI photo identification enabled", group: "Intake", value: process.env.AI_PHOTO_IDENTIFICATION_ENABLED ?? "false" },
      { key: "intake.openai.status", label: "OpenAI configured status", group: "Intake", value: process.env.OPENAI_API_KEY ? "configured" : "not configured" },
      { key: "intake.metadata.priority", label: "Metadata provider priority", group: "Intake", value: process.env.METADATA_PROVIDER_PRIORITY ?? "openlibrary,demo" },
      { key: "intake.min.required", label: "Minimum fields before publication", group: "Intake", value: "identity, condition, price, shelf location" },
      { key: "intake.actual.photo.requirements", label: "Actual-photo requirements by category", group: "Intake", value: "required for collectibles and staff-reviewed items" },
      { key: "intake.new.arrivals", label: "Automatic inclusion in New Arrivals", group: "Intake", value: "true" }
    ]
  });

  await prisma.legalPage.createMany({
    data: [
      { slug: "privacy", title: "Privacy Policy", body: "Draft privacy content requiring professional Irish GDPR review before launch." },
      { slug: "terms", title: "Terms and Conditions", body: "Draft terms requiring professional legal review before launch." },
      { slug: "returns", title: "Returns Policy", body: "Draft returns content requiring professional review before launch." }
    ]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
