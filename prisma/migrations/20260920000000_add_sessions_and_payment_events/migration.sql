ALTER TABLE "Product" ADD COLUMN "salesCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "UserSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentEvent" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "orderId" TEXT,
  "status" "PaymentStatus" NOT NULL,
  "amount" INTEGER,
  "payload" JSONB,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserSession_tokenHash_key" ON "UserSession"("tokenHash");
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");
CREATE INDEX "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");
CREATE UNIQUE INDEX "PaymentEvent_eventId_key" ON "PaymentEvent"("eventId");
CREATE INDEX "PaymentEvent_orderId_idx" ON "PaymentEvent"("orderId");
CREATE INDEX "PaymentEvent_processedAt_idx" ON "PaymentEvent"("processedAt");
CREATE INDEX "DownloadLog_tokenHash_idx" ON "DownloadLog"("tokenHash");
CREATE INDEX "DownloadLog_expiresAt_idx" ON "DownloadLog"("expiresAt");

ALTER TABLE "UserSession"
ADD CONSTRAINT "UserSession_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PaymentEvent"
ADD CONSTRAINT "PaymentEvent_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
