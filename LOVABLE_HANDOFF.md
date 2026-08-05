# Lovable Handoff

## Architecture

This is a TanStack Start application, not Next.js. File routes invoke typed server
functions, which use Prisma/PostgreSQL for durable state. The public catalogue and
staff console are part of one deployable application, so a published item is
visible without a separate synchronization job.

## Important files

- `src/styles.css`: global visual system, responsive layout and CRT texture
- `src/components/shop/Storefront.tsx`: homepage storefront and search
- `src/components/shop/Rooms.tsx`: four department visual panels
- `src/components/shop/ShopBar.tsx`: public navigation and explicit Admin action
- `src/components/shop/RoomPage.tsx`: category page shell
- `src/components/shop/ObjectPage.tsx`: product inspection/detail page
- `src/components/staff/StaffShell.tsx`: protected console shell
- `src/components/staff/StaffKit.tsx`: staff controls and staged intake helpers
- `src/lib/intake-impl.server.ts`: intake orchestration and publication transaction
- `src/lib/intake/*`: barcode, provider and classification rules
- `src/lib/catalog-impl.server.ts`: live catalogue/category/search mapping
- `src/lib/checkout-impl.server.ts`: basket validation and checkout orchestration
- `src/lib/auth-impl.server.ts`: login, session and authorization logic
- `prisma/schema.prisma`: canonical persistent model

## Components and design system

The approved design is warm, dark and object-led: editorial serif headings,
restrained pixel lettering, brass/gold controls, wood interiors, neon details and
subtle CRT scanlines. Desktop uses the wide storefront and four-room panoramic
composition; mobile uses the portrait storefront and stacked/two-column layouts.

The premium direction is restraint. Keep copy short, align controls precisely,
preserve strong artwork crops and use neon only as an in-scene accent. The room
artwork already carries its own signs, so duplicate floating room titles were
removed. The Books artwork has a legible illuminated BOOKS sign to give all four
rooms equal visual identification.

## Things that must not be changed

- Do not replace or regenerate the approved storefront and room artwork.
- Do not restore the old card-heavy/pixel-terminal homepage.
- Do not reintroduce “Four rooms” or duplicate titles over room imagery.
- Keep public category labels: Books, Games, Music & Film, Rare & Collectible.
- Keep the visible Admin action; it is the owner login, not a customer account.
- Keep Dublin 1, 73 Talbot Street and D01 TW28 consistent.
- Do not expose passwords, API keys, database IDs or internal enum values.
- Do not allow example display products to be purchased.
- Do not bypass the server-side publication or checkout transactions.

## How products are created

Both barcode and manual intake feed the same staged draft. Staff chooses item kind,
captures/enters identity, reviews photos, then supplies category, condition, price,
one-copy quantity, shelf and fulfilment. Confirmation calls the server publication
pipeline, which validates the draft, checks duplicates, generates SKU/slug, writes
product/inventory/audit records and returns the committed listing. Success is not
shown before the transaction completes.

## How category pages work

The historical route names remain stable for compatibility:

- Books -> `/library`
- Games -> `/arcade`
- Music & Film -> `/sound-vision`
- Rare & Collectible -> `/curiosity-cabinet`

`catalog-impl.server.ts` maps database categories/platforms to these room routes.
Each room page loads current published stock server-side, with display fixtures as
a non-purchasable empty-catalogue presentation layer.

## How barcode scanning creates products

`/staff/add/scan` captures and normalizes a supported code. The metadata provider
looks up known identity; deterministic rules suggest type, room and platform.
Staff sees human labels and can override every suggestion. The barcode stays with
the draft even when lookup fails. The final confirmation uses exactly the same
publication transaction as manual intake, ensuring camera and no-barcode products
cannot drift into different inventory behavior.
