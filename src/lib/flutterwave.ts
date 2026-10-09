import { timingSafeEqual } from "node:crypto";

export const FLUTTERWAVE_API_URL = "https://api.flutterwave.com/v3";

export type FlutterwaveVerification = {
  status?: string;
  message?: string;
  data?: {
    id?: number;
    status?: string;
    tx_ref?: string;
    amount?: number;
    currency?: string;
    charged_amount?: number;
  };
};

export function validFlutterwaveWebhookHash(received: string | null): boolean {
  const expected = process.env.FLUTTERWAVE_SECRET_HASH ?? "";
  if (!received || !expected) return false;
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function verifyFlutterwaveTransaction(transactionId: string): Promise<FlutterwaveVerification> {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) throw new Error("Flutterwave is not configured on the server");

  const response = await fetch(
    `${FLUTTERWAVE_API_URL}/transactions/${encodeURIComponent(transactionId)}/verify`,
    {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    },
  );
  const payload = (await response.json().catch(() => null)) as FlutterwaveVerification | null;
  if (!response.ok || payload?.status !== "success") {
    throw new Error(payload?.message ?? "Flutterwave transaction verification failed");
  }
  return payload;
}
