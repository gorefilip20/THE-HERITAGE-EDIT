import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeRedisGet, safeRedisSet, safeRedisKeys, safeRedisDel } from "@/lib/redis";
import { createProductSchema } from "@/lib/validators";
import { slugify, generateItemCode } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";

const PRODUCT_CACHE_PREFIX = "products:";
const PRODUCT_CACHE_TTL = 60 * 5; // 5 minutes

function buildCacheKey(params: URLSearchParams): string {
  const sorted = Array.from(params.entries())
    .filter(([, v]) => v !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  return `${PRODUCT_CACHE_PREFIX}${new URLSearchParams(sorted).toString()}`;
}

async function getCachedProducts(key: string) {
  const cached = await safeRedisGet(key);
  if (cached) {
    try { return JSON.parse(cached); } catch { /* corrupted */ }
  }
  return null;
}

async function setCachedProducts(key: string, data: unknown) {
  await safeRedisSet(key, JSON.stringify(data), PRODUCT_CACHE_TTL);
}

export async function GET(request: NextRequest) {
  const start = performance.now();
  const { searchParams } = request.nextUrl;

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(
    48,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "24")),
  );
  const brands = searchParams.getAll("brand");
  const category = searchParams.get("category");
  const department = searchParams.get("department");
  const clothingType = searchParams.get("clothingType");
  const collection = searchParams.get("collection");
  const gender = searchParams.get("gender");
  const tag = searchParams.get("tag");
  const discount = searchParams.get("discount");
  const sizes = searchParams.getAll("size");
  const colors = searchParams.getAll("color");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort");
  const search = searchParams.get("search");
  const featured = searchParams.get("featured");

  /* ── Cache lookup ── */
  const cacheKey = buildCacheKey(searchParams);
  const cached = await getCachedProducts(cacheKey);
  if (cached) {
    const elapsed = (performance.now() - start).toFixed(1);
    return NextResponse.json(cached, {
      headers: {
        "X-Cache": "HIT",
        "X-Response-Time": `${elapsed}ms`,
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  }

  /* ── Build Prisma where clause ── */
  const where: Record<string, unknown> = { status: "PUBLISHED" };

  if (brands.length > 0) {
    where.brand = { slug: { in: brands } };
  }
  if (category) {
    where.category = { slug: category };
  }
  if (department) {
    const legacyCategoryMap: Record<string, string[]> = {
      Women: ["dresses", "ankara-dresses", "kente-wear", "dashiki-tops", "aso-oke", "tops-blouses", "coats-jackets", "trousers-shorts", "knitwear", "shoes"],
      Men: ["agbada-robes", "suits-tailoring", "tailored-suits", "senator-wear", "native-wear", "dashiki-tops", "outerwear", "shoes"],
      Kids: ["girls", "boys", "ankara-dresses", "kente-wear", "dashiki", "agbada", "baby", "baby-sets", "baby-gifts", "shoes"],
      Accessories: ["bags", "bags-clutches", "jewelry", "accessories", "belts", "watches", "shoes", "shoes-sandals"],
      Life: ["textiles", "wall-art", "fragrance", "tableware", "skincare", "body-care", "hair-care", "gifts"],
    };
    const legacyCategories = legacyCategoryMap[department];
    if (legacyCategories) {
      where.OR = [
        { department },
        { department: "Uncategorized", category: { slug: { in: legacyCategories } } },
      ];
    } else {
      where.department = department;
    }
  }
  if (clothingType) {
    where.clothingType = clothingType;
  }
  if (collection) {
    const departmentByCollection: Record<string, string> = {
      women: "Women",
      men: "Men",
      kids: "Kids",
      accessories: "Accessories",
      life: "Life",
    };
    const departmentForCollection = departmentByCollection[collection.toLowerCase()];
    if (departmentForCollection) where.department = departmentForCollection;
    else where.collections = { some: { collection: { slug: collection } } };
  }
  if (gender) {
    const departmentByGender: Record<string, string> = { women: "Women", men: "Men", kids: "Kids" };
    if (departmentByGender[gender.toLowerCase()]) where.department = departmentByGender[gender.toLowerCase()];
  }
  if (tag === "sale") {
    where.salePriceCents = { not: null };
  }
  // The current sale page uses discount tiers as a merchandising filter. The
  // persisted sale-price condition above keeps the result truthful even when
  // the tier is only a presentation label.
  void discount;
  if (sizes.length > 0 || colors.length > 0) {
    const variantWhere: Record<string, unknown> = {};
    if (sizes.length > 0) variantWhere.size = { in: sizes };
    if (colors.length > 0) variantWhere.color = { in: colors };
    where.variants = { some: variantWhere };
  }
  if (minPrice || maxPrice) {
    where.basePriceCents = {};
    if (minPrice)
      (where.basePriceCents as Record<string, number>).gte =
        parseInt(minPrice) * 100;
    if (maxPrice)
      (where.basePriceCents as Record<string, number>).lte =
        parseInt(maxPrice) * 100;
  }
  if (search) {
    const sanitizedSearch = search.trim().slice(0, 200);
    if (sanitizedSearch.length > 0) {
      where.OR = [
        { name: { contains: sanitizedSearch, mode: "insensitive" } },
        { brand: { name: { contains: sanitizedSearch, mode: "insensitive" } } },
        {
          description: {
            contains: sanitizedSearch,
            mode: "insensitive",
          },
        },
      ];
    }
  }
  if (featured === "true") {
    where.isFeatured = true;
  }

  /* ── Sort ── */
  let orderBy: Record<string, string> = { createdAt: "desc" };
  switch (sort) {
    case "price_asc":
      orderBy = { basePriceCents: "asc" };
      break;
    case "price_desc":
      orderBy = { basePriceCents: "desc" };
      break;
    case "name_asc":
      orderBy = { name: "asc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
  }

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          brand: { select: { id: true, name: true, slug: true } },
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 2 },
          variants: {
            select: {
              id: true,
              size: true,
              color: true,
              colorHex: true,
              stockCount: true,
              priceDeltaCents: true,
            },
            orderBy: { size: "asc" },
          },
          heritage: {
            select: { id: true, isApproved: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const responseData = {
      data: products,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    await setCachedProducts(cacheKey, responseData);

    const elapsed = (performance.now() - start).toFixed(1);
    return NextResponse.json(responseData, {
      headers: {
        "X-Cache": "MISS",
        "X-Response-Time": `${elapsed}ms`,
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("Product listing error:", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const input = parsed.data;

    let brand = input.brandId
      ? await prisma.brand.findUnique({ where: { id: input.brandId } })
      : null;

    if (input.brandId && !brand) {
      brand = await prisma.brand.findFirst({
        where: {
          OR: [
            { name: { equals: input.brandId, mode: "insensitive" } },
            { slug: slugify(input.brandId) },
          ],
        },
      });

      if (!brand) {
        const brandName = input.brandId.trim();
        const brandSlug = slugify(brandName);
        brand = await prisma.brand.create({
          data: { name: brandName, slug: brandSlug },
        });
      }
    }

    let category = await prisma.category.findUnique({ where: { id: input.categoryId } });

    if (!category) {
      category = await prisma.category.findFirst({
        where: {
          OR: [
            { name: { equals: input.categoryId, mode: "insensitive" } },
            { slug: slugify(input.categoryId) },
          ],
        },
      });

      if (!category) {
        const catName = input.categoryId.trim();
        const catSlug = slugify(catName);
        category = await prisma.category.create({
          data: { name: catName, slug: catSlug },
        });
      }
    }

    if (!brand) {
      brand = await prisma.brand.upsert({
        where: { slug: "the-heritage-edit" },
        update: {},
        create: { name: "The Heritage Edit", slug: "the-heritage-edit" },
      });
    }

    let slug = slugify(`${brand.name}-${input.name}`);

    const existingSlug = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existingSlug) {
      const suffix = Date.now().toString(36).slice(-4);
      slug = `${slug}-${suffix}`;
    }

    const sku = input.sku?.trim() || generateItemCode();

    const product = await prisma.product.create({
      data: {
        sku,
        name: input.name.trim(),
        slug,
        description: input.description?.trim() ?? null,
        brandId: brand.id,
        categoryId: category.id,
        department: input.department,
        clothingType: input.clothingType,
        basePriceCents: input.basePriceCents,
        salePriceCents: input.salePriceCents ?? null,
        currency: input.currency,
        status: input.publishImmediately ? "PUBLISHED" : "DRAFT",
        images: input.imageUrls
          ? {
              create: input.imageUrls.map((url, idx) => ({
                url,
                sortOrder: idx,
                isPrimary: idx === 0,
              })),
            }
          : undefined,
        variants: input.variants
          ? {
              create: input.variants.map((v) => ({
                size: v.size,
                color: v.color ?? null,
                colorHex: v.colorHex ?? null,
                stockCount: v.stockCount,
                priceDeltaCents: v.priceDeltaCents,
              })),
            }
          : undefined,
      },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { size: "asc" } },
      },
    });

    /* Invalidate product list cache on new product */
    const keys = await safeRedisKeys(`${PRODUCT_CACHE_PREFIX}*`);
    if (keys.length > 0) await safeRedisDel(...keys);

    /* Product persistence and storefront visibility must not depend on the
       external AI provider. The admin UI requests heritage generation separately. */
    return NextResponse.json(
      { ...product, status: product.status, heritage: null },
      { status: 201 },
    );
  } catch (err) {
    console.error("Product creation error:", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
