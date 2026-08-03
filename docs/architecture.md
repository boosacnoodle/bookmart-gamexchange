# Architecture

## Stack

- Next.js App Router, latest stable at implementation time.
- TypeScript strict mode.
- PostgreSQL.
- Prisma ORM.
- Zod validation.
- Auth.js or equivalent secure session authentication.
- Role-based access control with CUSTOMER, STAFF and ADMIN.
- Stripe Checkout and signed webhooks.
- OpenAI Responses API for image-assisted draft extraction.
- Browser barcode scanning through a client-side scanner library.
- Storage service interface for Cloudinary or S3-compatible providers.
- Resend-compatible transactional email interface.
- PostgreSQL full-text search and trigram search.
- Vitest and Playwright.
- Sentry-compatible monitoring.
- Docker-compatible development where practical.

## Application Shape

Use modular vertical slices with shared service interfaces:

- `app/(public)`: public ecommerce routes.
- `app/(account)`: customer account/order/wanted/sell-trade routes.
- `app/staff`: staff intake, inventory, order and shelf tools.
- `app/admin`: admin settings, users, integrations, audit and reporting.
- `lib/auth`: sessions, roles, permissions.
- `lib/db`: Prisma client and transaction helpers.
- `lib/validation`: Zod schemas shared by actions/API handlers.
- `lib/services/payments`: Stripe interface and webhook handlers.
- `lib/services/search`: PostgreSQL search adapter behind replaceable interface.
- `lib/services/storage`: image upload, transform and delete abstraction.
- `lib/services/email`: transactional email abstraction.
- `lib/services/ai-listing`: OpenAI extraction, schemas, prompt versions and safety checks.
- `lib/services/barcodes`: barcode parsing and metadata providers.
- `lib/services/inventory`: reservation, state transitions, SKU/QR logic.
- `components`: design-system primitives and feature UI.
- `tests`: unit, integration and browser tests.

## Route Policy

- Public product/category/collection pages use server components for initial data.
- Mutations use server actions or route handlers with Zod validation and server-side authorization.
- Staff/admin pages require server-side session checks before rendering sensitive data.
- API route handlers never trust browser-supplied price, role, ownership, stock state or file metadata.

## Integration Interfaces

Each provider sits behind a narrow interface:

- Payment provider: create checkout session, verify webhook, parse events, refund state sync.
- Storage provider: create signed upload, validate metadata, transform derivative images, delete retained images.
- Email provider: send template, record provider message ID, handle failures.
- AI provider: run extraction with strict schema, log prompt/model/output, reject malformed output.
- Metadata providers: ISBN/game catalogue lookup with source attribution and ambiguity handling.
- Search provider: query/search/filter using PostgreSQL now, replaceable later.

## Data Flow

Public purchase:

1. Customer adds available product to basket.
2. Server validates stock and current price.
3. Checkout session reserves stock in a database transaction.
4. Stripe Checkout collects payment.
5. Signed webhook marks order paid, finalizes sold state and records idempotency.
6. Confirmation email is sent.
7. Reservation expiry releases stock if checkout is not completed.

Staff intake:

1. Staff scans barcode or uploads photos.
2. Metadata/AI providers return structured candidates.
3. System creates DRAFT or NEEDS_REVIEW product.
4. Staff confirms identity, condition, completeness and price.
5. Approval generates SKU/internal QR and optionally publishes.

Sell-or-trade:

1. Customer submits items and photos.
2. Staff reviews and issues indicative offer.
3. Physical receipt updates condition.
4. Accepted received items convert into inventory drafts.

Wanted items:

1. Customer creates request.
2. New/updated inventory runs matching.
3. Staff reviews possible matches.
4. Customer notification is sent only after reliable match or staff approval.

## Environment Variables

`.env.example` must include variable names only for:

- Database URL.
- Auth/session secrets.
- Stripe public and secret keys.
- Stripe webhook secret.
- OpenAI API key.
- Storage provider credentials.
- Email provider API key/from address.
- Sentry DSN.
- App URL.
- Rate-limit store URL if externalized.

## Non-Functional Requirements

- Production build must pass.
- Important workflows must be covered by unit/integration/browser tests.
- No secrets in source.
- All customer/admin/staff mutations audited where relevant.
- Provider failures return safe, actionable errors.
- The platform must remain useful when AI is unavailable: staff can list manually.
