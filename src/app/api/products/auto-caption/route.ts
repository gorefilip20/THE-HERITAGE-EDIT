import { NextRequest, NextResponse } from "next/server";

const CATEGORY_TEMPLATES: Record<string, string[]> = {
  "Senator Wear": [
    "A masterwork of Nigerian formal dressing, the {name} by {brand} exemplifies the precision tailoring and premium fabrication that define modern Senator wear. Cut with meticulous attention to structure and proportion, this piece commands presence at every occasion.",
    "Embodying the distinguished heritage of West African formal attire, this {name} from {brand} marries traditional Senator silhouettes with contemporary luxury finishing. Every seam speaks to the artisanal excellence that discerning gentlemen demand.",
  ],
  "Native Wear": [
    "Rooted in the rich textile traditions of West Africa, the {name} by {brand} celebrates the artistry of indigenous craftsmanship. Premium fabrics meet time-honoured construction techniques to create a piece that honours heritage while embracing modern elegance.",
    "The {name} from {brand} is a celebration of African sartorial heritage. Crafted from exceptional materials with hand-finished details, this piece bridges the legacy of traditional wear with the demands of contemporary luxury.",
  ],
  Footwear: [
    "The {name} by {brand} is engineered for both distinction and comfort. Premium materials are shaped by master craftsmen into a silhouette that elevates every step, from boardroom to evening engagements.",
    "Precision-crafted from the finest materials, the {name} from {brand} represents the pinnacle of luxury footwear. Each pair is a testament to generations of shoemaking expertise and uncompromising quality.",
  ],
  Jewelry: [
    "The {name} by {brand} is a statement of refined luxury. Expertly crafted using precious materials, this piece draws on Africa's rich tradition of adornment to create an accessory that transcends trends.",
    "An exquisite expression of heritage craftsmanship, the {name} from {brand} transforms precious materials into wearable art. Each detail reflects a deep appreciation for the goldsmithing traditions of the continent.",
  ],
  Bags: [
    "The {name} by {brand} combines architectural form with supple luxury materials. Designed for the modern connoisseur, this bag balances effortless style with practical sophistication for every occasion.",
    "Crafted from premium materials with impeccable attention to detail, the {name} from {brand} is the hallmark of understated luxury. A versatile companion for those who appreciate the finer things.",
  ],
  "Coats & Jackets": [
    "Masterfully tailored from premium fabrics, the {name} by {brand} embodies the pinnacle of contemporary luxury outerwear. The structured silhouette and refined details make it an essential piece for the discerning wardrobe.",
    "The {name} from {brand} represents the intersection of heritage tailoring and modern design. Constructed from the finest materials with expert precision, this outerwear piece commands attention in any setting.",
  ],
  Dresses: [
    "The {name} by {brand} is a study in feminine elegance. Luxurious fabrics drape with effortless grace, creating a silhouette that celebrates the beauty of African-inspired design with international sophistication.",
    "Exquisitely crafted with attention to every detail, the {name} from {brand} embodies the artistry of luxury fashion. From fabric selection to final stitch, this dress is designed to make an unforgettable impression.",
  ],
  default: [
    "The {name} by {brand} represents the finest in contemporary African luxury fashion. Crafted from premium materials with meticulous attention to detail, this piece embodies the heritage and sophistication that define The Heritage Edit collection.",
    "Discover the {name} from {brand} — a masterful blend of traditional craftsmanship and modern luxury. Every detail has been considered to deliver an exceptional piece worthy of the most discerning taste.",
  ],
};

function generateCaption(name: string, brand: string, category: string): string {
  const templates = CATEGORY_TEMPLATES[category] || CATEGORY_TEMPLATES.default;
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template.replace(/\{name\}/g, name).replace(/\{brand\}/g, brand);
}

export async function POST(request: NextRequest) {
  try {
    const { name, brandName, categoryName, priceCents } = await request.json();

    if (!name || !brandName || !categoryName) {
      return NextResponse.json(
        { error: "name, brandName, and categoryName are required" },
        { status: 400 }
      );
    }

    const description = generateCaption(name, brandName, categoryName);

    const shortDescription = `${brandName} ${name} — premium ${categoryName.toLowerCase()} from The Heritage Edit's curated collection.`;

    const seoTitle = `${brandName} ${name} | The Heritage Edit`;

    const priceStr = priceCents
      ? ` Starting from ₦${(priceCents / 100).toLocaleString()}.`
      : "";
    const seoDescription = `Shop the ${brandName} ${name} at The Heritage Edit. Premium African luxury ${categoryName.toLowerCase()} with worldwide shipping.${priceStr}`;

    return NextResponse.json({
      description,
      shortDescription,
      seoTitle,
      seoDescription,
    });
  } catch (err) {
    console.error("Auto-caption error:", err);
    return NextResponse.json({ error: "Failed to generate caption" }, { status: 500 });
  }
}
