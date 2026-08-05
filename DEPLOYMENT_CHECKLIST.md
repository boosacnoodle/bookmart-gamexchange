# Deployment Checklist

The application code is launch-capable. Complete these steps with the owner before
accepting real orders.

## 1. Confirm business details

- Confirm public phone number.
- Confirm public email address.
- Confirm opening hours and holiday handling.
- Confirm delivery price, delivery region and collection policy.
- Confirm returns, privacy, terms and cookie wording.

## 2. Create production services

- Deploy PostgreSQL and set `DATABASE_URL`.
- Generate a long random `SESSION_SECRET` (at least 32 bytes).
- Set the final HTTPS origin in `APP_URL`.
- Provision object storage and migrate photo persistence before large-scale intake.
- Configure backups and database retention.

## 3. Create the owner account

Run against the production database:

```sh
npm run db:migrate
npm run owner:setup -- --name "Owner name"
```

Use a new private password. Do not reuse local acceptance credentials.

## 4. Connect Stripe

- Create/verify the Stripe business account and payout bank account.
- Set `STRIPE_ENABLED=true` and `STRIPE_TEST_ADAPTER=false`.
- Set `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` in the host secret manager.
- Register `https://YOUR_DOMAIN/api/stripe/webhook` in Stripe.
- Subscribe to checkout/payment completion and expiry/failure events used by the
  handler, then set `STRIPE_WEBHOOK_SECRET`.
- Complete a low-value test-mode order before switching to live keys.

## 5. Connect transactional email

- Verify the sending domain with the provider.
- Set `EMAIL_ENABLED=true`, `EMAIL_FROM_ADDRESS` and `RESEND_API_KEY`.
- Test order confirmation and staff notification delivery.

## 6. Deploy and verify

```sh
npm ci
npm run db:generate
npm run typecheck
npm run lint
npm run test
npm run build
```

Then verify on the production HTTPS domain:

1. Owner login and logout.
2. Camera permission and barcode scan on the owner’s Android phone.
3. Unknown barcode fallback and manual listing.
4. Photo capture, condition, price, shelf and category override.
5. Publish, live product URL, search, category and QR label.
6. Basket, delivery/collection, Stripe payment and order status.
7. Mobile portrait, landscape, tablet and desktop layout.
8. Address opens Google Maps and phone opens the dialler.

## Production environment

Copy `.env.example` into the hosting provider’s secret/configuration UI. Never
commit `.env`. Keep `AI_PHOTO_IDENTIFICATION_ENABLED=false` until a dedicated AI
photo-identification acceptance milestone is complete.
