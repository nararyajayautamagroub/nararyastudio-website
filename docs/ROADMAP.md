# Roadmap

## Implemented

- Responsive public pages and mobile navigation
- Ten-language selector with Arabic RTL handling
- Theme settings: system, light and dark
- Google OAuth login, local password authentication and session controls
- Product catalog/search/filter/pagination and server-side price calculation
- Cart, checkout, order tracking, invoice PDF and digital downloads
- Payment webhook verification and idempotent payment events
- Wishlist, quotations, notifications and support tickets
- Staff RBAC product/request/quotation APIs
- PostgreSQL/Prisma schema and migrations
- SEO metadata, sitemap, robots, security headers, error boundary and 404
- Reusable scraper CLI and documentation
- CI schema validation, Prisma generation, typecheck, tests and production build
- Legacy static frontend removed so the Next.js app is the single source of truth

## Remaining production modules

1. Payment provider-specific adapter and payment-status mapping
2. File upload pipeline with private object-storage multipart uploads
3. Notification delivery providers for email, Discord, WhatsApp and push
4. Finance reports and full audit-log administration
5. Full admin CRUD UI for customers, requests, quotations, content and files
6. Database-backed portfolio/blog/project CMS
7. Coupon, bundle and review administration
8. Playwright E2E and security regression suite
