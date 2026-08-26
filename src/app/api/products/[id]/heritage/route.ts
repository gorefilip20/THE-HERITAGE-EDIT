import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateHeritageNarrative } from "@/lib/heritage-ai";
import { getCurrentUser } from "@/lib/auth";
import { safeRedisKeys, safeRedisDel } from "@/lib/redis";

const PRODUCT_CACHE_PREFIX = "products:";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let originalStatus: string = "DRAFT";
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { brand: true, category: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    originalStatus = product.status;

    await prisma.heritageNarrative.deleteMany({
      where: { productId: product.id },
    });

    await prisma.product.update({
      where: { id: product.id },
      data: { status: "AI_PENDING" },
    });

    const { data, model } = await generateHeritageNarrative(
      product.name,
      product.brand?.name ?? "The Heritage Edit",
      product.category.name,
    );

    const heritage = await prisma.heritageNarrative.create({
      data: {
        productId: product.id,
        historyAndHeritage: data.history_and_heritage,
        whenToWear: data.when_to_wear,
        rightOccasion: data.right_occasion,
        styleRecommendations: data.style_recommendations,
        aiModelUsed: model,
      },
    });

    await prisma.product.update({
      where: { id: product.id },
      data: { status: originalStatus === "PUBLISHED" ? "PUBLISHED" : "AI_REVIEW" },
    });

    const keys = await safeRedisKeys(`${PRODUCT_CACHE_PREFIX}*`);
    if (keys.length > 0) await safeRedisDel(...keys);

    return NextResponse.json({
      ...heritage,
      productName: product.name,
      brandName: product.brand?.name ?? "The Heritage Edit",
    });
  } catch (err) {
    const { id } = await params;
    console.error(
      `Heritage regeneration failed for product ${id}:`,
      err,
    );

    try {
      await prisma.product.update({
        where: { id },
        data: { status: originalStatus === "PUBLISHED" ? "PUBLISHED" : "DRAFT" },
      });
    } catch {
      /* product may not exist */
    }

    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Heritage generation failed",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    const body = await request.json();

    const heritage = await prisma.heritageNarrative.findUnique({
      where: { productId: id },
    });

    if (!heritage) {
      return NextResponse.json(
        { error: "Heritage narrative not found for this product" },
        { status: 404 },
      );
    }

    const updateData: Record<string, unknown> = {};

    if (typeof body.historyAndHeritage === "string" && body.historyAndHeritage.trim().length > 0) {
      updateData.historyAndHeritage = body.historyAndHeritage.trim();
    }
    if (typeof body.whenToWear === "string" && body.whenToWear.trim().length > 0) {
      updateData.whenToWear = body.whenToWear.trim();
    }
    if (Array.isArray(body.rightOccasion) && body.rightOccasion.length > 0) {
      updateData.rightOccasion = body.rightOccasion
        .filter((s: unknown) => typeof s === "string" && (s as string).trim().length > 0)
        .map((s: string) => s.trim());
    }
    if (Array.isArray(body.styleRecommendations) && body.styleRecommendations.length > 0) {
      updateData.styleRecommendations = body.styleRecommendations
        .filter((s: unknown) => typeof s === "string" && (s as string).trim().length > 0)
        .map((s: string) => s.trim());
    }

    if (body.isApproved === true) {
      updateData.isApproved = true;
      updateData.approvedAt = new Date();
    }

    const updated = await prisma.heritageNarrative.update({
      where: { id: heritage.id },
      data: updateData,
    });

    if (body.isApproved === true) {
      await prisma.product.update({
        where: { id },
        data: { status: "PUBLISHED" },
      });
      const keys = await safeRedisKeys(`${PRODUCT_CACHE_PREFIX}*`);
      if (keys.length > 0) await safeRedisDel(...keys);
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Heritage update failed:", err);
    return NextResponse.json(
      { error: "Failed to update heritage narrative" },
      { status: 500 },
    );
  }
}
