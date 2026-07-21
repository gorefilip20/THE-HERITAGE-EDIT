import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");

const FROM_ADDRESS = "THE HERITAGE EDIT <orders@heritageedit.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://heritageedit.com";

interface OrderEmailItem {
  name: string;
  brand: string;
  size: string;
  quantity: number;
  priceCents: number;
  imageUrl: string;
}

interface OrderConfirmationPayload {
  to: string;
  orderNumber: string;
  items: OrderEmailItem[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  dutyCents: number;
  totalCents: number;
  currency: string;
  shippingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  shippingMethod: string;
}

interface ShippingNotificationPayload {
  to: string;
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  items: Pick<OrderEmailItem, "name" | "brand">[];
}

function formatCents(cents: number, currency = "NGN"): string {
  const currencySymbols: Record<string, { symbol: string; locale: string }> = {
    NGN: { symbol: "₦", locale: "en-NG" },
    USD: { symbol: "$", locale: "en-US" },
    GBP: { symbol: "£", locale: "en-GB" },
    EUR: { symbol: "€", locale: "de-DE" },
    GHS: { symbol: "₵", locale: "en-GH" },
    KES: { symbol: "KSh", locale: "en-KE" },
    ZAR: { symbol: "R", locale: "en-ZA" },
  };
  const config = currencySymbols[currency] ?? currencySymbols.NGN;
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function buildOrderConfirmationHtml(payload: OrderConfirmationPayload): string {
  const { orderNumber, items, subtotalCents, shippingCents, taxCents, dutyCents, totalCents, currency, shippingAddress, shippingMethod } = payload;

  const itemRows = items.map((item) => `
    <tr><td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
        ${item.imageUrl ? `<td width="72" style="padding-right: 16px; vertical-align: top;"><img src="${item.imageUrl}" alt="${item.name}" width="72" height="90" style="display: block; object-fit: cover; background-color: #f7f7f6;" /></td>` : ""}
        <td style="vertical-align: top;">
          <p style="margin: 0 0 2px; font-family: Georgia, serif; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #2E1A47;">${item.brand}</p>
          <p style="margin: 0 0 4px; font-family: Georgia, serif; font-size: 15px; color: #111111;">${item.name}</p>
          <p style="margin: 0; font-family: -apple-system, sans-serif; font-size: 12px; color: #999999;">Size: ${item.size} &middot; Qty: ${item.quantity}</p>
        </td>
        <td width="100" style="vertical-align: top; text-align: right;">
          <p style="margin: 0; font-family: -apple-system, sans-serif; font-size: 14px; color: #111111;">${formatCents(item.priceCents, currency)}</p>
        </td>
      </tr></table>
    </td></tr>`).join("");

  const addressBlock = shippingAddress ? `
    <td style="vertical-align: top; padding: 20px; background-color: #f7f7f6;">
      <p style="margin: 0 0 8px; font-family: -apple-system, sans-serif; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #999999; font-weight: 600;">Shipping To</p>
      <p style="margin: 0; font-family: -apple-system, sans-serif; font-size: 13px; color: #333333; line-height: 1.6;">
        ${shippingAddress.name}<br />${shippingAddress.line1}<br />
        ${shippingAddress.line2 ? shippingAddress.line2 + "<br />" : ""}
        ${shippingAddress.city}${shippingAddress.state ? ", " + shippingAddress.state : ""} ${shippingAddress.postalCode}<br />${shippingAddress.country}
      </p>
    </td>` : "";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Order Confirmation</title></head>
<body style="margin: 0; padding: 0; background-color: #f7f7f6; font-family: -apple-system, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f7f7f6;"><tr><td align="center" style="padding: 40px 16px;">
    <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; overflow: hidden;">
      <tr><td style="background: linear-gradient(135deg, #0D2C22 0%, #2E1A47 100%); padding: 36px 40px; text-align: center;">
        <p style="margin: 0 0 6px; font-family: Georgia, serif; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #C9A96E;">Order Confirmed</p>
        <h1 style="margin: 0; font-family: Georgia, serif; font-size: 22px; font-weight: 400; letter-spacing: 3px; color: #ffffff;">THE HERITAGE EDIT</h1>
      </td></tr>
      <tr><td style="padding: 36px 40px 24px;">
        <p style="margin: 0 0 6px; font-family: Georgia, serif; font-size: 20px; color: #111111;">Thank you for your order.</p>
        <p style="margin: 0; font-size: 14px; color: #666666;">Your order <strong style="color: #0D2C22;">${orderNumber}</strong> has been confirmed and is being prepared with care.</p>
      </td></tr>
      <tr><td style="padding: 0 40px;"><hr style="border: none; border-top: 1px solid #eaeaea;" /></td></tr>
      <tr><td style="padding: 24px 40px;"><table cellpadding="0" cellspacing="0" border="0" width="100%">${itemRows}</table></td></tr>
      <tr><td style="padding: 0 40px 24px;"><table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fafaf9;"><tr><td style="padding: 20px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td style="padding: 4px 0; font-size: 13px; color: #666666;">Subtotal</td><td style="padding: 4px 0; font-size: 13px; color: #333333; text-align: right;">${formatCents(subtotalCents, currency)}</td></tr>
          ${taxCents > 0 ? `<tr><td style="padding: 4px 0; font-size: 13px; color: #666666;">Tax</td><td style="padding: 4px 0; font-size: 13px; color: #333333; text-align: right;">${formatCents(taxCents, currency)}</td></tr>` : ""}
          ${dutyCents > 0 ? `<tr><td style="padding: 4px 0; font-size: 13px; color: #666666;">Import Duties</td><td style="padding: 4px 0; font-size: 13px; color: #333333; text-align: right;">${formatCents(dutyCents, currency)}</td></tr>` : ""}
          <tr><td style="padding: 4px 0; font-size: 13px; color: #666666;">${shippingMethod || "Standard"} Shipping</td><td style="padding: 4px 0; font-size: 13px; color: #333333; text-align: right;">${shippingCents === 0 ? "Complimentary" : formatCents(shippingCents, currency)}</td></tr>
          <tr><td colspan="2" style="padding: 8px 0 0;"><hr style="border: none; border-top: 1px solid #e5e5e5;" /></td></tr>
          <tr><td style="padding: 12px 0 0; font-size: 15px; font-weight: 600; color: #111111;">Total</td><td style="padding: 12px 0 0; font-size: 15px; font-weight: 600; color: #111111; text-align: right;">${formatCents(totalCents, currency)}</td></tr>
        </table>
      </td></tr></table></td></tr>
      ${shippingAddress ? `<tr><td style="padding: 0 40px 24px;"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>${addressBlock}</tr></table></td></tr>` : ""}
      <tr><td style="padding: 0 40px 32px; text-align: center;"><a href="${APP_URL}/account/orders" style="display: inline-block; padding: 14px 32px; background-color: #0D2C22; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none;">Track Your Order</a></td></tr>
      <tr><td style="padding: 24px 40px; background-color: #fafaf9; border-top: 1px solid #f0f0f0; text-align: center;">
        <p style="margin: 0 0 4px; font-family: Georgia, serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #999999;">THE HERITAGE EDIT</p>
        <p style="margin: 0; font-size: 11px; color: #bbbbbb;">Curated luxury, delivered with care.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function buildShippingNotificationHtml(payload: ShippingNotificationPayload): string {
  const { orderNumber, trackingNumber, carrier, trackingUrl, estimatedDelivery, items } = payload;
  const itemList = items.map((i) => `<li style="margin: 4px 0; font-size: 13px; color: #333;">${i.brand} — ${i.name}</li>`).join("");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Your Order Has Shipped</title></head>
<body style="margin: 0; padding: 0; background-color: #f7f7f6; font-family: -apple-system, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f7f7f6;"><tr><td align="center" style="padding: 40px 16px;">
    <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; overflow: hidden;">
      <tr><td style="background: linear-gradient(135deg, #0D2C22 0%, #2E1A47 100%); padding: 36px 40px; text-align: center;">
        <p style="margin: 0 0 6px; font-family: Georgia, serif; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #C9A96E;">Order Shipped</p>
        <h1 style="margin: 0; font-family: Georgia, serif; font-size: 22px; font-weight: 400; letter-spacing: 3px; color: #ffffff;">THE HERITAGE EDIT</h1>
      </td></tr>
      <tr><td style="padding: 36px 40px 24px;">
        <p style="margin: 0 0 6px; font-family: Georgia, serif; font-size: 20px; color: #111111;">Your order is on its way!</p>
        <p style="margin: 0 0 16px; font-size: 14px; color: #666666;">Order <strong style="color: #0D2C22;">${orderNumber}</strong> has been shipped via <strong>${carrier}</strong>.</p>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f7f7f6;"><tr><td style="padding: 20px;">
          <p style="margin: 0 0 4px; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #999; font-weight: 600;">Tracking Number</p>
          <p style="margin: 0 0 12px; font-size: 16px; color: #0D2C22; font-weight: 600; letter-spacing: 1px;">${trackingNumber}</p>
          ${estimatedDelivery ? `<p style="margin: 0 0 4px; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #999; font-weight: 600;">Estimated Delivery</p><p style="margin: 0; font-size: 14px; color: #333;">${estimatedDelivery}</p>` : ""}
        </td></tr></table>
      </td></tr>
      <tr><td style="padding: 0 40px 24px;">
        <p style="margin: 0 0 8px; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #999; font-weight: 600;">Items Shipped</p>
        <ul style="margin: 0; padding-left: 16px;">${itemList}</ul>
      </td></tr>
      ${trackingUrl ? `<tr><td style="padding: 0 40px 32px; text-align: center;"><a href="${trackingUrl}" style="display: inline-block; padding: 14px 32px; background-color: #0D2C22; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none;">Track Your Package</a></td></tr>` : ""}
      <tr><td style="padding: 24px 40px; background-color: #fafaf9; border-top: 1px solid #f0f0f0; text-align: center;">
        <p style="margin: 0 0 4px; font-family: Georgia, serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #999999;">THE HERITAGE EDIT</p>
        <p style="margin: 0; font-size: 11px; color: #bbbbbb;">Curated luxury, delivered with care.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

function buildPlainText(payload: OrderConfirmationPayload): string {
  const { orderNumber, items, subtotalCents, shippingCents, taxCents, dutyCents, totalCents, currency, shippingAddress, shippingMethod } = payload;
  const itemLines = items.map((item) => `  ${item.brand} — ${item.name}\n  Size: ${item.size} | Qty: ${item.quantity} | ${formatCents(item.priceCents, currency)}`).join("\n\n");
  let text = `THE HERITAGE EDIT — Order Confirmation\n\nOrder: ${orderNumber}\n\nYour Pieces:\n${itemLines}\n\n---\nSubtotal: ${formatCents(subtotalCents, currency)}`;
  if (taxCents > 0) text += `\nTax: ${formatCents(taxCents, currency)}`;
  if (dutyCents > 0) text += `\nImport Duties: ${formatCents(dutyCents, currency)}`;
  text += `\n${shippingMethod || "Standard"} Shipping: ${shippingCents === 0 ? "Complimentary" : formatCents(shippingCents, currency)}`;
  text += `\nTotal: ${formatCents(totalCents, currency)}`;
  if (shippingAddress) {
    text += `\n\nShipping To:\n${shippingAddress.name}\n${shippingAddress.line1}`;
    if (shippingAddress.line2) text += `\n${shippingAddress.line2}`;
    text += `\n${shippingAddress.city}${shippingAddress.state ? ", " + shippingAddress.state : ""} ${shippingAddress.postalCode}\n${shippingAddress.country}`;
  }
  text += `\n\n---\nCurated luxury, delivered with care.\nconcierge@heritageedit.com`;
  return text;
}

export async function sendOrderConfirmationEmail(payload: OrderConfirmationPayload): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: payload.to,
      subject: `Order Confirmed — ${payload.orderNumber} | THE HERITAGE EDIT`,
      html: buildOrderConfirmationHtml(payload),
      text: buildPlainText(payload),
    });
    if (error) {
      console.error("Resend email delivery error:", error);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
    console.log(`[Email] Order confirmation sent to ${payload.to} for ${payload.orderNumber}`);
  } catch (err) {
    console.error("Failed to send order confirmation email:", err);
  }
}

export async function sendShippingNotificationEmail(payload: ShippingNotificationPayload): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: payload.to,
      subject: `Your Order Has Shipped — ${payload.orderNumber} | THE HERITAGE EDIT`,
      html: buildShippingNotificationHtml(payload),
      text: `THE HERITAGE EDIT — Shipping Notification\n\nYour order ${payload.orderNumber} has been shipped!\n\nCarrier: ${payload.carrier}\nTracking: ${payload.trackingNumber}\n${payload.estimatedDelivery ? `Estimated Delivery: ${payload.estimatedDelivery}\n` : ""}${payload.trackingUrl ? `Track: ${payload.trackingUrl}\n` : ""}\nItems:\n${payload.items.map((i) => `  ${i.brand} — ${i.name}`).join("\n")}\n\n---\nCurated luxury, delivered with care.\nconcierge@heritageedit.com`,
    });
    if (error) {
      console.error("Resend shipping email error:", error);
    }
    console.log(`[Email] Shipping notification sent to ${payload.to} for ${payload.orderNumber}`);
  } catch (err) {
    console.error("Failed to send shipping notification email:", err);
  }
}
