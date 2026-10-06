import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { capturePaidOrder, verifyPaystackTransaction } from "@/lib/paystack";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaystackCallbackPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const reference = first(params.reference) ?? first(params.trxref);
  const orderNumber = first(params.order);

  let success = false;
  let displayOrder = orderNumber;
  let error = "We could not confirm this payment.";

  if (reference) {
    try {
      const verification = await verifyPaystackTransaction(reference);
      const payment = verification.data;
      const order = await prisma.order.findUnique({
        where: { orderNumber: orderNumber ?? payment?.reference ?? reference },
        select: { id: true, orderNumber: true, totalCents: true, currency: true },
      });

      const referenceMatches = !orderNumber || payment?.reference === orderNumber;
      const amountMatches = !order || payment?.amount === order.totalCents;
      const currencyMatches = !order || !payment?.currency || payment.currency === order.currency;

      if (payment?.status === "success" && order && referenceMatches && amountMatches && currencyMatches) {
        await capturePaidOrder(order.id, payment.reference ?? reference);
        success = true;
        displayOrder = order.orderNumber;
      } else if (!order) {
        error = "The payment was received, but the order reference could not be found. Please contact support.";
      } else if (!referenceMatches || !amountMatches || !currencyMatches) {
        error = "The payment details did not match this order. Please contact support before trying again.";
      } else {
        error = "Paystack has not marked this transaction as successful.";
      }
    } catch (verificationError) {
      console.error("Paystack callback verification error:", verificationError);
      error = "We could not verify the payment right now. Please contact support if your account was charged.";
    }
  } else {
    error = "No Paystack transaction reference was returned.";
  }

  return (
    <main className="min-h-[70vh] bg-ivory px-6 py-20">
      <div className="mx-auto max-w-xl bg-white px-8 py-14 text-center shadow-sm md:px-14">
        {success ? (
          <CheckCircle2 className="mx-auto mb-6 text-heritage-green" size={52} strokeWidth={1.5} />
        ) : reference ? (
          <XCircle className="mx-auto mb-6 text-red-700" size={52} strokeWidth={1.5} />
        ) : (
          <Loader2 className="mx-auto mb-6 animate-spin text-heritage-green" size={52} strokeWidth={1.5} />
        )}
        <p className="mb-3 text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-heritage-green/70">
          {success ? "Payment confirmed" : "Payment status"}
        </p>
        <h1 className="font-serif text-4xl italic text-obsidian">
          {success ? "Thank you for your order." : "We need to check your payment."}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-neutral-500">
          {success
            ? `Your Paystack payment is confirmed${displayOrder ? ` for order ${displayOrder}` : ""}. Your order is now being prepared.`
            : error}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="luxury-button-primary">Continue shopping</Link>
          <Link href="/contact" className="luxury-button-secondary">Contact support</Link>
        </div>
      </div>
    </main>
  );
}
