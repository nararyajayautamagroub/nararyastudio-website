# NARARYA STUDIO

Digital Creative Studio, Digital Product Store, Design Service & Custom Request.

## Current implementation

- Next.js + TypeScript + Tailwind CSS with responsive public pages
- Store search, pagination and functional category filters
- Product detail with discount pricing and safe public fields
- Resilient browser cart and connected checkout-to-order flow
- Secure password hashing with scrypt and 7-day HTTP-only session cookies
- Login, registration, logout and authenticated customer dashboard
- Protected customer routes and staff dashboard gate
- Order API and protected expiring digital download links
- Payment webhook verification using HMAC SHA-256 and idempotent event records
- PostgreSQL + Prisma domain schema and migration for sessions/payment events
- Custom request API with NS-REQ identifiers and validation
- SEO sitemap + robots and hardened security headers
- Reusable scraper CLI for permitted HTML sources
- GitHub Actions CI for schema validation, typecheck, tests and production build

## Scraper

Run:

    npm run scrape -- https://example.com --out scrape-output.json

For a same-origin crawl:

    npm run scrape -- https://example.com --same-origin --max-pages 25

The scraper extracts title, description, canonical, Open Graph, headings, JSON-LD, links and cleaned text. It does not bypass authentication, CAPTCHA, paywalls, rate limits or access controls.

## Environment

Copy .env.example to .env and configure DATABASE_URL, NEXT_PUBLIC_SITE_URL, PAYMENT_WEBHOOK_SECRET and STORAGE_BASE_URL.

## Local run

    npm install
    npm run db:generate
    npm run db:validate
    npm run db:migrate
    npm run db:seed
    npm run dev

## Before accepting real payments

1. Configure a real payment provider and map its signed webhook format to the HMAC contract.
2. Configure private object storage and use file paths that resolve from STORAGE_BASE_URL or absolute HTTPS URLs.
3. Assign staff roles in the database before opening /admin.
4. Add transactional email/Discord/WhatsApp providers as required.
5. Run production E2E/security tests against a staging database.

No repository change can honestly guarantee that every runtime issue is impossible. The CI pipeline is the final automated gate, while production credentials, database state, payment provider behavior and hosting configuration remain environment-specific.
