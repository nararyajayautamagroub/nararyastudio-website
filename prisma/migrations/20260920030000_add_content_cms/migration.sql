CREATE TABLE "PortfolioEntry" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "image" TEXT,
  "services" JSONB,
  "year" INTEGER,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PortfolioEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectCaseStudy" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "software" JSONB,
  "services" JSONB,
  "status" TEXT NOT NULL DEFAULT 'COMPLETED',
  "coverImage" TEXT,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProjectCaseStudy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlogPost" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "coverImage" TEXT,
  "author" TEXT NOT NULL,
  "tags" JSONB,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PortfolioEntry_slug_key" ON "PortfolioEntry"("slug");
CREATE INDEX "PortfolioEntry_published_featured_createdAt_idx" ON "PortfolioEntry"("published","featured","createdAt");
CREATE INDEX "PortfolioEntry_category_idx" ON "PortfolioEntry"("category");
CREATE UNIQUE INDEX "ProjectCaseStudy_slug_key" ON "ProjectCaseStudy"("slug");
CREATE INDEX "ProjectCaseStudy_status_createdAt_idx" ON "ProjectCaseStudy"("status","createdAt");
CREATE INDEX "ProjectCaseStudy_category_idx" ON "ProjectCaseStudy"("category");
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
CREATE INDEX "BlogPost_published_publishedAt_idx" ON "BlogPost"("published","publishedAt");
CREATE INDEX "BlogPost_createdAt_idx" ON "BlogPost"("createdAt");
