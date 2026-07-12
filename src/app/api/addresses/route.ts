import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    });

    return NextResponse.json({ data: addresses, total: addresses.length });
  } catch (err) {
    console.error("Address fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

const addressSchema = z.object({
  label: z.string().min(1).max(50).default("Home"),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).nullable().optional(),
  city: z.string().min(1).max(100),
  state: z.string().max(100).nullable().optional(),
  postalCode: z.string().min(1).max(20),
  country: z.string().min(1).max(100),
  phone: z.string().max(20).nullable().optional(),
  isDefault: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    // If this is the user's first address, or explicitly default, make it default
    const count = await prisma.address.count({ where: { userId: user.id } });
    const makeDefault = parsed.data.isDefault || count === 0;

    if (makeDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: parsed.data.label,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        line1: parsed.data.line1,
        line2: parsed.data.line2 ?? null,
        city: parsed.data.city,
        state: parsed.data.state ?? null,
        postalCode: parsed.data.postalCode,
        country: parsed.data.country,
        phone: parsed.data.phone ?? null,
        isDefault: makeDefault,
      },
    });

    return NextResponse.json({ data: address }, { status: 201 });
  } catch (err) {
    console.error("Address create error:", err);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id query param is required" }, { status: 400 });
    }

    // Only allow removing the caller's own address
    await prisma.address.deleteMany({ where: { id, userId: user.id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Address delete error:", err);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
