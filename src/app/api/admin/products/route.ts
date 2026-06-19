import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "25")));
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const brand = searchParams.get("brand");
    const sort = searchParams.get("sort") ?? "newest";

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }
    if (brand) {
      where.brand = { slug: brand };
    }
    if (search) {
      const sanitized = search.trim().slice(0, 200);
      if (sanitized.length > 0) {
        where.OR = [
          { name: { contains: sanitized, mode: "insensitive" } },
          { sku: { contains: sanitized, mode: "insensitive" } },
          { brand: { name: { contains: sanitized, mode: "insensitive" } } },
        ];
      }
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "price_high":
        orderBy = { basePriceCents: "desc" };
        break;
      case "price_low":
        orderBy = { basePriceCents: "asc" };
        break;
    }

    const [products, total, statusCounts] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          brand: { select: { id: true, name: true, slug: true } },
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          variants: {
            select: { id: true, size: true, stockCount: true },
            orderBy: { size: "asc" },
          },
          heritage: {
            select: { id: true, isApproved: true, generatedAt: true },
          },
        },
      }),
      prisma.product.count({ where }),
      prisma.product.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    const counts: Record<string, number> = {};
    for (const s of statusCounts) {
      counts[s.status] = s._count.id;
    }

    return NextResponse.json({
      data: products.map((p) => ({
        ...p,
        totalStock: p.variants.reduce((sum, v) => sum + v.stockCount, 0),
        variantCount: p.variants.length,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      statusCounts: counts,
    });
  } catch (err) {
    console.error("Admin products listing error:", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
