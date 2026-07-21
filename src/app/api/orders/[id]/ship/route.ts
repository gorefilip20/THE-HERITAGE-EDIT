import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendShippingNotificationEmail } from "@/lib/email";
import { sendShippingNotificationSms } from "@/lib/sms";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { trackingNumber, carrier, trackingUrl, estimatedDelivery } =
      await request.json();

    if (!trackingNumber || !carrier) {
      return NextResponse.json(
        { error: "trackingNumber and carrier are required" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: { brand: { select: { name: true } } },
            },
          },
        },
        shippingAddress: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await prisma.order.update({
      where: { id },
      data: {
        status: "SHIPPED",
        trackingNumber,
        trackingUrl: trackingUrl ?? null,
        shippingMethod: carrier,
      },
    });

    const email = order.guestEmail;
    if (email) {
      await sendShippingNotificationEmail({
        to: email,
        orderNumber: order.orderNumber,
        trackingNumber,
        carrier,
        trackingUrl,
        estimatedDelivery,
        items: order.items.map((item) => ({
          name: item.product.name,
          brand: item.product.brand.name,
        })),
      });
    }

    const phone = order.shippingAddress?.phone;
    if (phone) {
      await sendShippingNotificationSms(phone, order.orderNumber, carrier, trackingNumber);
    }

    return NextResponse.json({
      success: true,
      message: `Order ${order.orderNumber} marked as shipped`,
    });
  } catch (error) {
    console.error("Ship order error:", error);
    return NextResponse.json(
      { error: "Failed to process shipping" },
      { status: 500 },
    );
  }
}
