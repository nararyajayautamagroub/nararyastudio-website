# API Contract

## Public

GET /api/health
GET /api/products?q=&category=&page=&limit=
GET /api/products/:id
POST /api/requests
POST /api/checkout

## Authentication

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me

## Customer

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

Staff APIs require a session with an allowed role.

## Scraper

The scraper is a local CLI under scripts/scraper.mjs. It is intentionally separate from the public HTTP API so a public visitor cannot turn the website into an arbitrary server-side fetch proxy.
