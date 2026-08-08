import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

function getClient() {
  if (!accountSid || !authToken || !fromNumber) {
    return null;
  }
  return twilio(accountSid, authToken);
}

async function sendSms(to: string, body: string): Promise<void> {
  const client = getClient();
  if (!client) {
    console.log(`[SMS] Twilio not configured — skipping SMS to ${to}`);
    return;
  }

  const cleaned = to.replace(/[^+\d]/g, "");
  if (cleaned.length < 10) {
    console.log(`[SMS] Invalid phone number: ${to}`);
    return;
  }

  try {
    await client.messages.create({
      body,
      from: fromNumber,
      to: cleaned,
    });
    console.log(`[SMS] Message sent to ${cleaned}`);
  } catch (err) {
    console.error(`[SMS] Failed to send to ${cleaned}:`, err);
  }
}

export async function sendOrderConfirmationSms(
  phone: string,
  orderNumber: string,
  totalFormatted: string,
): Promise<void> {
  await sendSms(
    phone,
    `THE HERITAGE EDIT: Your order ${orderNumber} is confirmed! Total: ${totalFormatted}. We're preparing your pieces with care. Track at ${process.env.NEXT_PUBLIC_APP_URL ?? "https://heritageedit.com"}/account/orders`,
  );
}

export async function sendShippingNotificationSms(
  phone: string,
  orderNumber: string,
  carrier: string,
  trackingNumber: string,
): Promise<void> {
  await sendSms(
    phone,
    `THE HERITAGE EDIT: Order ${orderNumber} has shipped via ${carrier}! Tracking: ${trackingNumber}. Your luxury pieces are on the way.`,
  );
}

export async function sendDeliveryConfirmationSms(
  phone: string,
  orderNumber: string,
): Promise<void> {
  await sendSms(
    phone,
    `THE HERITAGE EDIT: Order ${orderNumber} has been delivered! We hope you love your pieces. Questions? Email concierge@heritageedit.com`,
  );
}
