ALTER TABLE "Order" ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'QRIS';
CREATE INDEX "Order_paymentMethod_idx" ON "Order"("paymentMethod");
