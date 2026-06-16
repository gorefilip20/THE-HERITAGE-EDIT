import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "THE HERITAGE EDIT <orders@heritageedit.com>";

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

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function buildOrderConfirmationHtml(payload: OrderConfirmationPayload): string {
  const {
    orderNumber,
    items,
    subtotalCents,
    shippingCents,
    taxCents,
    dutyCents,
    totalCents,
    shippingAddress,
    shippingMethod,
  } = payload;

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                ${
                  item.imageUrl
                    ? `<td width="72" style="padding-right: 16px; vertical-align: top;">
                        <img src="${item.imageUrl}" alt="${item.name}" width="72" height="90" style="display: block; border-radius: 6px; object-fit: cover; background-color: #f7f7f6;" />
                      </td>`
                    : ""
                }
                <td style="vertical-align: top;">
                  <p style="margin: 0 0 2px; font-family: Georgia, 'Times New Roman', serif; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #2E1A47;">${item.brand}</p>
                  <p style="margin: 0 0 4px; font-family: Georgia, 'Times New Roman', serif; font-size: 15px; color: #111111;">${item.name}</p>
                  <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-size: 12px; color: #999999;">Size: ${item.size} &middot; Qty: ${item.quantity}</p>
                </td>
                <td width="100" style="vertical-align: top; text-align: right;">
                  <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-size: 14px; color: #111111; font-variant-numeric: tabular-nums;">${formatCents(item.priceCents)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`,
    )
    .join("");

  const addressBlock = shippingAddress
    ? `
      <td style="vertical-align: top; padding: 20px; background-color: #f7f7f6; border-radius: 8px;">
        <p style="margin: 0 0 8px; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #999999; font-weight: 600;">Shipping To</p>
        <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-size: 13px; color: #333333; line-height: 1.6;">
          ${shippingAddress.name}<br />
          ${shippingAddress.line1}<br />
          ${shippingAddress.line2 ? shippingAddress.line2 + "<br />" : ""}
          ${shippingAddress.city}${shippingAddress.state ? ", " + shippingAddress.state : ""} ${shippingAddress.postalCode}<br />
          ${shippingAddress.country}
        </p>
      </td>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Order Confirmation — THE HERITAGE EDIT</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f6; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;">

  <!-- Outer wrapper -->
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f7f7f6;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Main card -->
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">

          <!-- Header banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0D2C22 0%, #2E1A47 100%); padding: 36px 40px; text-align: center;">
              <p style="margin: 0 0 6px; font-family: Georgia, 'Times New Roman', serif; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #C9A96E;">Order Confirmed</p>
              <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 400; letter-spacing: 3px; color: #ffffff;">THE HERITAGE EDIT</h1>
            </td>
          </tr>

          <!-- Confirmation message -->
          <tr>
            <td style="padding: 36px 40px 24px;">
              <p style="margin: 0 0 6px; font-family: Georgia, 'Times New Roman', serif; font-size: 20px; color: #111111;">Thank you for your order.</p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-size: 14px; color: #666666; line-height: 1.6;">
                Your order <strong style="color: #0D2C22; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 13px;">${orderNumber}</strong> has been confirmed and is being prepared with care.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #eaeaea; margin: 0;" />
            </td>
          </tr>

          <!-- Order items -->
          <tr>
            <td style="padding: 24px 40px;">
              <p style="margin: 0 0 16px; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #999999; font-weight: 600;">Your Pieces</p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                ${itemRows}
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fafaf9; border-radius: 8px; padding: 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-size: 13px; color: #666666;">Subtotal</td>
                        <td style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-size: 13px; color: #333333; text-align: right; font-variant-numeric: tabular-nums;">${formatCents(subtotalCents)}</td>
                      </tr>
                      ${
                        taxCents > 0
                          ? `<tr>
                              <td style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-size: 13px; color: #666666;">Tax</td>
                              <td style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-size: 13px; color: #333333; text-align: right; font-variant-numeric: tabular-nums;">${formatCents(taxCents)}</td>
                            </tr>`
                          : ""
                      }
                      ${
                        dutyCents > 0
                          ? `<tr>
                              <td style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-size: 13px; color: #666666;">Import Duties</td>
                              <td style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-size: 13px; color: #333333; text-align: right; font-variant-numeric: tabular-nums;">${formatCents(dutyCents)}</td>
                            </tr>`
                          : ""
                      }
                      <tr>
                        <td style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-size: 13px; color: #666666;">${shippingMethod} Shipping</td>
                        <td style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-size: 13px; color: #333333; text-align: right; font-variant-numeric: tabular-nums;">${shippingCents === 0 ? "Complimentary" : formatCents(shippingCents)}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 8px 0 0;">
                          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0;" />
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-size: 15px; font-weight: 600; color: #111111;">Total</td>
                        <td style="padding: 12px 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-size: 15px; font-weight: 600; color: #111111; text-align: right; font-variant-numeric: tabular-nums;">${formatCents(totalCents)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping address + method -->
          ${
            shippingAddress
              ? `<tr>
                  <td style="padding: 0 40px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>${addressBlock}</tr>
                    </table>
                  </td>
                </tr>`
              : ""
          }

          <!-- CTA -->
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://heritageedit.com"}/account/orders" style="display: inline-block; padding: 14px 32px; background-color: #0D2C22; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 8px; letter-spacing: 0.5px;">
                Track Your Order
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafaf9; border-top: 1px solid #f0f0f0; text-align: center;">
              <p style="margin: 0 0 4px; font-family: Georgia, 'Times New Roman', serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #999999;">THE HERITAGE EDIT</p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; font-size: 11px; color: #bbbbbb; line-height: 1.5;">
                Curated luxury, delivered with care.<br />
                Questions? Reply to this email or contact <a href="mailto:concierge@heritageedit.com" style="color: #0D2C22; text-decoration: underline;">concierge@heritageedit.com</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

function buildPlainText(payload: OrderConfirmationPayload): string {
  const { orderNumber, items, subtotalCents, shippingCents, taxCents, dutyCents, totalCents, shippingAddress, shippingMethod } = payload;

  const itemLines = items
    .map(
      (item) =>
        `  ${item.brand} — ${item.name}\n  Size: ${item.size} | Qty: ${item.quantity} | ${formatCents(item.priceCents)}`,
    )
    .join("\n\n");

  let text = `THE HERITAGE EDIT — Order Confirmation

Order: ${orderNumber}

Your Pieces:
${itemLines}

---
Subtotal: ${formatCents(subtotalCents)}`;

  if (taxCents > 0) text += `\nTax: ${formatCents(taxCents)}`;
  if (dutyCents > 0) text += `\nImport Duties: ${formatCents(dutyCents)}`;
  text += `\n${shippingMethod} Shipping: ${shippingCents === 0 ? "Complimentary" : formatCents(shippingCents)}`;
  text += `\nTotal: ${formatCents(totalCents)}`;

  if (shippingAddress) {
    text += `\n\nShipping To:\n${shippingAddress.name}\n${shippingAddress.line1}`;
    if (shippingAddress.line2) text += `\n${shippingAddress.line2}`;
    text += `\n${shippingAddress.city}${shippingAddress.state ? ", " + shippingAddress.state : ""} ${shippingAddress.postalCode}\n${shippingAddress.country}`;
  }

  text += `\n\n---\nCurated luxury, delivered with care.\nconcierge@heritageedit.com`;

  return text;
}

export async function sendOrderConfirmationEmail(
  payload: OrderConfirmationPayload,
): Promise<void> {
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
  } catch (err) {
    console.error("Failed to send order confirmation email:", err);
  }
}
