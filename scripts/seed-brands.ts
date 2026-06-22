import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BRANDS = [
  { id: "brand-gucci", name: "Gucci", slug: "gucci", country: "Italy", description: "Founded in Florence in 1921, Gucci is one of the world's leading luxury fashion brands." },
  { id: "brand-prada", name: "Prada", slug: "prada", country: "Italy", description: "Founded in 1913 in Milan, Prada is an Italian luxury fashion house renowned for leather goods and ready-to-wear." },
  { id: "brand-bottega", name: "Bottega Veneta", slug: "bottega-veneta", country: "Italy", description: "Founded in Vicenza in 1966, Bottega Veneta is celebrated for its signature intrecciato leather weave." },
  { id: "brand-saintlaurent", name: "Saint Laurent", slug: "saint-laurent", country: "France", description: "Founded in 1961 by Yves Saint Laurent, the house redefined modern fashion with le smoking tuxedo." },
  { id: "brand-balenciaga", name: "Balenciaga", slug: "balenciaga", country: "Spain", description: "Founded in 1917 by Cristóbal Balenciaga in San Sebastián, a house known for architectural silhouettes." },
  { id: "brand-valentino", name: "Valentino", slug: "valentino", country: "Italy", description: "Founded in Rome in 1960, Valentino is synonymous with haute couture and its iconic Rosso Valentino red." },
  { id: "brand-celine", name: "Celine", slug: "celine", country: "France", description: "Founded in 1945 in Paris, Celine epitomizes understated French luxury and minimalist elegance." },
  { id: "brand-loewe", name: "Loewe", slug: "loewe", country: "Spain", description: "Founded in 1846 in Madrid, Loewe is the oldest luxury house in Spain, famed for artisanal leather craft." },
  { id: "brand-hermes", name: "Hermès", slug: "hermes", country: "France", description: "Founded in 1837 in Paris, Hermès is the pinnacle of artisanal luxury, from Birkin bags to silk scarves." },
  { id: "brand-chanel", name: "Chanel", slug: "chanel", country: "France", description: "Founded by Coco Chanel in 1910, the house revolutionised women's fashion with timeless Parisian elegance." },
  { id: "brand-dior", name: "Dior", slug: "dior", country: "France", description: "Founded in 1946 by Christian Dior, the house launched the iconic New Look and remains a pillar of haute couture." },
  { id: "brand-therow", name: "The Row", slug: "the-row", country: "United States", description: "Founded in 2006 by Mary-Kate and Ashley Olsen, The Row is a masterclass in quiet, refined luxury." },
  { id: "brand-loropiana", name: "Loro Piana", slug: "loro-piana", country: "Italy", description: "Founded in 1924, Loro Piana is the world authority on the finest cashmere and wool fibres." },
  { id: "brand-cucinelli", name: "Brunello Cucinelli", slug: "brunello-cucinelli", country: "Italy", description: "Founded in 1978 in Solomeo, Brunello Cucinelli champions humanistic capitalism and Italian cashmere craft." },
  { id: "brand-toteme", name: "Toteme", slug: "toteme", country: "Sweden", description: "Founded in 2014 in Stockholm, Toteme offers Scandinavian minimalism with architectural precision." },
  { id: "brand-khaite", name: "Khaite", slug: "khaite", country: "United States", description: "Founded in 2016 in New York, Khaite balances strength and femininity with modern American luxury." },
  { id: "brand-jilsander", name: "Jil Sander", slug: "jil-sander", country: "Germany", description: "Founded in 1968 in Hamburg, Jil Sander is the definitive house of pure, pared-back luxury." },
  { id: "brand-lemaire", name: "Lemaire", slug: "lemaire", country: "France", description: "Founded by Christophe Lemaire, the house creates elevated essentials rooted in simplicity and movement." },
];

const CATEGORIES = [
  { id: "cat-coats", name: "Coats & Jackets", slug: "coats-jackets" },
  { id: "cat-dresses", name: "Dresses", slug: "dresses" },
  { id: "cat-tops", name: "Tops & Blouses", slug: "tops-blouses" },
  { id: "cat-trousers", name: "Trousers & Shorts", slug: "trousers-shorts" },
  { id: "cat-knitwear", name: "Knitwear", slug: "knitwear" },
  { id: "cat-bags", name: "Bags", slug: "bags" },
  { id: "cat-shoes", name: "Shoes", slug: "shoes" },
  { id: "cat-accessories", name: "Accessories", slug: "accessories" },
  { id: "cat-suits", name: "Suits & Tailoring", slug: "suits-tailoring" },
  { id: "cat-swimwear", name: "Swimwear", slug: "swimwear" },
  { id: "cat-rtw", name: "Ready-to-Wear", slug: "ready-to-wear" },
  { id: "cat-outerwear", name: "Outerwear", slug: "outerwear" },
  { id: "cat-skirts", name: "Skirts", slug: "skirts" },
  { id: "cat-denim", name: "Denim", slug: "denim" },
  { id: "cat-jewellery", name: "Jewellery", slug: "jewellery" },
  { id: "cat-scarves", name: "Scarves & Wraps", slug: "scarves-wraps" },
  { id: "cat-sunglasses", name: "Sunglasses", slug: "sunglasses" },
  { id: "cat-belts", name: "Belts", slug: "belts" },
];

async function main() {
  console.log("\n  Seeding brands...");

  let brandCount = 0;
  for (const brand of BRANDS) {
    const existing = await prisma.brand.findUnique({ where: { id: brand.id } });
    if (existing) {
      console.log(`    · ${brand.name} — already exists`);
      continue;
    }
    const slugExists = await prisma.brand.findUnique({ where: { slug: brand.slug } });
    if (slugExists) {
      console.log(`    · ${brand.name} — slug conflict, skipping`);
      continue;
    }
    await prisma.brand.create({ data: brand });
    console.log(`    ✓ ${brand.name}`);
    brandCount++;
  }

  console.log(`\n  Seeding categories...`);

  let catCount = 0;
  for (const cat of CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { id: cat.id } });
    if (existing) {
      console.log(`    · ${cat.name} — already exists`);
      continue;
    }
    const slugExists = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (slugExists) {
      console.log(`    · ${cat.name} — slug conflict, skipping`);
      continue;
    }
    await prisma.category.create({ data: cat });
    console.log(`    ✓ ${cat.name}`);
    catCount++;
  }

  console.log(`\n  Done — ${brandCount} brands and ${catCount} categories created.`);
  console.log("  Refresh the Product Ingestion Studio and the dropdowns will be populated.\n");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
