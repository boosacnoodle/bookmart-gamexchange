# Project Overview

## Tech stack

- TanStack Start, TanStack Router, React 19 and TypeScript
- Vite 8 and Nitro server output
- Tailwind CSS 4 plus the existing custom shop styles in `src/styles.css`
- Prisma 6 with PostgreSQL
- ZXing browser barcode scanning
- Stripe Checkout and signed webhooks
- Open Library for ISBN metadata
- Vitest and Playwright

## Folder structure

- `src/routes`: file-based public, checkout and staff routes
- `src/components/shop`: approved Lovable storefront and catalogue components
- `src/components/staff`: reusable mobile staff interface
- `src/lib`: server functions for auth, catalogue, intake, checkout and labels
- `src/lib/intake`: barcode parsing, metadata and deterministic classification
- `src/lib/payments`: Stripe, orders, shipping and email adapters
- `src/data`: display fixtures and stable shop/room configuration
- `src/assets`: approved storefront, room and example product artwork
- `prisma`: schema, migrations and safe seed data
- `scripts`: owner account setup
- `tests/e2e`: responsive and end-to-end acceptance coverage

## Routes

Public:

- `/`: storefront homepage
- `/search`: live catalogue search
- `/library`, `/arcade`, `/sound-vision`, `/curiosity-cabinet`: category pages
- `/<room>/<slug>`: product detail pages
- `/basket`, `/checkout`, `/order-confirmation`: purchase flow
- `/trade`: sell/trade and shop contact information
- `/wishlist`: local-device wishlist
- `/account`: redirects to staff login; there are no customer accounts

Staff/admin:

- `/staff`: owner/staff login
- `/staff/today`: operational dashboard
- `/staff/add`: choose barcode or manual intake
- `/staff/add/scan`: camera scanner and manual barcode entry
- `/staff/add/photos`: image capture, preview, ordering and validation
- `/staff/add/details`: identity, category, condition, price and fulfilment
- `/staff/add/confirm`: final review and publish
- `/staff/add/done`: committed listing success screen
- `/staff/stock`: inventory and listing status
- `/staff/orders`: order attention and fulfilment status
- `/staff/settings`: provider and integration readiness
- `/staff/label/$id`: internal QR/SKU label

API:

- `/api/stripe/webhook`: signed Stripe event processing

## Authentication

There is one private staff/admin identity system and no public customer login.
Passwords are scrypt hashes. Successful login creates a random, hashed,
HTTP-only, same-site database session lasting seven days. Failed attempts are
rate-limited. Protected loaders require a `STAFF` or `ADMIN` role and expired
sessions redirect to `/staff`. Logout revokes the server-side session.

Create or reset the real owner safely with:

```sh
npm run owner:setup -- --name "Owner name"
```

The command prompts for the password without writing it to source control.

## Database schema

Core models:

- `User`, `Session`, `PasswordResetToken`: private staff identity
- `Product`, `CatalogueProduct`, `StockLocation`: public products and inventory
- `IntakeSession`, `AiExtraction`: staged intake and optional future extraction
- `Order`, `OrderItem`, `InventoryReservation`: checkout and stock reservation
- `StripeWebhookEvent`, `EmailEvent`, `Refund`: payment operations
- `AuditLog`: staff actions, overrides, publication and errors
- `CuratedShelf`, `CuratedShelfProduct`: merchandising
- `WantedRequest`, `SellTradeSubmission`: customer enquiries
- `SiteSetting`, `LegalPage`: configuration/content support

`Product` stores the source barcode, generated SKU/slug, category, condition,
price, quantity, platform and book metadata, photos, shelf location, fulfilment
eligibility and publication/inventory state.

## Barcode scanner flow

1. Staff opens `/staff/add/scan` and grants rear-camera permission.
2. ZXing captures ISBN-10, ISBN-13, EAN-8, EAN-13, UPC-A, UPC-E or an internal
   Bookmart SKU/QR. Manual entry remains available.
3. Repeated detections are suppressed and the barcode is normalized.
4. ISBNs query Open Library through the metadata provider abstraction.
5. The system checks possible duplicates and suggests type, platform and category.
6. Staff reviews photos, condition, price, shelf and fulfilment.
7. Publish validates and commits product, inventory and audit records in a
   transaction, then returns the live URL and QR label.

The local demo provider is restricted to development/tests. Unknown products
retain their scanned barcode and proceed through manual completion. OpenAI photo
identification and OCR are disabled.

## Inventory flow

Unique second-hand items default to one copy. Publishing generates a unique SKU
and slug, attaches the barcode/photos, creates inventory state, and makes the item
available immediately to public product, category and search queries. Staff can
override suggested classifications. Duplicate warnings never silently merge
copy-specific used items.

Checkout reserves inventory transactionally. A successful signed Stripe webhook
settles the order and updates the item to sold. Expired/failed reservations can be
released without overselling the same unique copy.

## Stripe integration

Production uses Stripe Checkout. Prices and item identity are loaded server-side;
the browser cannot submit an authoritative price. A signed webhook provides final
payment confirmation and idempotency is recorded in `StripeWebhookEvent`.

`STRIPE_TEST_ADAPTER=true` supports local acceptance without charging a card. It
must be disabled for production. Live Stripe secrets are never displayed in the
staff settings UI.

## Search implementation

Search queries live published PostgreSQL catalogue items and merges approved
display fixtures for an attractive empty-catalogue demonstration. Results link to
their room/product routes. Display fixtures are clearly prevented from entering a
real checkout; only database inventory can be purchased.

## Page ownership

Admin/staff pages cover login, dashboard, intake, stock, orders, settings and QR
labels. Customer-facing pages cover the storefront, four departments, product
inspection, search, wishlist, trade/contact, basket and checkout. There is no
customer account or customer password database.

## Known issues and limitations

- Production hosting, database, domain, Stripe and transactional email credentials
  still need to be supplied.
- Opening hours and the public email address require owner confirmation before
  launch. The address is 73 Talbot Street, Dublin 1, D01 TW28.
- Open Library is strongest for books. Game UPC metadata is provider-dependent and
  may require staff completion.
- Photo identification is intentionally disabled. It needs a separate privacy,
  cost and accuracy acceptance milestone before enabling an AI provider.
- Photos currently persist as compressed data URLs in PostgreSQL. This is workable
  for an MVP but production should use object storage before inventory volume grows.
- Example catalogue products exist for presentation and testing only.
