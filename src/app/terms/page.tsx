import { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <main className="luxury-container py-20 md:py-32 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-serif text-obsidian mb-4">Terms of Service</h1>
      <p className="text-xs text-neutral-400 mb-16">Last updated: 1 July 2025</p>

      <div className="space-y-10 text-[13px] text-neutral-600 leading-[1.8]">
        <section>
          <h2 className="text-sm font-medium text-obsidian mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the website at heritageedit.com (the &ldquo;Site&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not use the Site or place orders. These terms constitute a legally binding agreement between you and The Heritage Edit Limited (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), a company registered in Nigeria.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-medium text-obsidian mb-3">2. Products & Ordering</h2>
          <p>
            All products listed on the Site are subject to availability. We reserve the right to limit quantities and to refuse any order. Prices are displayed in your selected currency and include applicable taxes where indicated. Made-to-order items are manufactured to your specifications after order confirmation and are therefore non-cancellable once production has begun — typically within 24 hours of payment confirmation.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-medium text-obsidian mb-3">3. Payment</h2>
          <p>
            We accept payment via Paystack and Flutterwave, which support major debit/credit cards, bank transfers, and mobile money. Full payment is required at the time of order. All transactions are processed in the currency selected at checkout. Exchange rates for non-Naira currencies are determined by our payment processors at the time of charge.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-medium text-obsidian mb-3">4. Intellectual Property</h2>
          <p>
            All content on the Site — including text, images, graphics, logos, the HE monogram, product designs, and software — is the property of The Heritage Edit Limited or its licensors and is protected by Nigerian and international copyright, trademark, and intellectual property laws. You may not reproduce, distribute, or create derivative works from any content without our prior written consent.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-medium text-obsidian mb-3">5. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must notify us immediately of any unauthorised use. We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-medium text-obsidian mb-3">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, The Heritage Edit Limited shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Site or purchase of products. Our total liability for any claim shall not exceed the amount you paid for the specific product giving rise to the claim.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-medium text-obsidian mb-3">7. Governing Law</h2>
          <p>
            These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-medium text-obsidian mb-3">8. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes take effect immediately upon posting to the Site. Your continued use of the Site after changes are posted constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-medium text-obsidian mb-3">9. Contact</h2>
          <p>
            For questions regarding these Terms, contact us at{" "}
            <a href="mailto:legal@heritageedit.com" className="text-heritage-green underline">
              legal@heritageedit.com
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
