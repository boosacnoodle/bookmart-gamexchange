# Launch Checklist

## Product

- Owner confirms positioning, founding year and approved public copy.
- Owner confirms opening hours, phone, email, transport notes and click-and-collect instructions.
- Real shop photographs are licensed/approved for website use.
- Seed data is removed or clearly kept in demo environments only.
- Every public route is complete, reachable and free of dead actions.
- Every button performs an action, navigates, submits validated data or shows an appropriate error.

## Commerce

- Stripe account connected.
- Stripe Checkout tested in test mode.
- Signed webhooks tested.
- Webhook idempotency tested.
- Failed/cancelled/expired payment flows tested.
- Refund-state tracking tested.
- Concurrent unique-item checkout tested.
- Shipping rates and regions configured.
- Collection-only handling tested.
- Confirmation emails tested.

## Inventory

- Product state transitions tested.
- SKU generation tested.
- Internal QR generation and staff scan flow tested.
- Stock locations configured.
- Staff can mark reserved, sold, archived and moved stock.
- Restricted cost/margin visibility verified.
- Actual-item photo policy documented for staff.

## AI And Barcode

- OpenAI API key configured server-side only.
- AI extraction prompt version recorded.
- Strict schema validation tested.
- Malformed output rejected.
- Prompt injection in image text tested.
- Ambiguous barcode results require staff choice.
- AI drafts cannot publish automatically.
- Staff approval trail is stored.

## Sell Or Trade

- Customer draft/resume/submit flow tested.
- Staff review and request-info flow tested.
- Cash and store-credit offers tested.
- Offer expiry tested.
- Physical-inspection disclaimer visible.
- Accepted received items convert into inventory drafts.

## Wanted Items

- Customer request flow tested.
- Matching logic tested.
- Staff approval before notification tested.
- Unsubscribe tested.
- Contact preferences respected.

## Security

- Server-side role checks tested.
- Staff/admin route protection tested.
- CSRF posture reviewed for all mutation paths.
- Rate limiting configured.
- Upload MIME/size validation tested.
- Secrets absent from repository.
- `.env.example` contains names only.
- Audit logging verified.
- Safe error messages verified.
- Privacy-conscious logging verified.

## Accessibility

- Keyboard navigation tested.
- Visible focus states verified.
- Form labels and errors verified.
- Product galleries have useful alt text.
- Contrast checked against WCAG 2.2 AA where reasonably possible.
- Reduced-motion support checked.
- Mobile staff intake usable on smartphone viewport.

## Testing

- TypeScript check passes.
- Lint passes.
- Vitest unit/integration tests pass.
- Playwright browser tests pass.
- Production build passes.
- Accessibility-critical browser flows checked.

## Professional Review

Requires Irish professional review before launch:

- Privacy policy.
- Terms and conditions.
- Returns policy.
- Shipping information.
- Cookie information and consent.
- GDPR retention/deletion/export process.
- VAT/accounting setup.
- Buy/sell/trade terms and obligations.
- Any regulatory concerns for second-hand goods, jewellery, antiques or potentially stolen property.
