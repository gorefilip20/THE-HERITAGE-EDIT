import { Metadata } from "next";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPolicyPage() {
  return (
    <main className="luxury-container py-20 md:py-32 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-serif text-obsidian mb-4">Refund Policy</h1>
      <p className="text-xs text-neutral-400 mb-16">Last updated: 1 July 2025</p>

      <div className="space-y-10 text-[13px] text-neutral-600 leading-[1.8]">
        <section>
          <h2 className="text-sm font-medium text-obsidian mb-3">Made-to-Order Items</h2>
          <p>
            Because each made-to-order garment is crafted to your specific measurements and specifications, we are unable to offer refunds on custom pieces. However, we stand behind our craftsmanship: if the garment does not meet the agreed-upon specifications, we will alter it at no cost within 14 days of delivery. If the issue cannot be resolved through alteration, we will produce a replacement at our expense.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-medium text-obsidian mb-3">Ready-to-Wear Items</h2>
          <p>
            Ready-to-wear pieces may be returned for exchange or store credit within 7 days of delivery, provided the item is unworn, unwashed, and in its original packaging with all tags attached. Items that show signs of wear, alteration, or damage are not eligible. Accessories (caps, pocket squares, jewellery) are final sale.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-medium text-obsidian mb-3">Store Credits</h2>
          <p>
            Approved returns are issued as store credit valid for 12 months from the date of issue. Store credit is non-transferable and cannot be redeemed for cash. The credit is applied to your account and can be used toward any future purchase on the Site, including made-to-order commissions.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-medium text-obsidian mb-3">Exchanges</h2>
          <p>
            For ready-to-wear items, we offer a one-time size exchange within the 7-day return window. Exchange requests are subject to availability of the desired size. If the requested size is unavailable, we will issue store credit for the full purchase amount. Exchange shipping within Nigeria is complimentary; international exchange shipping is at the customer&apos;s expense.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-medium text-obsidian mb-3">Damaged or Defective Items</h2>
          <p>
            If your order arrives damaged during transit or with a manufacturing defect, contact us within 48 hours of delivery with photographs of the issue. We will arrange a complimentary return pickup and either replace the item or issue a full refund to your original payment method, at your preference. Transit damage claims require photographic evidence of both the garment and outer packaging.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-medium text-obsidian mb-3">How to Initiate a Return</h2>
          <p>
            To begin a return or exchange, email{" "}
            <a href="mailto:returns@heritageedit.com" className="text-heritage-green underline">
              returns@heritageedit.com
            </a>{" "}
            with your order number, the item(s) you wish to return, and the reason. Our team will respond within one business day with a return authorisation and shipping instructions. Please do not ship items back without a return authorisation — unauthorised returns will not be processed.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-medium text-obsidian mb-3">Refund Timeline</h2>
          <p>
            Once we receive and inspect a returned item, you will be notified of the approval or rejection within 2 business days. Approved refunds (for damaged/defective items) are processed to your original payment method within 5–7 business days. Store credits are applied to your account immediately upon approval.
          </p>
        </section>
      </div>
    </main>
  );
}
