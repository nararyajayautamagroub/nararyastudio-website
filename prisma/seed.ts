import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const products = [
    ["NS-PROD-000001", "Strobo Animation Pack V3", "Animation", 45000],
    ["NS-PROD-000002", "BUS Creative Livery Pack", "Livery", 75000],
    ["NS-PROD-000003", "3D Vehicle Base", "3D", 250000],
    ["NS-PROD-000004", "Graphic Asset Starter", "Other", 35000]
  ] as const;

  for (const [productId, name, category, price] of products) {
    await db.product.upsert({
      where: { productId },
      update: {},
      create: {
        productId,
        name,
        slug: productId.toLowerCase(),
        description: "Digital product " + name,
        category,
        price,
        status: "PUBLISHED",
        author: "NARARYA STUDIO",
        license: "Personal / Project License"
      }
    });
  }

  const portfolio = [
    {
      slug: "brand-identity-nararya-studio",
      title: "Brand Identity",
      category: "Branding",
      description: "Logo, visual identity and social assets for NARARYA STUDIO.",
      services: ["Logo", "Visual Identity", "Social Assets"],
      year: 2026,
      featured: true
    },
    {
      slug: "3d-vehicle-concept-bus",
      title: "3D Vehicle",
      category: "3D",
      description: "Concept vehicle modeling with texture and rendering.",
      services: ["3D Modeling", "Texture", "Rendering"],
      year: 2026,
      featured: true
    },
    {
      slug: "strobo-animation-pack",
      title: "Animation",
      category: "Animation",
      description: "Motion graphics and vehicle animation assets.",
      services: ["Motion Graphic", "Vehicle Animation"],
      year: 2026,
      featured: true
    },
    {
      slug: "creative-campaign",
      title: "Graphic Design",
      category: "Graphic Design",
      description: "Poster, banner and promotional campaign assets.",
      services: ["Poster", "Banner", "Promotion"],
      year: 2026,
      featured: false
    }
  ] as const;

  for (const entry of portfolio) {
    await db.portfolioEntry.upsert({
      where: { slug: entry.slug },
      update: {},
      create: entry
    });
  }

  await db.projectCaseStudy.upsert({
    where: { slug: "jetbus-3-shd-concept" },
    update: {},
    create: {
      slug: "jetbus-3-shd-concept",
      title: "Jetbus 3 SHD Concept",
      category: "3D Vehicle",
      summary: "Case study for a digital vehicle concept.",
      description: "Process, software, services, result and project credits in one case study.",
      software: ["Blender"],
      services: ["3D Modeling", "Texture", "Rendering"],
      status: "COMPLETED",
      completedAt: new Date("2026-08-01T00:00:00.000Z")
    }
  });

  const posts = [
    {
      slug: "cara-menyiapkan-brief-design",
      title: "Cara Menyiapkan Brief Design",
      excerpt: "Tips membuat brief yang jelas agar proses desain tidak berputar-putar.",
      content: "Brief yang jelas mencakup tujuan, target, ukuran, format, referensi, deadline dan batas revisi.",
      author: "NARARYA STUDIO"
    },
    {
      slug: "panduan-file-digital",
      title: "Panduan File Digital",
      excerpt: "Kenali format, lisensi, versi dan cara menyimpan produk digital.",
      content: "Periksa format file, versi produk, lisensi, kompatibilitas dan changelog sebelum menggunakan produk digital.",
      author: "NARARYA STUDIO"
    },
    {
      slug: "workflow-custom-request",
      title: "Workflow Custom Request",
      excerpt: "Dari brief, quotation, pembayaran, produksi, revisi sampai final delivery.",
      content: "Workflow custom request dimulai dari brief lalu review, quotation, approval, pembayaran, produksi, revisi dan final delivery.",
      author: "NARARYA STUDIO"
    }
  ] as const;

  for (const post of posts) {
    await db.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...post,
        publishedAt: new Date("2026-09-01T00:00:00.000Z"),
        tags: ["NARARYA STUDIO", "Guide"]
      }
    });
  }

  await db.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      discountPercent: 10,
      minSubtotal: 50000,
      active: true
    }
  });

  const bundleItems = await db.product.findMany({
    where: { productId: { in: ["NS-PROD-000001", "NS-PROD-000002"] } },
    select: { id: true, productId: true }
  });

  const bundle = await db.bundle.upsert({
    where: { bundleId: "NS-BND-000001" },
    update: {},
    create: {
      bundleId: "NS-BND-000001",
      slug: "creative-start-bundle",
      name: "Creative Start Bundle",
      description: "Starter bundle for digital creative assets.",
      discountPercent: 10,
      active: true
    }
  });

  for (const product of bundleItems) {
    await db.bundleItem.upsert({
      where: {
        bundleId_productId: {
          bundleId: bundle.id,
          productId: product.id
        }
      },
      update: { quantity: 1 },
      create: {
        bundleId: bundle.id,
        productId: product.id,
        quantity: 1
      }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
