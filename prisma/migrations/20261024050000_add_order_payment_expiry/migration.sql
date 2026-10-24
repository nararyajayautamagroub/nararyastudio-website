ALTER TABLE "Order"
  ADD COLUMN "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 minutes');

CREATE INDEX "Order_expiresAt_paymentStatus_idx" ON "Order"("expiresAt", "paymentStatus");
