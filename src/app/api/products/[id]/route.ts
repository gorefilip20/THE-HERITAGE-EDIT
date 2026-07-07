import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeRedisGet, safeRedisSet } from "@/lib/redis";
import { getCurrentUser } from "@/lib/auth";

const PDP_CACHE_PREFIX = "pdp:";
const PDP_CACHE_TTL = 60 * 3; // 3 minutes

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const start = performance.now();

  try {
    const { id } = await params;
    const identifier = id;
    const cacheKey = `${PDP_CACHE_PREFIX}${identifier}`;

    const cached = await safeRedisGet(cacheKey);
    if (cached) {
      try {
        const elapsed = (performance.now() - start).toFixed(1);
        return NextResponse.json(JSON.parse(cached), {
          headers: {
            "X-Cache": "HIT",
            "X-Response-Time": `${elapsed}ms`,
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=180",
          },
        });
      } catch { /* corrupted cache entry */ }
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { size: "asc" } },
        heritage: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await safeRedisSet(cacheKey, JSON.stringify(product), PDP_CACHE_TTL);

    const elapsed = (performance.now() - start).toFixed(1);
    return NextResponse.json(product, {
      headers: {
        "X-Cache": "MISS",
        "X-Response-Time": `${elapsed}ms`,
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=180",
      },
    });
  } catch (err) {
    console.error("Product fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch product" },
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
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 },
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.basePriceCents !== undefined) updateData.basePriceCents = body.basePriceCents;
    if (body.salePriceCents !== undefined) updateData.salePriceCents = body.salePriceCents;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { size: "asc" } },
        heritage: true,
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error("Product update error:", err);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 },
      );
    }

    await prisma.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Product delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
