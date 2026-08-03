# Implementation Plan

## Process

Work milestone by milestone. Each milestone begins with:

- Goal.
- Affected files.
- Acceptance criteria.

Each milestone ends with:

- Implemented work.
- Commands and tests run.
- Actual results.
- Incomplete work.
- Risks.
- This document updated.

No full implementation starts until the architecture and milestone plan are written.

## Milestone 1: Planning, Brand System, Data Model And Foundation

Goal: Create the documented product foundation and scaffold a strict, production-oriented Next.js application.

Affected files:

- `docs/*`
- `package.json`
- `next.config.*`
- `tsconfig.json`
- `eslint.config.*`
- `prisma/schema.prisma`
- `.env.example`
- `src/app`
- `src/lib`
- `src/components`
- `tests`
- `docker-compose.yml`

Acceptance criteria:

- Requested planning docs exist.
- Next.js App Router app runs locally.
- TypeScript strict mode is enabled.
- Prisma connects to PostgreSQL.
- Initial schema covers users, roles, products, images, inventory, shelves, orders, reservations, sell/trade, wanted requests, audit and settings.
- `.env.example` contains variable names only.
- Vitest and Playwright are configured.
- Lint, typecheck and initial tests run.

## Milestone 2: Public Catalogue, Product Pages, Search And Curated Shelves

Goal: Build real public browsing flows using database-backed products and shelves.

Acceptance criteria:

- Homepage uses real shop-photo asset slots and database-backed new arrivals/shelves.
- Category pages and search query real product data.
- Product pages show actual-item images, condition, metadata, availability and structured SEO data.
- Curated shelf pages preserve editorial identity after item sale.
- Filters use validated server state.
- Empty/loading/error states exist.

## Milestone 3: Authentication, Staff Administration And Manual Inventory

Goal: Add secure accounts, RBAC and staff/admin inventory management.

Acceptance criteria:

- Customer, staff and admin roles are enforced server-side.
- Staff can create/edit inventory drafts manually.
- Admin can manage staff and basic site settings.
- Restricted cost/margin fields are hidden from non-admin roles.
- Audit logs record sensitive changes.

## Milestone 4: Basket, Reservations, Stripe And Orders

Goal: Implement real checkout and order management.

Acceptance criteria:

- Basket validates stock server-side.
- Checkout creates Stripe sessions with current database prices.
- Unique products cannot be double-reserved or double-sold.
- Webhooks verify signatures and are idempotent.
- Paid, failed, cancelled, expired and refunded states are handled.
- Confirmation emails are sent through provider interface.

## Milestone 5: Barcode Scanning And Metadata Lookup

Goal: Add mobile barcode intake with ambiguity-safe draft creation.

Acceptance criteria:

- `/staff/intake` camera scanning works on mobile.
- Manual barcode entry works.
- ISBN/EAN/UPC/internal QR paths are distinguished.
- Metadata lookups show possible matches and ambiguous editions.
- Uncertain matches cannot be silently accepted.
- Draft products are created only after staff confirmation.

## Milestone 6: AI Photograph Extraction And Staff Review

Goal: Add AI-assisted listing from item photographs with strict review.

Acceptance criteria:

- Staff can upload/capture item photos.
- OpenAI Responses API returns strict structured output.
- Malformed or unsafe AI output is rejected.
- Field-level confidence/evidence/review flags are displayed.
- Staff review is side-by-side with photos and proposed fields.
- AI never publishes automatically.

## Milestone 7: Sell-Or-Trade Workflow

Goal: Build customer submissions and staff offer handling.

Acceptance criteria:

- Customers can create, save, submit and update sell/trade submissions.
- Staff can request information, offer cash/store credit, decline, mark received and complete.
- Accepted received items convert into inventory drafts.
- Online estimates clearly remain subject to physical inspection.

## Milestone 8: Wanted Items, QR Labels And Stock Locations

Goal: Connect wanted requests, stock lookup and internal QR operations.

Acceptance criteria:

- Customers can create and unsubscribe from wanted-item alerts.
- New products generate staff-reviewed possible matches.
- Approved matches can notify customers.
- Approved inventory receives SKU and QR code.
- Authenticated staff QR scans open the staff inventory record.
- Stock locations and shelf locations can be managed.

## Milestone 9: Accessibility, Security, Testing And Deployment

Goal: harden the platform for launch.

Acceptance criteria:

- Required Vitest and Playwright workflows are implemented.
- Race-condition tests cover concurrent checkout attempts.
- Accessibility-critical flows pass automated and manual checks.
- Production build passes.
- Security checklist is reviewed.
- Legal/GDPR/accounting review checklist is complete.
- Deployment documentation and monitoring configuration are ready.

## First Implementation Milestone Proposal

Start with Milestone 1 only. The first build should scaffold the application, encode the database schema, establish service-interface boundaries, add seed data clearly marked fictional, configure tests, and create a minimal public shell only where needed to verify the foundation. Payment, AI, barcode, staff workflows and full public pages should not be built in this milestone except as typed interfaces and schema support.

## Current Status

- Planning documents created.
- Repository is empty and is not initialized as git.
- No supplied local shop photographs were present; public DublinTown imagery was inspected for design direction.
- Full implementation has not started.
