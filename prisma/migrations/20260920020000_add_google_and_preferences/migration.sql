ALTER TABLE "User"
ADD COLUMN "googleId" TEXT,
ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'id',
ADD COLUMN "theme" TEXT NOT NULL DEFAULT 'system';

CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
