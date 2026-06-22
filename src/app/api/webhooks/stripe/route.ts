import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

/* ──────────────────────────────────────────────────────────
   INITIALIZATION
   ────────────────────────────────────────────────────────── */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-04-10",
});

const resend = new Resend(process.env.RESEND_API_KEY);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://heritageedit.com";
const FROM_ADDRESS = "THE HERITAGE EDIT <orders@heritageedit.com>";

/* ──────────────────────────────────────────────────────────
   WEBHOOK HANDLER — raw body required for signature verification
   ────────────────────────────────────────────────────────── */

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(
      "Stripe webhook signature verification failed:",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }

    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSucceeded(pi);
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailed(pi);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

/* ──────────────────────────────────────────────────────────
   checkout.session.completed
   1. Mark order as Paid
   2. Decrement inventory
   3. Store shipping address
   4. Set tracking placeholders
   5. Send VIP email receipt
   ────────────────────────────────────────────────────────── */

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.error("Checkout session missing orderId in metadata:", session.id);
    return;
  }

  try {
    const order = await prisma.order.findUnique({
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
            variant: true,
          },
        },
        shippingAddress: true,
      },
    });

    if (!order) {
      console.error("Order not found for checkout session:", orderId);
      return;
    }

    if (order.paymentStatus === "CAPTURED") return;

    /* ── Resolve shipping address from Stripe session ── */
    let shippingAddressId = order.shippingAddressId;
    const stripeShipping = session.shipping_details;
    const shippingCents =
      session.total_details?.amount_shipping ?? order.shippingCents;

    if (stripeShipping?.address && !shippingAddressId) {
      const addr = stripeShipping.address;
      const nameParts = (stripeShipping.name ?? "").split(" ");
      const firstName = nameParts[0] ?? "";
      const lastName = nameParts.slice(1).join(" ") || firstName;

      const address = await prisma.address.create({
        data: {
          userId: order.userId ?? undefined,
          firstName,
          lastName,
          line1: addr.line1 ?? "",
          line2: addr.line2 ?? undefined,
          city: addr.city ?? "",
          state: addr.state ?? undefined,
          postalCode: addr.postal_code ?? "",
          country: addr.country ?? "",
          phone: session.customer_details?.phone ?? undefined,
        },
      });
      shippingAddressId = address.id;
    }

    /* ── Atomic: update order + decrement inventory ── */
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CONFIRMED",
          paymentStatus: "CAPTURED",
          stripePaymentId: (session.payment_intent as string) ?? undefined,
          shippingAddressId,
          shippingCents,
          shippingMethod:
            session.shipping_cost?.shipping_rate
              ? "Express"
              : order.shippingMethod ?? "Standard",
          trackingNumber: null,
          trackingUrl: null,
          notes: "Processing — awaiting fulfillment",
          totalCents:
            order.subtotalCents + shippingCents + order.taxCents + order.dutyCents,
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

    /* ── Send VIP receipt email ── */
    const recipientEmail =
      order.guestEmail ?? session.customer_details?.email;

    if (recipientEmail) {
      const resolvedAddress = shippingAddressId
        ? await prisma.address.findUnique({ where: { id: shippingAddressId } })
        : null;

      await sendVIPReceipt({
        to: recipientEmail,
        orderNumber: order.orderNumber,
        items: order.items.map((item) => ({
          name: item.product.name,
          brand: item.product.brand.name,
          size: item.variant?.size ?? "One Size",
          color: item.variant?.color ?? null,
          quantity: item.quantity,
          priceCents: item.totalCents,
          imageUrl: item.product.images[0]?.url ?? "",
        })),
        subtotalCents: order.subtotalCents,
        shippingCents,
        taxCents: order.taxCents,
        dutyCents: order.dutyCents,
        totalCents:
          order.subtotalCents + shippingCents + order.taxCents + order.dutyCents,
        shippingAddress: resolvedAddress
          ? {
              name: `${resolvedAddress.firstName} ${resolvedAddress.lastName}`,
              line1: resolvedAddress.line1,
              line2: resolvedAddress.line2 ?? undefined,
              city: resolvedAddress.city,
              state: resolvedAddress.state ?? undefined,
              postalCode: resolvedAddress.postalCode,
              country: resolvedAddress.country,
            }
          : undefined,
        deliveryStatus: "Processing",
      });
    }
  } catch (err) {
    console.error("Error processing checkout.session.completed:", err);
    throw err;
  }
}

/* ──────────────────────────────────────────────────────────
   payment_intent.succeeded
   ────────────────────────────────────────────────────────── */

async function handlePaymentSucceeded(pi: Stripe.PaymentIntent) {
  const orderId = pi.metadata?.orderId;
  if (!orderId) return;

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "CAPTURED",
        stripePaymentId: pi.id,
      },
    });
  } catch (err) {
    console.error("Error handling payment_intent.succeeded:", err);
  }
}

/* ──────────────────────────────────────────────────────────
   payment_intent.payment_failed
   ────────────────────────────────────────────────────────── */

async function handlePaymentFailed(pi: Stripe.PaymentIntent) {
  const orderId = pi.metadata?.orderId;
  if (!orderId) return;

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "FAILED",
        status: "CANCELLED",
      },
    });
  } catch (err) {
    console.error("Error handling payment_intent.payment_failed:", err);
  }
}

/* ──────────────────────────────────────────────────────────
   VIP EMAIL RECEIPT — Minimalist luxury design
   ────────────────────────────────────────────────────────── */

interface VIPReceiptPayload {
  to: string;
  orderNumber: string;
  items: Array<{
    name: string;
    brand: string;
    size: string;
    color: string | null;
    quantity: number;
    priceCents: number;
    imageUrl: string;
  }>;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  dutyCents: number;
  totalCents: number;
  shippingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  deliveryStatus: string;
}

function fmtCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

async function sendVIPReceipt(payload: VIPReceiptPayload) {
  const {
    to,
    orderNumber,
    items,
    subtotalCents,
    shippingCents,
    taxCents,
    dutyCents,
    totalCents,
    shippingAddress,
    deliveryStatus,
  } = payload;

  const itemRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding:20px 0;border-bottom:1px solid #f0eeeb;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            ${
              item.imageUrl
                ? `<td width="80" style="padding-right:20px;vertical-align:top;">
                    <img src="${item.imageUrl}" alt="${item.name}" width="80" height="106"
                         style="display:block;object-fit:cover;background:#fbfbfa;" />
                   </td>`
                : ""
            }
            <td style="vertical-align:top;">
              <p style="margin:0 0 2px;font-family:Georgia,'Times New Roman',serif;font-size:9px;
                 letter-spacing:2px;text-transform:uppercase;color:#2E1A47;font-weight:600;">
                ${item.brand}
              </p>
              <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:15px;
                 color:#111111;line-height:1.4;">
                ${item.name}
              </p>
              <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:11px;
                 color:#999999;letter-spacing:0.3px;">
                Size: ${item.size}${item.color ? ` · ${item.color}` : ""} · Qty: ${item.quantity}
              </p>
            </td>
            <td width="100" style="vertical-align:top;text-align:right;">
              <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;
                 font-size:14px;color:#111111;font-weight:500;">
                ${fmtCents(item.priceCents)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`,
    )
    .join("");

  const addressHtml = shippingAddress
    ? `<table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="padding:24px;background:#fbfbfa;">
            <p style="margin:0 0 10px;font-family:-apple-system,Helvetica,Arial,sans-serif;
               font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#999999;font-weight:700;">
              Delivering To
            </p>
            <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;
               font-size:13px;color:#333333;line-height:1.7;">
              ${shippingAddress.name}<br/>
              ${shippingAddress.line1}<br/>
              ${shippingAddress.line2 ? shippingAddress.line2 + "<br/>" : ""}
              ${shippingAddress.city}${shippingAddress.state ? ", " + shippingAddress.state : ""} ${shippingAddress.postalCode}<br/>
              ${shippingAddress.country}
            </p>
          </td>
          <td width="24"></td>
          <td style="padding:24px;background:#fbfbfa;vertical-align:top;">
            <p style="margin:0 0 10px;font-family:-apple-system,Helvetica,Arial,sans-serif;
               font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#999999;font-weight:700;">
              Status
            </p>
            <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;
               font-size:13px;color:#0D2C22;font-weight:600;">
              ${deliveryStatus}
            </p>
            <p style="margin:6px 0 0;font-family:-apple-system,Helvetica,Arial,sans-serif;
               font-size:11px;color:#999999;">
              Tracking details will follow shortly.
            </p>
          </td>
        </tr>
       </table>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f7f6f4;font-family:-apple-system,Helvetica,Arial,sans-serif;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f7f6f4;">
<tr><td align="center" style="padding:48px 16px;">
<table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;">

  <!-- Header -->
  <tr><td style="background:#0D2C22;padding:40px 48px;text-align:center;">
    <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:9px;
       letter-spacing:5px;text-transform:uppercase;color:#C9A96E;">Order Confirmed</p>
    <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:20px;
       font-weight:400;letter-spacing:4px;color:#ffffff;">THE HERITAGE EDIT</h1>
  </td></tr>

  <!-- Thank you -->
  <tr><td style="padding:40px 48px 28px;">
    <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;
       color:#111111;font-weight:400;">Thank you for your order.</p>
    <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:14px;
       color:#666666;line-height:1.6;">
      Order <strong style="color:#0D2C22;">${orderNumber}</strong> has been confirmed and is being prepared with care.
    </p>
  </td></tr>

  <tr><td style="padding:0 48px;"><hr style="border:none;border-top:1px solid #f0eeeb;margin:0;"/></td></tr>

  <!-- Items -->
  <tr><td style="padding:24px 48px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">${itemRows}</table>
  </td></tr>

  <!-- Totals -->
  <tr><td style="padding:0 48px 28px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fbfbfa;padding:24px;">
      <tr><td style="padding:24px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#666666;">Subtotal</td>
            <td style="padding:4px 0;font-size:13px;color:#333333;text-align:right;">${fmtCents(subtotalCents)}</td>
          </tr>
          ${taxCents > 0 ? `<tr><td style="padding:4px 0;font-size:13px;color:#666666;">Tax</td><td style="padding:4px 0;font-size:13px;color:#333333;text-align:right;">${fmtCents(taxCents)}</td></tr>` : ""}
          ${dutyCents > 0 ? `<tr><td style="padding:4px 0;font-size:13px;color:#666666;">Import Duties</td><td style="padding:4px 0;font-size:13px;color:#333333;text-align:right;">${fmtCents(dutyCents)}</td></tr>` : ""}
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#666666;">Shipping</td>
            <td style="padding:4px 0;font-size:13px;color:#333333;text-align:right;">
              ${shippingCents === 0 ? "Complimentary" : fmtCents(shippingCents)}
            </td>
          </tr>
          <tr><td colspan="2" style="padding:10px 0 0;"><hr style="border:none;border-top:1px solid #e8e5e1;"/></td></tr>
          <tr>
            <td style="padding:14px 0 0;font-size:16px;font-weight:600;color:#111111;">Total</td>
            <td style="padding:14px 0 0;font-size:16px;font-weight:600;color:#111111;text-align:right;">
              ${fmtCents(totalCents)}
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </td></tr>

  <!-- Address + Status -->
  ${addressHtml ? `<tr><td style="padding:0 48px 28px;">${addressHtml}</td></tr>` : ""}

  <!-- CTA -->
  <tr><td style="padding:0 48px 36px;text-align:center;">
    <a href="${APP_URL}/account/orders" style="display:inline-block;padding:16px 40px;
       background:#0D2C22;color:#ffffff;font-size:12px;font-weight:600;
       letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;">
      Track Your Order
    </a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:28px 48px;background:#fbfbfa;border-top:1px solid #f0eeeb;text-align:center;">
    <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:10px;
       letter-spacing:3px;text-transform:uppercase;color:#999999;">THE HERITAGE EDIT</p>
    <p style="margin:0;font-size:11px;color:#bbbbbb;line-height:1.5;">
      Curated luxury, delivered with care.<br/>
      <a href="${APP_URL}" style="color:#0D2C22;text-decoration:none;">heritageedit.com</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    "THE HERITAGE EDIT — Order Confirmed",
    "",
    `Order: ${orderNumber}`,
    `Status: ${deliveryStatus}`,
    "",
    "Your Pieces:",
    ...items.map(
      (i) =>
        `  ${i.brand} — ${i.name}\n  Size: ${i.size}${i.color ? ` / ${i.color}` : ""} | Qty: ${i.quantity} | ${fmtCents(i.priceCents)}`,
    ),
    "",
    "---",
    `Subtotal: ${fmtCents(subtotalCents)}`,
    ...(taxCents > 0 ? [`Tax: ${fmtCents(taxCents)}`] : []),
    ...(dutyCents > 0 ? [`Import Duties: ${fmtCents(dutyCents)}`] : []),
    `Shipping: ${shippingCents === 0 ? "Complimentary" : fmtCents(shippingCents)}`,
    `Total: ${fmtCents(totalCents)}`,
    "",
    ...(shippingAddress
      ? [
          "Delivering To:",
          shippingAddress.name,
          shippingAddress.line1,
          ...(shippingAddress.line2 ? [shippingAddress.line2] : []),
          `${shippingAddress.city}${shippingAddress.state ? ", " + shippingAddress.state : ""} ${shippingAddress.postalCode}`,
          shippingAddress.country,
        ]
      : []),
    "",
    "Tracking details will be sent once your order ships.",
    "",
    "---",
    "Curated luxury, delivered with care.",
    "concierge@heritageedit.com",
  ].join("\n");

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `Order Confirmed — ${orderNumber} | THE HERITAGE EDIT`,
      html,
      text,
    });
    if (error) {
      console.error("Resend email error:", error);
    }
  } catch (err) {
    console.error("Failed to send VIP receipt email:", err);
  }
}
