import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();
    const identifier = params.id;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: identifier }, { orderNumber: identifier }],
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: { where: { isPrimary: true }, take: 1 },
                brand: { select: { name: true } },
              },
            },
            variant: { select: { size: true, color: true } },
          },
        },
        shippingAddress: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isAdmin =
      user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
    const isOwner = order.userId === user?.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Not authorized to view this order" },
        { status: 403 },
      );
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error("Order fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();

    const allowedStatusTransitions: Record<string, string[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED"],
      DELIVERED: ["REFUNDED"],
    };

    if (body.status) {
      const order = await prisma.order.findUnique({
        where: { id: params.id },
        select: { status: true },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 },
        );
      }

      const allowed = allowedStatusTransitions[order.status];
      if (!allowed || !allowed.includes(body.status)) {
        return NextResponse.json(
          {
            error: `Cannot transition from ${order.status} to ${body.status}`,
          },
          { status: 400 },
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (body.trackingNumber) updateData.trackingNumber = body.trackingNumber;
    if (body.trackingUrl) updateData.trackingUrl = body.trackingUrl;
    if (body.notes) updateData.notes = body.notes;

    if (body.status === "CANCELLED") {
      const order = await prisma.order.findUnique({
        where: { id: params.id },
        include: { items: true },
      });

      if (order) {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: params.id },
            data: updateData,
          });

          for (const item of order.items) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stockCount: { increment: item.quantity } },
              });
            }
          }
        });

        const updated = await prisma.order.findUnique({
          where: { id: params.id },
          include: { items: true, shippingAddress: true },
        });

        return NextResponse.json(updated);
      }
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: { items: true, shippingAddress: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Order update error:", err);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
