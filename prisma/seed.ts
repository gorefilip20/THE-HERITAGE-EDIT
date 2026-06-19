import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const brands = await Promise.all(
    [
      { name: "Gucci", slug: "gucci", country: "Italy" },
      { name: "Prada", slug: "prada", country: "Italy" },
      { name: "Bottega Veneta", slug: "bottega-veneta", country: "Italy" },
      { name: "Saint Laurent", slug: "saint-laurent", country: "France" },
      { name: "Balenciaga", slug: "balenciaga", country: "Spain" },
      { name: "Valentino", slug: "valentino", country: "Italy" },
      { name: "Celine", slug: "celine", country: "France" },
      { name: "Loewe", slug: "loewe", country: "Spain" },
      { name: "Hermès", slug: "hermes", country: "France" },
      { name: "Chanel", slug: "chanel", country: "France" },
    ].map((brand) =>
      prisma.brand.upsert({
        where: { slug: brand.slug },
        update: {},
        create: brand,
      }),
    ),
  );

  const categories = await Promise.all(
    [
      { name: "Coats & Jackets", slug: "coats-jackets" },
      { name: "Dresses", slug: "dresses" },
      { name: "Tops & Blouses", slug: "tops-blouses" },
      { name: "Trousers & Shorts", slug: "trousers-shorts" },
      { name: "Knitwear", slug: "knitwear" },
      { name: "Bags", slug: "bags" },
      { name: "Shoes", slug: "shoes" },
      { name: "Accessories", slug: "accessories" },
      { name: "Suits & Tailoring", slug: "suits-tailoring" },
      { name: "Swimwear", slug: "swimwear" },
    ].map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      }),
    ),
  );

  const collections = await Promise.all(
    [
      { name: "New Arrivals", slug: "new-arrivals", isFeatured: true },
      { name: "Women", slug: "women", isFeatured: true },
      { name: "Men", slug: "men", isFeatured: true },
      { name: "Accessories", slug: "accessories-collection", isFeatured: true },
      { name: "Editorial", slug: "editorial", isFeatured: false },
      { name: "All", slug: "all", isFeatured: false },
    ].map((col) =>
      prisma.collection.upsert({
        where: { slug: col.slug },
        update: {},
        create: col,
      }),
    ),
  );

  await prisma.user.upsert({
    where: { email: "admin@heritageedit.com" },
    update: {},
    create: {
      email: "admin@heritageedit.com",
      passwordHash: await bcrypt.hash("heritage2024", 12),
      firstName: "Heritage",
      lastName: "Admin",
      role: "SUPER_ADMIN",
    },
  });

  const gucci = brands.find((b) => b.slug === "gucci")!;
  const prada = brands.find((b) => b.slug === "prada")!;
  const bottega = brands.find((b) => b.slug === "bottega-veneta")!;
  const saintLaurent = brands.find((b) => b.slug === "saint-laurent")!;

  const coats = categories.find((c) => c.slug === "coats-jackets")!;
  const dresses = categories.find((c) => c.slug === "dresses")!;
  const bags = categories.find((c) => c.slug === "bags")!;
  const suits = categories.find((c) => c.slug === "suits-tailoring")!;

  const sampleProducts = [
    {
      sku: "GUC-COA-001",
      name: "Wool Silk Double-Breasted Blazer",
      slug: "gucci-wool-silk-double-breasted-blazer",
      description: "A masterfully tailored double-breasted blazer in a wool-silk blend, featuring the house's signature horsebit hardware at the closure.",
      brandId: gucci.id,
      categoryId: coats.id,
      basePriceCents: 325000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: true,
    },
    {
      sku: "PRA-DRS-001",
      name: "Re-Nylon Gabardine Midi Dress",
      slug: "prada-re-nylon-gabardine-midi-dress",
      description: "Crafted from Prada's iconic Re-Nylon fabric, this structured midi dress balances sustainable innovation with architectural precision.",
      brandId: prada.id,
      categoryId: dresses.id,
      basePriceCents: 285000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: true,
    },
    {
      sku: "BOT-BAG-001",
      name: "Intrecciato Leather Cassette Bag",
      slug: "bottega-veneta-intrecciato-cassette",
      description: "The iconic Cassette bag in Bottega Veneta's signature Intrecciato weave, rendered in butter-soft nappa leather with a padded silhouette.",
      brandId: bottega.id,
      categoryId: bags.id,
      basePriceCents: 380000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: true,
    },
    {
      sku: "SLR-SUI-001",
      name: "Grain de Poudre Tuxedo Jacket",
      slug: "saint-laurent-grain-de-poudre-tuxedo",
      description: "An impeccably cut tuxedo jacket in Saint Laurent's signature Grain de Poudre wool. The culmination of the house's Le Smoking legacy.",
      brandId: saintLaurent.id,
      categoryId: suits.id,
      basePriceCents: 395000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: true,
    },
  ];

  for (const productData of sampleProducts) {
    const existing = await prisma.product.findUnique({
      where: { slug: productData.slug },
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          ...productData,
          variants: {
            create: [
              { size: "XS", stockCount: 3 },
              { size: "S", stockCount: 8 },
              { size: "M", stockCount: 12 },
              { size: "L", stockCount: 6 },
              { size: "XL", stockCount: 4 },
            ],
          },
        },
      });
    }
  }

  console.log("Seed completed successfully");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
