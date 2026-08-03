# PROJECT OVERVIEW

## Tech Stack
- Next.js 16 App Router, React 19, TypeScript.
- Prisma ORM with PostgreSQL.
- Server Actions for auth, catalogue, inventory, intake, orders and settings mutations.
- ZXing browser barcode scanning via `@zxing/browser` and `@zxing/library`.
- Stripe Checkout and webhooks for payments.
- Vitest unit tests and Playwright E2E tests.

## Folder Structure
- `src/app`: App Router pages, layouts, route handlers and server actions.
- `src/components`: Shared UI components, product cards, forms, intake workflow and editor.
- `src/lib`: Data access, auth/session utilities, catalogue queries, payments and intake logic.
- `src/lib/intake`: Barcode parsing, metadata lookup, classification and AI-disabled boundary.
- `prisma`: Prisma schema, migrations and seed data.
- `tests`: Vitest and Playwright tests.
- `docs`: Existing product, security, design and architecture notes.
- `public/storefront`: Storefront hero assets used by the accepted public homepage.

## Routes
- Public: `/`, `/books`, `/games`, `/video-games`, `/consoles`, `/vinyl`, `/rare-collectible`, `/rare-and-collectible`, `/music-film`, `/music-and-film`, `/collections`, `/collections/[slug]`, `/products/[slug]`, `/search`, `/basket`, `/checkout`, `/sell-or-trade`, `/visit-us`, legal and information pages.
- Staff: `/staff`, `/staff/intake`, `/staff/intake/success/[id]`, `/staff/inventory`, `/staff/inventory/new`, `/staff/inventory/[id]`, `/staff/inventory/[id]/edit`, `/staff/inventory/[id]/label`, `/staff/orders`, `/staff/locations`.
- Admin: `/admin`, `/admin/settings`, `/admin/audit`, `/admin/users`, `/admin/legal`, `/admin/curated-shelves`, `/admin/ai-usage`.
- Account: `/account/login`, `/account`, `/account/orders`, `/account/forgot-password`, `/account/reset-password`, `/account/unauthorized`.

## Authentication
- Auth is custom cookie/session based, not NextAuth.
- `src/lib/auth.ts` reads the signed `bookmart_session` cookie and loads the matching `Session` and `User`.
- `middleware.ts` protects `/staff`, `/admin` and `/account` routes by role.
- Roles are `CUSTOMER`, `STAFF`, `ADMIN`.
- Staff and admin can access staff routes. Admin-only routes require `ADMIN`.
- Login action is in `src/app/auth-actions.ts`.
- Demo credentials are shown only outside production.
- Owner/staff passwords must be set via production-safe user creation or reset flow, not hard-coded.

## Database Schema
- Main models: `User`, `Session`, `Product`, `CatalogueProduct`, `IntakeSession`, `StockLocation`, `Order`, `OrderItem`, `InventoryReservation`, `AuditLog`, `SiteSetting`, `CuratedShelf`, `WantedRequest`, `SellTradeSubmission`.
- Main enums: `ProductCategory`, `InventoryState`, `ConditionGrade`, `Role`, order/payment/delivery enums.
- Products are unique physical listings with `sku`, `slug`, `barcode`, `category`, `platform`, `priceMinor`, `conditionGrade`, `shelfLocation`, `quantity`, `inventoryState`, image fields and optional catalogue metadata relation.

## Barcode Scanner Flow
- Route: `/staff/intake`.
- Component: `src/components/intake-workflow.tsx`.
- Server actions: `src/app/intake-actions.ts`.
- Barcode parser: `src/lib/intake/barcode.ts`.
- Supported formats: ISBN-10, ISBN-13, EAN-8, EAN-13, UPC-A, UPC-E and internal Bookmart SKU/QR codes.
- Camera scanning uses rear camera where available, supports manual barcode entry, duplicate scan protection and HTTPS guidance.
- Metadata lookup uses Open Library for ISBNs and local/test demo metadata only outside production.
- If metadata is missing, staff can complete the item manually while preserving the scanned barcode.

## Inventory Flow
- Staff dashboard makes `Scan and list item` the primary action.
- Intake creates an `IntakeSession`, looks up metadata, checks duplicates, then shows category/platform review and physical copy fields.
- Publishing uses a Prisma transaction to upsert catalogue metadata, create the product, update the intake session and write an audit event.
- Successful publish redirects to `/staff/intake/success/[id]`.
- Success screen shows title, image, price, category, condition, SKU, shelf location, live URL, QR label, edit link and scan-another action.
- Manual products can also be created from `/staff/inventory/new` using `ProductEditor`.

## Stripe Integration
- Stripe code lives in `src/lib/payments`.
- Checkout route and actions are under `src/app/checkout`.
- Webhook route is `src/app/api/stripe/webhook/route.ts`.
- Orders, reservations, email events and refund state are persisted in Prisma.
- If Stripe env vars are missing, checkout remains honest and displays configuration-required messaging.

## Search Implementation
- Public search route: `/search`.
- Query and filters are handled by `src/lib/catalog.ts`.
- Search matches title, creator, publisher, platform, format, ISBN, EAN, SKU, descriptions and subcategory.
- Facets are derived from published products for condition and platform.

## Admin Pages
- `/admin`: metrics dashboard.
- `/admin/settings`: business, payment, email and staff intake runtime status.
- `/admin/audit`: audit log review.
- `/admin/users`: user role management.
- `/admin/legal`: legal page editing.
- `/admin/curated-shelves`: curated shelf management.
- `/admin/ai-usage`: AI boundary and usage page.

## Staff Pages
- `/staff`: daily dashboard with scan/list as dominant action.
- `/staff/intake`: barcode/manual intake workflow.
- `/staff/inventory`: product list.
- `/staff/inventory/new`: manual product creation.
- `/staff/inventory/[id]`: product detail.
- `/staff/inventory/[id]/edit`: product editing.
- `/staff/inventory/[id]/label`: internal QR/SKU label.
- `/staff/orders`: order operations.
- `/staff/locations`: stock location management.

## Customer Pages
- `/account/login`: staff/admin/customer login route, currently worded for staff access.
- `/account`: account dashboard.
- `/account/orders`: customer order history.
- `/basket`, `/checkout`, `/order-confirmation`, `/order-tracking`.
- Public request and sell/trade pages collect customer intent.

## Known Issues
- `gh` is not authenticated on this machine at handoff time, so GitHub push requires `gh auth login` or another authenticated remote.
- E2E tests require a local PostgreSQL database at `postgresql://bookmart@127.0.0.1:5432/bookmart_gamexchange` and seeded demo data.
- Camera scanning requires HTTPS on real phones; localhost is acceptable for development.
- Open Library author/language data is best-effort and can be incomplete.
- AI photo identification and OCR are intentionally disabled for this milestone.
- Product image compression/orientation is basic; server validates MIME and size.
