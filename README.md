# NARARYA STUDIO

Digital Creative Studio, Digital Product Store, Design Service & Custom Request.

## Current implementation
- Next.js + TypeScript + Tailwind CSS
- Responsive public pages: home, store, product detail, design, request, portfolio, projects, cart
- Customer pages: login, dashboard, orders, invoices, quotations, wishlist, notifications
- Support, FAQ and blog pages
- Prisma + PostgreSQL production domain schema
- Product catalog API with search/category filtering
- Custom request API with NS-REQ identifiers and request statuses
- Checkout API contract and payment webhook security baseline
- Ticket API
- SEO sitemap + robots
- Security headers
- Seed data for initial products
- GitHub Actions CI
- Architecture, API and production roadmap documentation

## Business modules modeled
Products, versions, licenses, categories, cart, checkout, payments, orders, digital delivery logs, requests, quotations, revisions, projects, portfolio, wishlist, reviews, tickets, notifications, finance/audit foundations and staff roles.

## Production requirements before accepting real payments
1. Configure PostgreSQL and run Prisma migration.
2. Add real session authentication and password hashing.
3. Enforce RBAC on every admin/finance endpoint.
4. Connect a payment gateway and store webhook events idempotently.
5. Connect private object storage and signed, expiring download URLs.
6. Generate invoices server-side.
7. Add email/Discord/WhatsApp notification providers.
8. Add Playwright E2E, API, security and checkout regression tests.
9. Configure deployment secrets in the hosting provider.

## Environment
Copy `.env.example` to `.env` and configure production values.

## Run
```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Prices, product states, quotations and mutable business content are intentionally modeled as database data rather than hardcoded frontend state.
