import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  basePriceCents: z.number().int().positive().optional(),
  salePriceCents: z.number().int().positive().nullable().optional(),
  status: z.enum(["DRAFT", "AI_PENDING", "AI_REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
  isFeatured: z.boolean().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        size: z.string(),
        color: z.string().nullable().optional(),
        stockCount: z.number().int().min(0),
        priceDeltaCents: z.number().int().optional(),
      }),
    )
    .optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { size: "asc" } },
        heritage: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin product GET error:", err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const { variants, ...productData } = parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: productData,
      });

      if (variants) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        if (variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map((v) => ({
              productId: id,
              size: v.size,
              color: v.color ?? null,
              stockCount: v.stockCount,
              priceDeltaCents: v.priceDeltaCents ?? 0,
            })),
          });
        }
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          brand: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          images: { orderBy: { sortOrder: "asc" } },
          variants: { orderBy: { size: "asc" } },
          heritage: true,
        },
      });
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin product PUT error:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
