import { Metadata } from "next";

export const metadata: Metadata = { title: "Shipment & Tracking" };

export default function ShipmentPage() {
  return (
    <main className="luxury-container py-20 md:py-32 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-serif text-obsidian mb-4">Shipment & Tracking</h1>
      <p className="text-sm text-neutral-500 mb-16 leading-relaxed">
        Every Heritage Edit order is packaged with the same care we put into crafting each garment.
      </p>

      <section className="mb-14">
        <h2 className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-4">
          Tracking Your Order
        </h2>
        <p className="text-[13px] text-neutral-500 leading-[1.8] mb-4">
          Once your order is dispatched, you will receive an email and SMS notification containing your tracking number and a direct link to the courier&apos;s tracking portal. You can also enter your order number on this page or in the &ldquo;My Orders&rdquo; section of your account.
        </p>
        <p className="text-[13px] text-neutral-500 leading-[1.8]">
          Tracking updates are typically available within 2–4 hours of dispatch. If your tracking has not updated after 24 hours, please contact our support team.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-4">
          Dispatch Schedule
        </h2>
        <p className="text-[13px] text-neutral-500 leading-[1.8] mb-4">
          Ready-to-wear orders are dispatched within 1–2 business days (Monday–Friday, excluding public holidays). Made-to-order pieces are dispatched upon completion of production — typically 10–14 business days from order confirmation.
        </p>
        <p className="text-[13px] text-neutral-500 leading-[1.8]">
          All orders placed before 12:00 PM WAT on a business day that are ready to ship will be dispatched the same day. Orders placed after 12:00 PM will ship the following business day.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-4">
          Packaging
        </h2>
        <p className="text-[13px] text-neutral-500 leading-[1.8] mb-4">
          Each garment is individually wrapped in acid-free tissue paper, sealed with The Heritage Edit embossed sticker, and placed inside a branded garment bag. The garment bag is then enclosed in a rigid black shipping box with a magnetic closure, accompanied by a care card and a hand-signed note from your artisan.
        </p>
        <p className="text-[13px] text-neutral-500 leading-[1.8]">
          For international shipments, the outer box is further protected by a corrugated shipping carton sealed with tamper-evident tape. All packaging materials are recyclable or biodegradable.
        </p>
      </section>

      <section>
        <h2 className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-4">
          Delivery Partners
        </h2>
        <p className="text-[13px] text-neutral-500 leading-[1.8]">
          We partner with DHL Express, FedEx International Priority, and Aramex to ensure reliable, tracked delivery worldwide. Domestic Nigerian deliveries are fulfilled through GIG Logistics and DHL. All shipments include signature confirmation and full transit insurance at no additional cost.
        </p>
      </section>

      <div className="border-t border-neutral-200 pt-10 mt-16">
        <p className="text-sm text-neutral-500">
          Having trouble with a delivery?{" "}
          <a href="/contact" className="text-heritage-green underline">Reach our support team</a> or WhatsApp us at +234 901 234 5678.
        </p>
      </div>
    </main>
  );
}
