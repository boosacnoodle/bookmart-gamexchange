# LOVABLE HANDOFF

## Goal For Lovable
Use Lovable for a frontend redesign while preserving the working backend, data model, auth, staff intake, inventory, payments, orders and public catalogue behavior.

## Architecture
- This is a full-stack Next.js App Router app.
- Public pages read products through `src/lib/catalog.ts`.
- Mutations use Server Actions in `src/app/*-actions.ts`.
- Database access goes through Prisma in `src/lib/db.ts`.
- Authentication is custom session-cookie auth in `src/lib/auth.ts`, `src/lib/session-token.ts` and `middleware.ts`.
- Payments are isolated under `src/lib/payments` and `/checkout`.
- Staff intake is isolated under `/staff/intake`, `src/components/intake-workflow.tsx`, `src/app/intake-actions.ts` and `src/lib/intake`.

## Important Files
- `src/app/layout.tsx`: Root layout and global shell.
- `src/app/page.tsx`: Accepted public homepage. Do not casually replace functionality or links.
- `src/app/storefront-home.module.css`: Accepted homepage styling.
- `src/app/globals.css`: Shared design system and management/staff styles.
- `src/components/header.tsx`, `src/components/footer.tsx`: Standard public shell.
- `src/components/product-card.tsx`: Product cards and grids.
- `src/components/category-page.tsx`: Shared category page renderer.
- `src/components/search-filters.tsx`: Public search filters.
- `src/components/intake-workflow.tsx`: Staff barcode/manual intake UI.
- `src/components/product-editor.tsx`: Manual staff product editor.
- `src/app/intake-actions.ts`: Intake lookup and publish transaction.
- `src/app/management-actions.ts`: Staff/admin product, order, location and settings mutations.
- `src/app/auth-actions.ts`: Login/logout/password actions.
- `src/lib/intake/barcode.ts`: Barcode parsing.
- `src/lib/intake/metadata.ts`: Metadata provider abstraction.
- `src/lib/intake/classification.ts`: Deterministic category/platform classification.
- `prisma/schema.prisma`: Database contract.

## Components
- Keep product data flows intact when redesigning cards, filters, headers or page layouts.
- Staff/admin components are form-heavy and should remain practical on mobile.
- The scanner video element, manual barcode input and publish form fields in `IntakeWorkflow` are functional controls, not decorative UI.
- `ProductEditor` is the manual fallback for items without barcodes.
- `LogoutButton`, `StatusMessage`, `SubmitButton`, basket and checkout components are already wired to server actions.

## Design System
- Global CSS variables and shared classes are in `src/app/globals.css`.
- The accepted homepage uses a warm retro storefront style in `src/app/storefront-home.module.css`.
- The public homepage design should not be redesigned again unless explicitly requested.
- Lovable may redesign other frontend surfaces, but must preserve routes, hrefs, form `name` attributes, server action wiring and role-gated staff/admin flows.

## Things That Must NOT Be Changed
- Do not remove Prisma models, enums or migrations unless a deliberate migration plan exists.
- Do not change auth cookie/session semantics without replacing all middleware and tests.
- Do not expose demo credentials in production UI.
- Do not hard-code the owner password.
- Do not remove `/staff/intake`, `/staff/inventory`, `/staff/orders`, `/admin/settings`, Stripe checkout, webhooks or order handling.
- Do not break public product URLs: `/products/[slug]`.
- Do not break category URLs or existing redirects such as `/video-games`, `/rare-and-collectible`, `/music-and-film`.
- Do not introduce OpenAI photo identification in the current milestone.
- Do not invent metadata when barcode providers return incomplete data.
- Do not silently merge duplicate used items.
- Do not turn the desktop public site into a phone screenshot; desktop should be responsive and native to desktop.

## How Products Are Created
1. Staff logs in.
2. Staff opens `/staff/intake` or `/staff/inventory/new`.
3. Barcode intake creates an `IntakeSession`.
4. Metadata is looked up through provider abstraction.
5. Staff reviews category/platform, condition, price, shelf location, quantity and photos.
6. `publishRapidListing` creates the product in a Prisma transaction.
7. The transaction also updates the intake session and writes an audit log.
8. Cache paths are revalidated.
9. Staff lands on `/staff/intake/success/[id]` with live listing and QR label links.

## How Category Pages Work
- Category metadata is in `src/lib/routes.ts`.
- `CategoryPage` renders the shared page from `src/components/category-page.tsx`.
- `getProducts({ category })` pulls matching products via `src/lib/catalog.ts`.
- Compatibility redirect routes map marketing URLs to canonical routes:
  - `/video-games` -> `/games`
  - `/rare-and-collectible` -> `/rare-collectible`
  - `/music-and-film` -> `/music-film`
- Platform shelf links usually use `/search?platform=...`.

## How Barcode Scanning Creates Products
- `IntakeWorkflow` starts ZXing camera scan or accepts manual barcode input.
- `lookupBarcodeAction` parses the code, calls `lookupMetadata`, checks duplicates and stores an `IntakeSession`.
- `metadata.ts` uses Open Library for ISBNs. Demo metadata is local/test only.
- `classification.ts` maps books, rare books, games and platforms to shop-friendly shelves.
- Staff can override category/platform before publication.
- `publishRapidListing` validates required fields, saves images, generates SKU/slug, creates the product and audit event, then redirects to success.

## Lovable Redesign Rules
- Preserve every existing route unless explicitly replacing it with an equivalent redirect.
- Preserve form field names used by Server Actions.
- Preserve role-gated behavior.
- Preserve checkout and basket action wiring.
- Preserve barcode scanner controls and fallback manual entry.
- Preserve product card links to `/products/[slug]`.
- Preserve search form `name="q"` and platform filters.
- Preserve all staff/admin CRUD capabilities even if visual styling changes.

## Local Commands
```bash
npm install
npm run db:generate
npm run typecheck
npm run lint
npm run test
npm run build
```

For E2E:
```bash
npm run db:seed
npm run test:e2e
```

The E2E config expects PostgreSQL at:
`postgresql://bookmart@127.0.0.1:5432/bookmart_gamexchange`

## Environment Variables
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- Stripe variables used by `src/lib/payments/config.ts`
- Email variables used by `src/lib/payments/config.ts`
- `METADATA_PROVIDER_PRIORITY` optional; production default is `openlibrary`.
- `AI_PHOTO_IDENTIFICATION_ENABLED` should remain disabled for this milestone.

## Current Known Limitations
- Open Library metadata can be incomplete.
- Game barcode metadata is demo/test unless a real game metadata provider is added.
- Camera scanning requires HTTPS on mobile browsers.
- Photo upload validates type/size and previews images; advanced compression/orientation handling can be improved later.
