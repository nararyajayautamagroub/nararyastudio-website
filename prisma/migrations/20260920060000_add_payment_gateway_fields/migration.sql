ALTER TABLE "Order"
  ADD COLUMN "gatewayProvider" TEXT,
  ADD COLUMN "gatewayToken" TEXT,
  ADD COLUMN "gatewayRedirectUrl" TEXT,
  ADD COLUMN "gatewayTransactionId" TEXT;

CREATE INDEX "Order_gatewayProvider_idx" ON "Order"("gatewayProvider");
CREATE INDEX "Order_gatewayTransactionId_idx" ON "Order"("gatewayTransactionId");
