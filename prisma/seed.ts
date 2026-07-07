import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌍 Seeding The Heritage Edit database...\n");

  // ─── BRANDS ───────────────────────────────────────────────────
  const brands = await Promise.all(
    [
      { name: "Ozwald Boateng", slug: "ozwald-boateng", country: "Ghana/UK" },
      { name: "Duro Olowu", slug: "duro-olowu", country: "Nigeria/UK" },
      { name: "Lisa Folawiyo", slug: "lisa-folawiyo", country: "Nigeria" },
      { name: "Maki Oh", slug: "maki-oh", country: "Nigeria" },
      { name: "Thebe Magugu", slug: "thebe-magugu", country: "South Africa" },
      { name: "Kenneth Ize", slug: "kenneth-ize", country: "Nigeria" },
      { name: "Imane Ayissi", slug: "imane-ayissi", country: "Cameroon" },
      { name: "Laduma Ngxokolo", slug: "laduma-ngxokolo", country: "South Africa" },
      { name: "Christie Brown", slug: "christie-brown", country: "Ghana" },
      { name: "Tongoro", slug: "tongoro", country: "Senegal" },
      { name: "Ahluwalia", slug: "ahluwalia", country: "Nigeria/UK" },
      { name: "Orange Culture", slug: "orange-culture", country: "Nigeria" },
    ].map((brand) =>
      prisma.brand.upsert({
        where: { slug: brand.slug },
        update: {},
        create: brand,
      }),
    ),
  );

  console.log(`✓ ${brands.length} brands created`);

  // ─── CATEGORIES ───────────────────────────────────────────────
  const categories = await Promise.all(
    [
      { name: "Agbada & Robes", slug: "agbada-robes" },
      { name: "Ankara Dresses", slug: "ankara-dresses" },
      { name: "Kente Wear", slug: "kente-wear" },
      { name: "Dashiki & Tops", slug: "dashiki-tops" },
      { name: "Aso Oke", slug: "aso-oke" },
      { name: "Tailored Suits", slug: "tailored-suits" },
      { name: "Accessories", slug: "accessories" },
      { name: "Bags & Clutches", slug: "bags-clutches" },
      { name: "Shoes & Sandals", slug: "shoes-sandals" },
      { name: "Headwraps & Gele", slug: "headwraps-gele" },
      { name: "Swimwear & Resort", slug: "swimwear-resort" },
      { name: "Outerwear", slug: "outerwear" },
    ].map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      }),
    ),
  );

  console.log(`✓ ${categories.length} categories created`);

  // ─── COLLECTIONS ──────────────────────────────────────────────
  const collections = await Promise.all(
    [
      { name: "New Arrivals", slug: "new-arrivals", isFeatured: true, description: "The latest additions to our curated collection of African fashion" },
      { name: "Women", slug: "women", isFeatured: true, description: "Elegant African-inspired womenswear for every occasion" },
      { name: "Men", slug: "men", isFeatured: true, description: "Distinguished menswear rooted in African sartorial tradition" },
      { name: "Wedding & Ceremony", slug: "wedding-ceremony", isFeatured: true, description: "Luxurious pieces for life's most important celebrations" },
      { name: "Heritage Classics", slug: "heritage-classics", isFeatured: true, description: "Timeless pieces that honor centuries of African textile artistry" },
      { name: "Resort Collection", slug: "resort-collection", isFeatured: false, description: "Effortless style for warm-weather destinations" },
      { name: "Artisan Edit", slug: "artisan-edit", isFeatured: false, description: "Handcrafted pieces made by master artisans across Africa" },
    ].map((col) =>
      prisma.collection.upsert({
        where: { slug: col.slug },
        update: {},
        create: col,
      }),
    ),
  );

  console.log(`✓ ${collections.length} collections created`);

  // ─── ADMIN USER ───────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "admin@theheritageedit.com" },
    update: {},
    create: {
      email: "admin@theheritageedit.com",
      passwordHash: await bcrypt.hash("HeritageAdmin2026!", 12),
      firstName: "Heritage",
      lastName: "Admin",
      role: "SUPER_ADMIN",
    },
  });

  // Demo customer account
  await prisma.user.upsert({
    where: { email: "customer@demo.com" },
    update: {},
    create: {
      email: "customer@demo.com",
      passwordHash: await bcrypt.hash("Customer2026!", 12),
      firstName: "Amara",
      lastName: "Okafor",
      role: "CUSTOMER",
    },
  });

  console.log("✓ Admin and demo users created");

  // ─── PRODUCTS ─────────────────────────────────────────────────
  const ozwald = brands.find((b) => b.slug === "ozwald-boateng")!;
  const duro = brands.find((b) => b.slug === "duro-olowu")!;
  const lisa = brands.find((b) => b.slug === "lisa-folawiyo")!;
  const maki = brands.find((b) => b.slug === "maki-oh")!;
  const thebe = brands.find((b) => b.slug === "thebe-magugu")!;
  const kenneth = brands.find((b) => b.slug === "kenneth-ize")!;
  const imane = brands.find((b) => b.slug === "imane-ayissi")!;
  const laduma = brands.find((b) => b.slug === "laduma-ngxokolo")!;
  const christie = brands.find((b) => b.slug === "christie-brown")!;
  const tongoro = brands.find((b) => b.slug === "tongoro")!;
  const ahluwalia = brands.find((b) => b.slug === "ahluwalia")!;
  const orange = brands.find((b) => b.slug === "orange-culture")!;

  const agbada = categories.find((c) => c.slug === "agbada-robes")!;
  const ankara = categories.find((c) => c.slug === "ankara-dresses")!;
  const kente = categories.find((c) => c.slug === "kente-wear")!;
  const dashiki = categories.find((c) => c.slug === "dashiki-tops")!;
  const asoOke = categories.find((c) => c.slug === "aso-oke")!;
  const suits = categories.find((c) => c.slug === "tailored-suits")!;
  const accessories = categories.find((c) => c.slug === "accessories")!;
  const bags = categories.find((c) => c.slug === "bags-clutches")!;
  const shoes = categories.find((c) => c.slug === "shoes-sandals")!;
  const headwraps = categories.find((c) => c.slug === "headwraps-gele")!;
  const outerwear = categories.find((c) => c.slug === "outerwear")!;

  const sampleProducts = [
    {
      sku: "OZB-SUI-001",
      name: "Savile Row Kente-Lined Bespoke Suit",
      slug: "ozwald-boateng-kente-lined-bespoke-suit",
      description: "A masterfully tailored two-piece suit with a hidden Kente cloth lining, blending Savile Row precision with Ghanaian heritage. The exterior presents classic British tailoring while the interior reveals a stunning hand-woven Kente panel in gold and royal blue.",
      brandId: ozwald.id,
      categoryId: suits.id,
      basePriceCents: 450000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: true,
    },
    {
      sku: "DUR-DRS-001",
      name: "Ankara Print Wrap Maxi Dress",
      slug: "duro-olowu-ankara-wrap-maxi-dress",
      description: "A flowing wrap maxi dress in a bold, original Ankara print exclusive to the house. The vibrant pattern combines traditional West African motifs with contemporary color blocking, creating a statement piece that transitions effortlessly from day to evening.",
      brandId: duro.id,
      categoryId: ankara.id,
      basePriceCents: 185000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: true,
    },
    {
      sku: "LIS-DRS-001",
      name: "Sequined Ankara Cocktail Gown",
      slug: "lisa-folawiyo-sequined-ankara-cocktail-gown",
      description: "Lisa Folawiyo's signature technique of hand-applying sequins to traditional Ankara fabric creates this breathtaking cocktail gown. Each sequin is individually placed to enhance the existing print pattern, resulting in a piece that shimmers with cultural storytelling.",
      brandId: lisa.id,
      categoryId: ankara.id,
      basePriceCents: 320000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: true,
    },
    {
      sku: "MAK-TOP-001",
      name: "Adire Indigo Silk Blouse",
      slug: "maki-oh-adire-indigo-silk-blouse",
      description: "Crafted from hand-dyed Adire silk using the ancient Yoruba resist-dyeing technique, this blouse features organic indigo patterns that are unique to each piece. The traditional craft meets modern silhouette in this wearable work of art.",
      brandId: maki.id,
      categoryId: dashiki.id,
      basePriceCents: 95000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: true,
    },
    {
      sku: "THE-OUT-001",
      name: "Sisterhood Trench Coat",
      slug: "thebe-magugu-sisterhood-trench-coat",
      description: "Part of Thebe Magugu's acclaimed collection exploring South African women's stories, this structured trench coat features custom-printed lining depicting archival photographs. A powerful fusion of fashion and social commentary.",
      brandId: thebe.id,
      categoryId: outerwear.id,
      basePriceCents: 275000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: true,
    },
    {
      sku: "KEN-AGE-001",
      name: "Aso Oke Hand-Woven Grand Agbada",
      slug: "kenneth-ize-aso-oke-grand-agbada",
      description: "A magnificent three-piece Agbada ensemble woven by master craftsmen in Iseyin, Nigeria. The Aso Oke fabric is hand-loomed over several weeks, featuring intricate geometric patterns in gold thread on a deep indigo base. Includes the flowing outer robe, inner tunic, and matching trousers.",
      brandId: kenneth.id,
      categoryId: agbada.id,
      basePriceCents: 520000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: true,
    },
    {
      sku: "IMA-DRS-001",
      name: "Haute Couture Raffia Evening Gown",
      slug: "imane-ayissi-raffia-evening-gown",
      description: "Imane Ayissi's couture mastery transforms traditional Cameroonian raffia into a sculptural evening gown. Hand-woven bark cloth panels are layered with silk organza, creating a piece that has graced the Paris Haute Couture calendar.",
      brandId: imane.id,
      categoryId: ankara.id,
      basePriceCents: 680000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: false,
    },
    {
      sku: "LAD-KNT-001",
      name: "MaXhosa Geometric Knit Cape",
      slug: "laduma-ngxokolo-maxhosa-geometric-cape",
      description: "Inspired by Xhosa beadwork traditions, this bold geometric knit cape translates the sacred patterns of South African initiation ceremonies into contemporary knitwear. Each color combination holds cultural significance passed down through generations.",
      brandId: laduma.id,
      categoryId: kente.id,
      basePriceCents: 165000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: true,
    },
    {
      sku: "CHR-ACC-001",
      name: "Brass & Leather Statement Collar",
      slug: "christie-brown-brass-leather-collar",
      description: "A stunning statement collar handcrafted by Ghanaian artisans using traditional lost-wax brass casting techniques. Leather panels are hand-tooled with Adinkra symbols representing wisdom and strength.",
      brandId: christie.id,
      categoryId: accessories.id,
      basePriceCents: 48000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: false,
    },
    {
      sku: "TON-DRS-001",
      name: "Wax Print Structured Midi Dress",
      slug: "tongoro-wax-print-structured-midi",
      description: "A beautifully structured midi dress in exclusive wax print fabric, designed and produced entirely in Dakar, Senegal. The architectural silhouette features origami-inspired pleating that showcases the fabric's bold pattern to maximum effect.",
      brandId: tongoro.id,
      categoryId: ankara.id,
      basePriceCents: 125000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: true,
    },
    {
      sku: "AHL-BAG-001",
      name: "Patchwork Heritage Tote",
      slug: "ahluwalia-patchwork-heritage-tote",
      description: "Ahluwalia's signature patchwork technique transforms deadstock African fabrics into a luxurious oversized tote. Each bag is unique, combining vintage Nigerian textiles with Italian leather trim in a celebration of cultural fusion and sustainability.",
      brandId: ahluwalia.id,
      categoryId: bags.id,
      basePriceCents: 89000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: true,
    },
    {
      sku: "ORC-TOP-001",
      name: "Gender-Fluid Aso Oke Bomber Jacket",
      slug: "orange-culture-aso-oke-bomber",
      description: "Orange Culture's boundary-pushing design reimagines the traditional Aso Oke textile as a contemporary bomber jacket. Hand-woven strips are assembled into a modern silhouette that challenges conventions while honoring Yoruba weaving traditions.",
      brandId: orange.id,
      categoryId: outerwear.id,
      basePriceCents: 145000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: false,
    },
    {
      sku: "KEN-ASO-001",
      name: "Aso Oke Bridal Cape",
      slug: "kenneth-ize-aso-oke-bridal-cape",
      description: "A breathtaking bridal cape hand-woven in the finest Aso Oke silk, featuring delicate gold metallic threads throughout. This ceremonial piece takes master weavers over three months to complete and represents the pinnacle of Nigerian textile artistry.",
      brandId: kenneth.id,
      categoryId: asoOke.id,
      basePriceCents: 750000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: true,
    },
    {
      sku: "OZB-AGE-001",
      name: "Modern Agbada in Italian Wool",
      slug: "ozwald-boateng-modern-agbada-italian-wool",
      description: "Ozwald Boateng's revolutionary take on the West African Agbada, cut from the finest Italian super 150s wool. The traditional flowing silhouette is refined with Savile Row construction techniques, creating a garment that commands presence at any formal occasion.",
      brandId: ozwald.id,
      categoryId: agbada.id,
      basePriceCents: 380000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: true,
    },
    {
      sku: "THE-ACC-001",
      name: "Beaded Zulu Headwrap",
      slug: "thebe-magugu-beaded-zulu-headwrap",
      description: "A contemporary interpretation of the traditional Zulu isicholo headpiece, featuring hand-beaded detailing by rural South African artisans. Each piece supports a cooperative of women beaders in KwaZulu-Natal.",
      brandId: thebe.id,
      categoryId: headwraps.id,
      basePriceCents: 35000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: false,
    },
    {
      sku: "CHR-SHO-001",
      name: "Woven Leather Gladiator Sandals",
      slug: "christie-brown-woven-leather-gladiators",
      description: "Handcrafted gladiator sandals featuring intricate leather weaving techniques passed down through generations of Ghanaian leatherworkers. Vegetable-tanned leather develops a rich patina over time.",
      brandId: christie.id,
      categoryId: shoes.id,
      basePriceCents: 42000,
      currency: "USD",
      status: "PUBLISHED" as const,
      isFeatured: false,
    },
  ];

  let productCount = 0;
  for (const productData of sampleProducts) {
    const existing = await prisma.product.findUnique({
      where: { slug: productData.slug },
    });

    if (!existing) {
      const product = await prisma.product.create({
        data: {
          ...productData,
          variants: {
            create: [
              { size: "XS", stockCount: 5 },
              { size: "S", stockCount: 12 },
              { size: "M", stockCount: 18 },
              { size: "L", stockCount: 10 },
              { size: "XL", stockCount: 6 },
              { size: "XXL", stockCount: 3 },
            ],
          },
        },
      });

      // Add heritage narratives for featured products
      if (productData.isFeatured) {
        await prisma.heritageNarrative.create({
          data: {
            productId: product.id,
            historyAndHeritage: `This piece draws from centuries of ${productData.description.includes("Kente") ? "Kente weaving" : productData.description.includes("Ankara") ? "Ankara printing" : productData.description.includes("Aso Oke") ? "Aso Oke weaving" : productData.description.includes("Adire") ? "Adire dyeing" : "African textile"} tradition. The techniques used in its creation have been passed down through generations of master artisans, each adding their own innovation while preserving the core cultural knowledge.`,
            whenToWear: "This versatile piece transitions beautifully from formal cultural celebrations to contemporary social occasions. It makes a powerful statement at gallery openings, diplomatic events, and milestone celebrations.",
            rightOccasion: ["Cultural ceremonies", "Formal events", "Art exhibitions", "Weddings", "Business occasions"],
            styleRecommendations: ["Pair with gold accessories for maximum impact", "Layer with contemporary basics for everyday luxury", "Complete with heritage-inspired jewelry"],
            isApproved: true,
            approvedAt: new Date(),
            aiModelUsed: "seed-data",
          },
        });
      }

      productCount++;
    }
  }

  console.log(`✓ ${productCount} products created with variants and heritage narratives`);

  // ─── ASSIGN PRODUCTS TO COLLECTIONS ───────────────────────────
  const allProducts = await prisma.product.findMany({ select: { id: true, slug: true } });
  const newArrivals = collections.find((c) => c.slug === "new-arrivals")!;
  const womenCol = collections.find((c) => c.slug === "women")!;
  const menCol = collections.find((c) => c.slug === "men")!;
  const heritageClassics = collections.find((c) => c.slug === "heritage-classics")!;

  const womenSlugs = [
    "duro-olowu-ankara-wrap-maxi-dress",
    "lisa-folawiyo-sequined-ankara-cocktail-gown",
    "maki-oh-adire-indigo-silk-blouse",
    "thebe-magugu-sisterhood-trench-coat",
    "imane-ayissi-raffia-evening-gown",
    "tongoro-wax-print-structured-midi",
    "kenneth-ize-aso-oke-bridal-cape",
  ];

  const menSlugs = [
    "ozwald-boateng-kente-lined-bespoke-suit",
    "kenneth-ize-aso-oke-grand-agbada",
    "ozwald-boateng-modern-agbada-italian-wool",
    "orange-culture-aso-oke-bomber",
  ];

  const heritageSlugs = [
    "kenneth-ize-aso-oke-grand-agbada",
    "laduma-ngxokolo-maxhosa-geometric-cape",
    "kenneth-ize-aso-oke-bridal-cape",
    "christie-brown-brass-leather-collar",
    "thebe-magugu-beaded-zulu-headwrap",
  ];

  // Add all to New Arrivals
  for (const product of allProducts.slice(0, 8)) {
    await prisma.collectionProduct.upsert({
      where: { collectionId_productId: { collectionId: newArrivals.id, productId: product.id } },
      update: {},
      create: { collectionId: newArrivals.id, productId: product.id },
    });
  }

  // Add women's products
  for (const slug of womenSlugs) {
    const product = allProducts.find((p) => p.slug === slug);
    if (product) {
      await prisma.collectionProduct.upsert({
        where: { collectionId_productId: { collectionId: womenCol.id, productId: product.id } },
        update: {},
        create: { collectionId: womenCol.id, productId: product.id },
      });
    }
  }

  // Add men's products
  for (const slug of menSlugs) {
    const product = allProducts.find((p) => p.slug === slug);
    if (product) {
      await prisma.collectionProduct.upsert({
        where: { collectionId_productId: { collectionId: menCol.id, productId: product.id } },
        update: {},
        create: { collectionId: menCol.id, productId: product.id },
      });
    }
  }

  // Add heritage classics
  for (const slug of heritageSlugs) {
    const product = allProducts.find((p) => p.slug === slug);
    if (product) {
      await prisma.collectionProduct.upsert({
        where: { collectionId_productId: { collectionId: heritageClassics.id, productId: product.id } },
        update: {},
        create: { collectionId: heritageClassics.id, productId: product.id },
      });
    }
  }

  console.log("✓ Products assigned to collections");

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  🎉 THE HERITAGE EDIT — Database seeded successfully!");
  console.log("═══════════════════════════════════════════════════════");
  console.log("\n  Login Credentials:");
  console.log("  ─────────────────────────────────────────────────────");
  console.log("  Admin:    admin@theheritageedit.com / HeritageAdmin2026!");
  console.log("  Customer: customer@demo.com / Customer2026!");
  console.log("═══════════════════════════════════════════════════════\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
