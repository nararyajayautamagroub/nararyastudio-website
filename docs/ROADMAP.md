# Roadmap

## Implemented foundation
- Public store, design, request, portfolio, project and cart pages
- Prisma/PostgreSQL domain schema
- Product catalog API
- Custom request API with NS-REQ IDs
- Checkout contract
- Payment webhook security baseline
- Customer/admin/support/FAQ/blog routes
- SEO sitemap + robots
- Security headers
- GitHub Actions CI

## Next production integration
1. Session authentication + password hashing + email verification
2. RBAC enforcement on admin APIs
3. Payment provider adapter + idempotent webhook event store
4. Object storage + signed expiring downloads
5. Order/invoice persistence and PDF generation
6. Quotation approval + revision timeline
7. Coupon, bundle, wishlist and reviews
8. Notifications: email/Discord/WhatsApp/push
9. Finance reports and audit log UI
10. Playwright E2E + security regression tests
