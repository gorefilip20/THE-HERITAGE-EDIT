import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { path, referrer, sessionId } = await request.json();

    if (!path || !sessionId) {
      return NextResponse.json({ error: "path and sessionId required" }, { status: 400 });
    }

    const country =
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-vercel-ip-country") ||
      null;

    const userAgent = request.headers.get("user-agent")?.slice(0, 256) || null;

    const url = new URL(request.url);
    const utmSource = url.searchParams.get("utm_source");
    const utmMedium = url.searchParams.get("utm_medium");
    const utmCampaign = url.searchParams.get("utm_campaign");

    await prisma.pageView.create({
      data: {
        sessionId: sessionId.slice(0, 64),
        path: path.slice(0, 500),
        referrer: referrer?.slice(0, 500) || null,
        utmSource,
        utmMedium,
        utmCampaign,
        userAgent,
        country,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PageView tracking error:", err);
    return NextResponse.json({ ok: true });
  }
}
