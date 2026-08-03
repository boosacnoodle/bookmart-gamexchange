# Assumptions And Clarifications

## Blocking Questions

These decisions genuinely affect implementation and launch readiness:

1. Who is the owner/admin authority for approving business facts, legal content, opening hours, contact details, shipping rules and launch copy?
2. Should the founding claim be "since 1991", "over 35 years", or another confirmed year?
3. Which authentication method should staff use at launch: email/password, magic link, Google, or another provider?
4. Which image storage provider should be used first: Cloudinary or S3-compatible storage?
5. Which email provider/account will send transactional email through the Resend-compatible interface?
6. What are the real opening hours, email address, phone display preference and click-and-collect instructions?
7. What shipping regions/rates should launch with, and which product types are collection-only?
8. What payment account and Stripe mode should be used for integration testing?
9. What condition grading policy should staff use across books, games, consoles, media, jewellery and antiques?
10. Are staff allowed to publish products immediately after review, or does admin approval apply to high-value/rare items?

## Non-Blocking Assumptions

- Default currency is EUR.
- Initial geography is Ireland-focused shipping plus click and collect from 73 Talbot Street.
- Public claims from directory sites are not treated as final brand copy unless owner-approved.
- Seed data will be fictional and clearly labelled as demo inventory.
- Product photos must show actual physical items; catalogue images are not used where condition matters.
- AI extraction creates drafts only.
- Staff can complete all listing workflows manually if AI, barcode lookup, email or storage providers are unavailable.
- PostgreSQL full-text and trigram search are sufficient for launch, behind an interface that can later swap to a dedicated search service.
- Legal pages are editable draft content requiring professional review.
- Cost price and margin data are admin-only for launch.
- Batch intake is experimental and lower priority than single-item barcode/photo/manual intake.

## Supplied Assets Status

No supplied image files were found in:

- `/Users/thomasmc/Documents/Codex/2026-08-01-you-are-a-senior-product-designer`
- Relevant shallow search paths under `/Users/thomasmc/Downloads/instagram`

Public DublinTown photographs were inspected instead to establish visual direction. Before production launch, obtain permission to use official shop photography and store those images in the project asset pipeline.

## External Source Notes

- DublinTown page lists the address, phone number and shop description and includes public shop photos.
- Golden Pages lists the address and phone number.
- Facebook presence exists but was not used for owner-confirmed launch copy.

These sources are useful orientation, not final legal/business verification.
