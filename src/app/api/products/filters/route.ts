import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeRedisGet, safeRedisSet } from "@/lib/redis";

const FILTER_CACHE_PREFIX = "filters:";
const FILTER_CACHE_TTL = 60 * 15; // 15 minutes

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");

  if (!type || !["brands", "categories"].includes(type)) {
    return NextResponse.json(
      { error: "Query param 'type' must be 'brands' or 'categories'" },
      { status: 400 },
    );
  }

  const cacheKey = `${FILTER_CACHE_PREFIX}${type}`;

  const cached = await safeRedisGet(cacheKey);
  if (cached) {
    try {
      return NextResponse.json(JSON.parse(cached), {
        headers: {
          "X-Cache": "HIT",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      });
    } catch { /* corrupted cache entry */ }
  }

  try {
    if (type === "brands") {
      const brands = await prisma.brand.findMany({
        where: {
          products: { some: { status: "PUBLISHED" } },
        },
        select: {
          slug: true,
          name: true,
          _count: { select: { products: { where: { status: "PUBLISHED" } } } },
        },
        orderBy: { name: "asc" },
      });

      const result = brands.map((b) => ({
        slug: b.slug,
        name: b.name,
        _count: b._count.products,
      }));

      await safeRedisSet(cacheKey, JSON.stringify(result), FILTER_CACHE_TTL);

      return NextResponse.json(result, {
        headers: {
          "X-Cache": "MISS",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      });
    }

    const categories = await prisma.category.findMany({
      where: {
        products: { some: { status: "PUBLISHED" } },
      },
      select: {
        slug: true,
        name: true,
        _count: { select: { products: { where: { status: "PUBLISHED" } } } },
      },
      orderBy: { name: "asc" },
    });

    const result = categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      _count: c._count.products,
    }));

    await safeRedisSet(cacheKey, JSON.stringify(result), FILTER_CACHE_TTL);

    return NextResponse.json(result, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("Filter options error:", err);
    return NextResponse.json(
      { error: "Failed to fetch filter options" },
      { status: 500 },
    );
  }
}
