# NARARYA STUDIO Architecture

Public/customer UI -> Next.js route handlers -> service/domain layer -> PostgreSQL/Prisma -> protected storage -> notifications.

## Production rules
- Harga, status, produk, quotation, portfolio dan konten harus berasal dari database/admin.
- Download hanya melalui authorization + expiring token.
- Gunakan environment variables untuk secret/payment/storage credentials.
- RBAC wajib diterapkan pada admin endpoints.
- Validasi upload: MIME, extension, size, filename normalization.
- Audit every privileged mutation.
- Payment webhook harus idempotent.
- Never log passwords, tokens, identity documents, or payment secrets.

## Modules
Commerce, Requests, Quotations, Orders, Digital Delivery, Customer Dashboard, Portfolio, Support, Notifications, Promotions, Reviews, Finance, RBAC, Audit, Analytics.
