import { NextRequest, NextResponse } from "next/server";
import { watermarkDataUrl } from "@/lib/watermark";

export async function POST(request: NextRequest) {
  try {
    const { imageUrls } = await request.json();

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "imageUrls array required" },
        { status: 400 },
      );
    }

    const watermarked = await Promise.all(
      imageUrls.map((url: string) =>
        url.startsWith("data:image/")
          ? watermarkDataUrl(url)
          : Promise.resolve(url),
      ),
    );

    return NextResponse.json({ watermarked });
  } catch (error) {
    console.error("Watermark error:", error);
    return NextResponse.json(
      { error: "Failed to apply watermark" },
      { status: 500 },
    );
  }
}
