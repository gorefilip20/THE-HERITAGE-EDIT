import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name) {
      updateData.name = body.name.trim();
      updateData.slug = slugify(body.name);
    }
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;

    const collection = await prisma.collection.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(collection);
  } catch (err) {
    console.error("Update collection error:", err);
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await prisma.collection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete collection error:", err);
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}
