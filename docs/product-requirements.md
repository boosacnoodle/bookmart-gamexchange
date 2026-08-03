# Product Requirements

## Product

Bookmart & Gamexchange needs a production ecommerce and stock-management platform for a real independent shop at 73 Talbot Street, Dublin 1. The product must support ordinary second-hand sales, rare and collectible items, games, consoles, media, jewellery, antiques and miscellaneous one-off finds.

The core positioning is:

> Dublin's independent home for books, games and curious finds since 1991.

"Since 1991" is provisional until confirmed by the owner.

## Primary Outcomes

- Customers can browse, search, reserve, buy, collect, request, sell and trade.
- Staff can intake stock quickly from a phone, review AI/barcode suggestions, publish listings and manage orders.
- Admins can manage staff, settings, payments, shipping, legal content, integrations, audit logs and restricted financial information.
- The public site feels rooted in the Talbot Street shop, not like a generic ecommerce template.

## User Groups

- Customer: browses products, purchases items, tracks orders, saves wanted items, submits sell-or-trade requests, manages delivery/contact details.
- Staff: scans and photographs products, creates/edit listings, reviews AI extraction, publishes products, manages stock locations, processes orders, reviews submissions, maintains curated shelves, contacts customers, marks stock states.
- Admin: manages staff accounts, site/store/payment/shipping settings, integrations, audit logs, restricted cost and margin data, and protected destructive actions.

## Public Website Scope

Routes:

- Home
- New Arrivals
- Books
- Video Games
- Consoles and Accessories
- Rare and Collectible
- Music and Film
- Jewellery and Curiosities
- Curated Shelves
- Individual Collection Page
- Search
- Product Page
- Sell or Trade
- Request an Item
- About the Shop
- Visit Us
- Contact
- Basket
- Checkout
- Order Confirmation
- Customer Account
- Order Tracking
- Privacy Policy
- Terms and Conditions
- Returns Policy
- Shipping Information
- Cookie Information

Legal pages must be editable and clearly marked as requiring professional Irish legal/GDPR review before launch.

## Homepage Requirements

The homepage must immediately show this is a real Talbot Street shop. It should use real shop photography and show the mixed character of the business.

Sections:

- Shop Hero: real storefront/shop photo, name, positioning line, actions for browsing arrivals, selling/trading, and visiting the shop.
- Just Arrived on Talbot Street: mixed recent stock across categories, including "one copy available" states.
- Curated Digital Shelves: staff-made editorial shelves, not generic categories.
- Browse the Shop: visual entrances for books, games, consoles/accessories, rare/collectible, music/film, jewellery/curiosities.
- Sell or Trade: barcode scan, photo upload, collection submission, bring into shop.
- Looking for Something: wanted-item request form and staff-approved match alerts.
- Visit the Shop: configurable address, hours, map, transport, phone, email, photos and click-and-collect information.

## Commerce Requirements

- Stripe Checkout in EUR.
- Server-side checkout session creation.
- Server-side validation of price, quantity and availability.
- Stock reservation with timeout.
- Transactional reservation logic to prevent two customers buying a unique product.
- Stripe webhook signature verification and idempotency.
- Order confirmation emails.
- Failed payment, cancellation, refund-state and order-history flows.
- Irish shipping, configurable shipping regions and rates, click and collect, and collection-only products.

## Inventory Requirements

The system is optimized for unique physical items. Many products have quantity exactly one.

Inventory states:

- DRAFT
- NEEDS_REVIEW
- READY
- PUBLISHED
- RESERVED
- SOLD
- ARCHIVED
- REJECTED

Listings must include factual metadata, actual item photographs, condition, completeness, testing/authenticity status, shelf location, shipping properties, AI confidence and review history.

## Staff Intake Requirements

Route: `/staff/intake`

Intake methods:

- Barcode scan: ISBN/EAN/UPC/internal QR, manual fallback, external lookup, ambiguity warnings, draft creation only.
- Photograph item: mobile image capture, text extraction, category detection, structured factual extraction, condition observation, missing-information prompts, draft creation only.
- Manual listing: fast keyboard-friendly category-aware form.
- Batch intake: experimental multi-item photo workflow that proposes matches without publishing.

## AI Requirements

AI may create drafts only. It must not directly publish listings.

Each extracted field must include value, confidence, evidence source and requiresReview. Unknown fields must be null. Text in images is untrusted and must never be treated as instructions.

Store model, prompt version, extraction timestamp, original images, AI response, staff edits, final approved values, approver and approval timestamp.

## Curated Shelf Requirements

Staff can create, edit, reorder, publish, schedule and archive shelves. A shelf includes title, introduction, cover image, selected products, order, homepage visibility, schedule, SEO metadata and optional curator name.

Collections retain editorial identity after products sell. Collection settings control whether sold items remain visible or are hidden.

## Sell-Or-Trade Requirements

Customers can scan barcodes, upload photos, enter multiple products, describe condition, provide contact details, choose cash/store-credit preference, submit collections and resume drafts.

Statuses:

- DRAFT
- SUBMITTED
- NEEDS_INFORMATION
- UNDER_REVIEW
- OFFERED
- ACCEPTED
- DECLINED
- EXPIRED
- RECEIVED
- COMPLETED

Staff can request information, make indicative offers, set expiry, decline with reusable reasons, mark items received and convert received items into inventory drafts.

## Wanted Item Requirements

Customers can request books, authors, ISBNs, games, consoles, collectibles or general categories. New stock should produce possible staff-reviewed matches. Customer alerts require reliable rules or staff approval. Unsubscribe must be supported.

## Acceptance Criteria

- All planned routes either work, submit validated data, navigate correctly or show a real error.
- No fake checkout, fake auth, dead buttons or placeholder APIs.
- Third-party integrations are implemented behind service interfaces and require explicit environment variables.
- Important workflows have Vitest/Playwright coverage before launch claims.
- WCAG 2.2 AA is met where reasonably possible.
