ALTER TABLE "Order" ADD COLUMN "checkoutTokenHash" TEXT;
CREATE UNIQUE INDEX "Order_checkoutTokenHash_key" ON "Order"("checkoutTokenHash");
