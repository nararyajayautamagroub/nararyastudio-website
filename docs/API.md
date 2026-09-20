# API Contract

## Public

GET /api/health
GET /api/products?q=&category=&page=&limit=
GET /api/products/:id
GET /api/products/:id/reviews
GET /api/bundles
GET /api/portfolio
GET /api/projects
GET /api/blog
GET /api/blog/:slug
POST /api/requests
POST /api/coupons/validate
POST /api/checkout

## Authentication

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
GET /api/auth/google
GET /api/auth/google/callback
POST /api/auth/password
POST /api/auth/sessions/revoke-all

Google OAuth uses an authorization-code flow with a short-lived HttpOnly state cookie. The callback requires a verified Google email before creating/linking the local account.

## Customer

GET /api/settings
PATCH /api/settings
GET /api/orders
POST /api/orders/:id/downloads
GET /api/downloads/:token
GET /api/quotations
POST /api/quotations/:id/approve
GET /api/wishlist
POST /api/wishlist
DELETE /api/wishlist?productId=
GET /api/notifications
PATCH /api/notifications
GET /api/invoices/:id
POST /api/tickets
POST /api/products/:id/reviews

## Payment

POST /api/payments/webhook

Webhook authentication uses HMAC-SHA256 over the raw request body with PAYMENT_WEBHOOK_SECRET and the x-webhook-signature header. Event IDs are stored uniquely so the same event is not applied twice.

## Staff

GET /api/admin/products
POST /api/admin/products
PATCH /api/admin/products/:id
DELETE /api/admin/products/:id
GET /api/admin/requests
PATCH /api/admin/requests/:id
POST /api/admin/quotations
GET /api/admin/reviews
PATCH /api/admin/reviews/:id
DELETE /api/admin/reviews/:id
GET /api/admin/finance/report
GET /api/admin/content/:type
POST /api/admin/content/:type
PATCH /api/admin/content/:type/:id
DELETE /api/admin/content/:type/:id
GET /api/admin/coupons
POST /api/admin/coupons

Staff APIs require a session with an allowed role.

## Scraper

The scraper is a local CLI under scripts/scraper.mjs. It is intentionally separate from the public HTTP API so a public visitor cannot turn the website into an arbitrary server-side fetch proxy.
