import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? "fallback-dev-secret-change-me",
);

const ADMIN_PATHS = ["/admin", "/api/admin"];
const AUTH_API_PATHS = ["/api/auth"];
const PUBLIC_API_PATHS = [
  "/api/products",
  "/api/checkout",
  "/api/webhooks",
];

const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 100;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  return ip;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

async function verifyAuth(
  token: string,
): Promise<{ userId: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  if (pathname.startsWith("/api/")) {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }
  }

  if (pathname.startsWith("/api/webhooks/")) {
    return response;
  }

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));

  if (isAdminPath) {
    const token = request.cookies.get("heritage-auth")?.value;

    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 },
        );
      }
      return NextResponse.redirect(new URL("/auth/login?redirect=/admin", request.url));
    }

    const payload = await verifyAuth(token);

    if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 },
        );
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/products/:path*",
    "/api/checkout/:path*",
    "/api/auth/:path*",
    "/api/cart/:path*",
    "/api/orders/:path*",
    "/api/wishlist/:path*",
    "/api/webhooks/:path*",
  ],
};
