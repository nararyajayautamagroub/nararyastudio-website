# NARARYA STUDIO

Digital Creative Studio, Digital Product Store, Design Service & Custom Request.

## Current implementation

- Next.js + TypeScript + Tailwind CSS with responsive, mobile-safe layouts
- Global interactive buttons with subtle animation and reduced-motion support
- Ten-language UI selector: Indonesian, English, Malay, Chinese, Japanese, Korean, Arabic, Hindi, Spanish and French
- Arabic RTL support
- Customer settings for language, theme, profile, password and session revocation
- Google OAuth login with state protection and verified Google email requirement
- Store search, pagination, category filters, bundles and server-side price calculation
- Product detail with discount pricing and safe public fields
- Resilient browser cart and connected checkout-to-order flow
- Secure password hashing with scrypt and 7-day HTTP-only session cookies
- Login, registration, logout and authenticated customer dashboard
- Protected customer routes and staff dashboard gate
- Order API and protected expiring digital download links
- Payment webhook verification using HMAC SHA-256 and idempotent event records
- PostgreSQL + Prisma domain schema and migrations
- Custom request API with NS-REQ identifiers and validation
- Invoice PDF endpoint and notification center
- Wishlist, quotations, coupon/promo, reviews, support tickets, FAQ, request tracking, finance reports, CMS and staff operations
- SEO sitemap + robots, mobile web manifest and hardened security headers
- Reusable robots-aware scraper CLI with crawl limits, delays and timeouts for permitted HTML sources
- GitHub Actions CI for schema validation, typecheck, tests and production build

## Google OAuth

Configure these environment values:

    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

In Google Cloud Console, add the callback URL to the OAuth client. For production, use the HTTPS production callback URL exactly.

## Scraper

Run:

    npm run scrape -- https://example.com --out scrape-output.json

The scraper uses same-origin crawling by default:

    npm run scrape -- https://example.com --max-pages 25

Explicit same-origin mode:

    npm run scrape -- https://example.com --same-origin --max-pages 25

Use `--all-origins` only when cross-domain crawling is actually required.

With delay and timeout:

    npm run scrape -- https://example.com --same-origin --max-pages 50 --delay 500 --timeout 15000

The scraper extracts title, description, canonical, Open Graph, headings, JSON-LD, links and cleaned text. It does not bypass authentication, CAPTCHA, paywalls, rate limits or access controls.

## Environment

Copy .env.example to .env and configure DATABASE_URL, NEXT_PUBLIC_SITE_URL, PAYMENT_WEBHOOK_SECRET, STORAGE_BASE_URL and the Google OAuth variables when Google Login is enabled.

## Local run

    npm install
    npm run db:generate
    npm run db:validate
    npm run db:migrate
    npm run db:seed
    npm run dev

## Production checklist

1. Configure a real payment provider and map its signed webhook format to the HMAC contract.
2. Configure private object storage and use file paths that resolve from STORAGE_BASE_URL or absolute HTTPS URLs.
3. Configure Google OAuth with an exact HTTPS callback URL in Google Cloud.
4. Assign staff roles in the database before opening /admin.
5. Add transactional email/Discord/WhatsApp providers as required.
6. Run production E2E/security tests against a staging database.

No repository change can honestly guarantee that every runtime issue is impossible. The CI pipeline remains the automated gate, while production credentials, database state, provider behavior and hosting configuration remain environment-specific.
