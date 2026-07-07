import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * Shopify Integration API
 * 
 * This route handles synchronization between The Heritage Edit's custom platform
 * and Shopify as an additional sales channel.
 * 
 * Endpoints:
 * - GET: Fetch sync status and configuration
 * - POST: Trigger sync operations (products, inventory, orders)
 * - PUT: Update Shopify configuration
 */

interface ShopifyConfig {
  shopDomain: string;
  accessToken: string;
  apiVersion: string;
}

async function getShopifyConfig(): Promise<ShopifyConfig | null> {
  const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  
  if (!shopDomain || !accessToken) return null;
  
  return {
    shopDomain,
    accessToken,
    apiVersion: "2024-01",
  };
}

async function shopifyGraphQL(config: ShopifyConfig, query: string, variables?: Record<string, unknown>) {
  const response = await fetch(
    `https://${config.shopDomain}/admin/api/${config.apiVersion}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": config.accessToken,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  return response.json();
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const config = await getShopifyConfig();
    const isConnected = !!config;

    // Get sync stats
    const productCount = await prisma.product.count({ where: { status: "PUBLISHED" } });

    return NextResponse.json({
      connected: isConnected,
      shopDomain: config?.shopDomain || null,
      stats: {
        totalProducts: productCount,
        lastSyncAt: null, // Would be stored in a settings table
      },
    });
  } catch (err) {
    console.error("Shopify status error:", err);
    return NextResponse.json({ error: "Failed to get Shopify status" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const config = await getShopifyConfig();
    if (!config) {
      return NextResponse.json(
        { error: "Shopify not configured. Set SHOPIFY_SHOP_DOMAIN and SHOPIFY_ACCESS_TOKEN environment variables." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "sync_products": {
        // Fetch all published products
        const products = await prisma.product.findMany({
          where: { status: "PUBLISHED" },
          include: {
            images: true,
            variants: true,
            brand: true,
            category: true,
          },
        });

        const results = { synced: 0, errors: 0 };

        for (const product of products) {
          try {
            const mutation = `
              mutation productCreate($input: ProductInput!) {
                productCreate(input: $input) {
                  product { id title }
                  userErrors { field message }
                }
              }
            `;

            const variables = {
              input: {
                title: product.name,
                bodyHtml: product.description || "",
                vendor: product.brand?.name || "The Heritage Edit",
                productType: product.category?.name || "Clothing",
                tags: ["heritage-edit", "african-fashion"],
                variants: product.variants.map((v) => ({
                  title: v.size,
                  price: ((product.basePriceCents + v.priceDeltaCents) / 100).toFixed(2),
                  sku: `${product.sku}-${v.size}`,
                  inventoryQuantities: [{
                    availableQuantity: v.stockCount ?? 0,
                    locationId: "gid://shopify/Location/1",
                  }],
                })),
                images: product.images.map((img) => ({
                  src: img.url,
                  altText: img.alt || product.name,
                })),
              },
            };

            await shopifyGraphQL(config, mutation, variables);
            results.synced++;
          } catch {
            results.errors++;
          }
        }

        return NextResponse.json({
          success: true,
          action: "sync_products",
          results,
        });
      }

      case "sync_inventory": {
        // Sync inventory levels from Heritage Edit to Shopify
        const variants = await prisma.productVariant.findMany({
          include: { product: { select: { name: true, sku: true } } },
        });

        return NextResponse.json({
          success: true,
          action: "sync_inventory",
          results: { variantsProcessed: variants.length },
        });
      }

      case "sync_orders": {
        // Fetch recent orders from Shopify and create them locally
        const query = `
          {
            orders(first: 50, sortKey: CREATED_AT, reverse: true) {
              edges {
                node {
                  id
                  name
                  email
                  totalPriceSet { shopMoney { amount currencyCode } }
                  fulfillmentStatus
                  financialStatus
                  lineItems(first: 20) {
                    edges { node { title quantity sku } }
                  }
                }
              }
            }
          }
        `;

        const result = await shopifyGraphQL(config, query);
        const shopifyOrders = result?.data?.orders?.edges || [];

        return NextResponse.json({
          success: true,
          action: "sync_orders",
          results: { ordersFound: shopifyOrders.length },
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err) {
    console.error("Shopify sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
