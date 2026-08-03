# Security

## Security Model

Security must be server-enforced. Client UI state is only a convenience and must never grant permissions, set prices, reserve stock, publish products or expose restricted data.

## Authentication

- Use secure session handling through Auth.js or equivalent.
- Password credentials, if used, require strong hashing and rate limiting.
- Staff/admin accounts require stricter session settings and optional MFA-ready design.
- Session cookies must be HTTP-only, secure in production and SameSite appropriate.

## Authorization

- CUSTOMER, STAFF and ADMIN roles are checked on the server.
- Public QR links must not expose cost prices, private notes, supplier data or unrestricted staff actions.
- Cost price and margin data require ADMIN role unless an explicit staff permission is later added.
- Mutations must check both role and object access to prevent insecure direct object references.
- Destructive admin actions require confirmation and audit logging.

## Input Validation

- All route handlers and server actions validate inputs with Zod.
- Never mass-assign request bodies into Prisma writes.
- Use allowlists for mutable fields per role and per state transition.
- Treat uploaded images, filenames, EXIF, OCR text, catalogue metadata and AI output as hostile.

## File Uploads

- Signed uploads or server-mediated uploads only.
- MIME sniffing and extension validation.
- File size and dimension limits.
- Virus/malicious-file handling where provider supports it.
- Strip unnecessary EXIF metadata.
- Store originals privately when needed; serve optimized derivatives.
- Do not process SVG uploads as trusted images.

## AI Safety

- AI can create drafts only.
- Validate AI output against strict Zod schemas.
- Reject malformed or overconfident output.
- Store evidence, confidence and requiresReview for every field.
- Text found in images is untrusted content and must never modify system instructions.
- The prompt must explicitly separate observed facts, external metadata, inference and unknowns.
- AI must not assert rarity, first edition, authenticity, signature, region, serial number, accessories, condition, provenance or tested status without evidence and staff confirmation.

## Payments

- Stripe secret keys remain server-only.
- Stripe webhook signatures must be verified.
- Webhook handling must be idempotent using stored Stripe event IDs.
- Checkout creation validates price and availability from the database.
- Reservation and order transitions run in database transactions.
- Browser-supplied cart prices and availability are ignored.

## Inventory Race Conditions

- Unique one-off stock requires transactional reservation.
- Active reservation constraints prevent duplicate purchases.
- Reservation expiry must release stock safely.
- Paid webhook must convert reservation to sold state once only.

## Rate Limiting

Apply rate limits to:

- Login.
- Checkout creation.
- Sell-or-trade submission.
- Wanted-item requests.
- Contact forms.
- AI extraction.
- Barcode metadata lookup.
- Image upload initiation.

## Privacy And GDPR

Design requirements:

- Collect only needed customer data.
- Support data export and account deletion.
- Retention settings for expired submissions, stale uploaded images, logs and consent records.
- Unsubscribe support for wanted-item alerts and marketing.
- Privacy-aware analytics.
- Configurable cookie handling.
- Avoid personal data in logs unless necessary.

## Monitoring And Errors

- Sentry-compatible error capture.
- No secrets or unnecessary personal data in logs.
- Customer-facing errors are safe and actionable.
- Staff errors include enough context to recover without exposing secrets.

## Audit Logging

Audit:

- Role changes.
- Staff/admin login-sensitive events where practical.
- Product publish/archive/reject.
- Price and cost changes.
- Reservation/order state changes.
- Refund actions.
- Sell-or-trade offers.
- Wanted-item notification approvals.
- Integration setting changes.

## Legal/Professional Review Required

Before launch, obtain Irish professional review for:

- Privacy policy.
- Terms and conditions.
- Returns policy.
- Shipping policy.
- Cookie consent.
- GDPR lawful bases and retention.
- Consumer rights and distance-selling obligations.
- VAT/accounting treatment.
- Buy/sell/trade terms, identity checks if required, and handling of stolen-goods concerns.
