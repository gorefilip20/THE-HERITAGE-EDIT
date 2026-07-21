import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { sendOrderConfirmationSms } from "@/lib/sms";

export async function POST(request: NextRequest) {
  try {
    const { amount, email, phone, orderId } = await request.json();

    const flutterwaveKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!flutterwaveKey) {
      return NextResponse.json(
        { error: "Flutterwave not configured" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${flutterwaveKey}`,
      },
      body: JSON.stringify({
        tx_ref: `order_${orderId || Date.now()}`,
        amount: amount / 100,
        currency: "NGN",
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
        customer: {
          email,
          phone_number: phone,
        },
        customizations: {
          title: "The Heritage Edit",
          description: "Premium African Fashion",
          logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
        },
      }),
    });

    const data = await response.json();

    if (data.status === "success") {
      return NextResponse.json({
        success: true,
        link: data.data.link,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Flutterwave error:", error);
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const flutterwaveHash = request.headers.get("verif-hash");
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;

    if (flutterwaveHash !== secretHash) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { status, txRef, amount } = body;

    if (status === "successful") {
      console.log(`Payment successful for order ${txRef}: ₦${amount}`);
      const orderId = txRef.replace(/^order_/, "");

      const order = await prisma.order.findFirst({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  brand: { select: { name: true } },
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
              variant: { select: { size: true } },
            },
          },
          shippingAddress: true,
        },
      });

      if (!order) {
        console.error(`[Flutterwave Webhook] Order not found: ${orderId}`);
        return NextResponse.json({ success: true });
      }

      if (order.paymentStatus === "CAPTURED") {
        return NextResponse.json({ success: true });
      }

      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "CAPTURED",
            status: "CONFIRMED",
          },
        });

        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stockCount: { decrement: item.quantity } },
            });
          }
        }
      });

      const customerEmail = order.guestEmail;
      if (customerEmail) {
        const emailItems = order.items.map((item) => ({
          name: item.product.name,
          brand: item.product.brand.name,
          size: item.variant?.size ?? "One Size",
          quantity: item.quantity,
          priceCents: item.totalCents,
          imageUrl: item.product.images[0]?.url ?? "",
        }));

        const addr = order.shippingAddress;
        await sendOrderConfirmationEmail({
          to: customerEmail,
          orderNumber: order.orderNumber,
          items: emailItems,
          subtotalCents: order.subtotalCents,
          shippingCents: order.shippingCents,
          taxCents: order.taxCents,
          dutyCents: order.dutyCents,
          totalCents: order.totalCents,
          currency: order.currency,
          shippingAddress: addr ? {
            name: `${addr.firstName} ${addr.lastName}`,
            line1: addr.line1,
            line2: addr.line2 ?? undefined,
            city: addr.city,
            state: addr.state ?? undefined,
            postalCode: addr.postalCode,
            country: addr.country,
          } : undefined,
          shippingMethod: order.shippingMethod ?? "Standard",
        });
      }

      const phone = order.shippingAddress?.phone;
      if (phone) {
        const totalFormatted = new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: order.currency || "NGN",
          minimumFractionDigits: 0,
        }).format(order.totalCents / 100);
        await sendOrderConfirmationSms(phone, order.orderNumber, totalFormatted);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
