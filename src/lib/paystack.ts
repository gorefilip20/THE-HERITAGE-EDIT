import { prisma } from "@/lib/db";

export const PAYSTACK_API_URL = "https://api.paystack.co";
export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY ?? "";
export const PAYSTACK_PUBLIC_KEY =
  process.env.PAYSTACK_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";

export type PaystackVerification = {
  status: boolean;
  message?: string;
  data?: {
    id?: number;
    status?: string;
    reference?: string;
    amount?: number;
    currency?: string;
    metadata?: { orderId?: string; orderNumber?: string };
  };
};

export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerification> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack is not configured");
  }

  const response = await fetch(
    `${PAYSTACK_API_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      cache: "no-store",
    },
  );

  const payload = (await response.json().catch(() => null)) as PaystackVerification | null;
  if (!response.ok || !payload?.status) {
    throw new Error(payload?.message ?? "Paystack transaction verification failed");
  }
  return payload;
}

export async function capturePaidOrder(orderId: string, reference: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) return { found: false, captured: false };
  if (order.paymentStatus === "CAPTURED") {
    return { found: true, captured: true };
  }

  await prisma.$transaction(async (tx) => {
    const current = await tx.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });
    if (!current || current.paymentStatus === "CAPTURED") return;

    await tx.order.update({
      where: { id: current.id },
      data: {
        status: "CONFIRMED",
        paymentStatus: "CAPTURED",
        // The current schema predates a dedicated Paystack reference column.
        // Keep the reference in notes until the next controlled DB migration.
        notes: `${current.notes ?? ""}${current.notes ? "\n" : ""}Paystack reference: ${reference}`,
        stripePaymentId: current.stripePaymentId ?? reference,
      },
    });

    for (const item of current.items) {
      if (item.variantId) {
        await tx.productVariant.updateMany({
          where: { id: item.variantId },
          data: { stockCount: { decrement: item.quantity } },
        });
      }
    }
  });

  return { found: true, captured: true };
}

