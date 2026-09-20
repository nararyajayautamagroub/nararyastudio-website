# Roadmap

## Implemented
- Responsive public pages: home, store, design, request, portfolio, projects, cart, support, FAQ and blog
- PostgreSQL/Prisma models for products, users, sessions, orders, requests, quotations, revisions, reviews, wishlist, downloads, tickets, notifications and audit foundations
- Product catalog API with search, pagination, New Release, Best Seller and Discount sorting/filtering
- Checkout creates persisted orders and uses server-side price calculation
- Login/register/logout with hashed passwords and HTTP-only sessions
- Protected dashboard, customer orders, wishlist, quotations, invoices and notifications pages
- HMAC-signed, idempotent payment webhook foundation with customer notifications
- Protected download token issuance with expiry and maximum-download enforcement
- Dependency-free server-side invoice PDF generation
- SEO sitemap, robots and security headers
- Next.js 16 proxy convention instead of deprecated middleware.ts
- Reusable scraper CLI and documentation
- CI schema validation, typecheck, tests and build
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
