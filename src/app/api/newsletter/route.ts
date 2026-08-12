import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

/* ──────────────────────────────────────────────────────────
   NEWSLETTER SIGNUP — stores subscriber emails so the
   marketing list actually grows. Upserts to avoid errors
   on duplicate signups.
   ────────────────────────────────────────────────────────── */
const newsletterSchema = z.object({
  email: z.string().email(),
  source: z.string().max(50).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: {},
      create: {
        email: parsed.data.email,
        source: parsed.data.source ?? "homepage",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Newsletter subscription error:", err);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 },
    );
  }
}
