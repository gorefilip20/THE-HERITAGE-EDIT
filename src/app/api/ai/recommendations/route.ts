import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { occasion, bodyType, colorPreference, budget, style } = await request.json();

    // Build filter parameters based on style profile
    const params = new URLSearchParams();
    params.set("pageSize", "12");

    // Map occasion to categories
    const occasionMap: Record<string, string> = {
      Casual: "casual-wear",
      Business: "tailored-suits",
      Party: "ankara-dresses",
      Wedding: "wedding-ceremony",
      Resort: "resort-collection",
      "Daily Wear": "everyday",
    };

    if (occasionMap[occasion]) {
      params.set("category", occasionMap[occasion]);
    }

    // Map color preference to tags
    const colorMap: Record<string, string> = {
      Vibrant: "vibrant-colors",
      Earthy: "earthy-tones",
      Jewel: "jewel-tones",
      Neutral: "neutral",
      Pastels: "pastel",
      Bold: "bold-patterns",
    };

    if (colorMap[colorPreference]) {
      params.set("tag", colorMap[colorPreference]);
    }

    // Fetch products from database
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/products?${params.toString()}`
    );

    const data = await response.json();
    const products = data.data || [];

    // In production, you would:
    // 1. Call OpenAI/Anthropic API with the style profile
    // 2. Get AI-generated styling advice
    // 3. Score products based on AI recommendations
    // 4. Return top-scored products with explanations

    const recommendations = products.slice(0, 12).map((product: any) => ({
      ...product,
      aiScore: Math.random() * 100,
      reason: `Perfect for ${occasion} occasions with ${style} style`,
    }));

    return NextResponse.json({
      success: true,
      products: recommendations,
      advice: `Based on your ${bodyType} body type and preference for ${colorPreference} colors, we've curated pieces that will flatter your silhouette and match your ${style} aesthetic.`,
    });
  } catch (error) {
    console.error("AI recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
