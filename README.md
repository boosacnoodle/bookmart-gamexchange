# Bookmart & Gamexchange

The public website and staff intake system for Bookmart & Gamexchange, 73 Talbot
Street, Dublin 1.

The public design is the approved Lovable storefront: atmospheric shop artwork,
four browsable departments, live search, product pages, basket and checkout. The
staff area lets the owner scan or enter a barcode, review metadata, add condition
and price, publish inventory, and generate an internal QR/SKU label.

## Local setup

Requirements: Node.js 20+, npm, and PostgreSQL.

```sh
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
npm run owner:setup -- --name "Owner"
npm run dev -- --host 0.0.0.0 --port 8080
```

`owner:setup` prompts securely for the password. Never put a real password in a
command, source file, or committed environment file.

## Quality checks

```sh
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

See [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) for the system map,
[LOVABLE_HANDOFF.md](./LOVABLE_HANDOFF.md) for design and architecture constraints,
and [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for launch steps.
