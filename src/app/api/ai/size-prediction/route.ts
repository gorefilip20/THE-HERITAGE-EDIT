import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { height, weight, chest, waist, hips, shoeSize, previousSizes } = await request.json();

    // Calculate BMI and body metrics
    const heightM = parseInt(height) / 100;
    const weightNum = parseInt(weight);
    const bmi = weightNum / (heightM * heightM);

    // Simple size prediction logic (in production, use ML model)
    let recommendedSize = "M";
    let confidence = 0.85;

    if (previousSizes) {
      // Use previous sizes as primary indicator
      const sizes = previousSizes.split(",").map((s: string) => s.trim());
      recommendedSize = sizes[0] || "M";
      confidence = 0.95;
    } else {
      // Use height and weight to predict
      if (height && weight) {
        const heightNum = parseInt(height);
        if (heightNum < 160) {
          recommendedSize = "XS";
        } else if (heightNum < 170) {
          recommendedSize = "S";
        } else if (heightNum < 180) {
          recommendedSize = "M";
        } else if (heightNum < 190) {
          recommendedSize = "L";
        } else {
          recommendedSize = "XL";
        }

        // Adjust based on weight
        if (bmi > 25) {
          const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
          const currentIdx = sizes.indexOf(recommendedSize);
          if (currentIdx < sizes.length - 1) {
            recommendedSize = sizes[currentIdx + 1];
          }
        }
      }
    }

    // Generate alternatives
    const allSizes = ["XS", "S", "M", "L", "XL", "XXL"];
    const currentIdx = allSizes.indexOf(recommendedSize);
    const alternatives = [];

    if (currentIdx > 0) alternatives.push(allSizes[currentIdx - 1]);
    if (currentIdx < allSizes.length - 1) alternatives.push(allSizes[currentIdx + 1]);

    // Generate tips
    const tips = [
      "African fashion tends to be more generous in fit. If between sizes, consider sizing down.",
      "Always check the product description for specific brand sizing information.",
      "Our return policy allows 30 days for exchanges if the size doesn't fit perfectly.",
      "Consider the fabric type: traditional Ankara is typically more structured than modern blends.",
      "For tailored pieces, custom sizing is available upon request.",
    ];

    return NextResponse.json({
      success: true,
      prediction: {
        recommended: recommendedSize,
        alternatives,
        confidence: Math.min(confidence * 100, 99),
        tips,
      },
    });
  } catch (error) {
    console.error("Size prediction error:", error);
    return NextResponse.json(
      { error: "Failed to generate size prediction" },
      { status: 500 }
    );
  }
}
