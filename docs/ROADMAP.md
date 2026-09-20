# Roadmap

## Implemented
- Responsive public pages: home, store, design, request, portfolio, projects, cart, support, FAQ and blog
- PostgreSQL/Prisma models for products, users, sessions, orders, requests, quotations, revisions, reviews, wishlist, downloads, tickets and audit foundations
- Product catalog API with search, pagination, New Release, Best Seller and Discount sorting/filtering
- Checkout creates persisted orders and uses server-side price calculation
- Login/register/logout with hashed passwords and HTTP-only sessions
- Protected dashboard, customer order page and staff dashboard gate
- HMAC-signed, idempotent payment webhook foundation
- Protected download token issuance with expiry and maximum-download enforcement
- SEO metadata, sitemap, robots and security headers
- Reusable scraper CLI and documentation
- CI schema validation, typecheck, tests and build

## Remaining production modules
1. Payment provider-specific adapter and payment-status mapping
2. PDF invoice generation and invoice delivery
3. Quotation approval/revision APIs and timeline UI
4. Coupon, bundle and wishlist/review administration
5. File upload pipeline with object-storage multipart uploads
6. Notification providers for email, Discord, WhatsApp and push
7. Finance reports and full audit-log administration
8. Admin CRUD screens for products, customers, requests and content
9. Playwright E2E and security regression suite
