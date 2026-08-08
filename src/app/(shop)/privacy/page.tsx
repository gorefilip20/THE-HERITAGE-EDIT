export default function PrivacyPage() {
  return (
    <main className="bg-[#FBFBFA] min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-[#0D2C22] to-[#2E1A47] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-gold mb-4">
            YOUR DATA
          </p>
          <h1 className="text-display-lg font-serif mb-6">
            Privacy Policy
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            We are committed to protecting your personal information and your right to privacy.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-neutral-400 font-sans mb-12">
            Last updated: 1 August 2026
          </p>

          {/* Introduction */}
          <div className="mb-16">
            <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
              <p>
                The Heritage Edit (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the website theheritageedit.com. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and make purchases from our platform.
              </p>
              <p>
                By using our services, you consent to the data practices described in this policy. If you do not agree with the terms of this policy, please do not access the site.
              </p>
            </div>
          </div>

          {/* Information We Collect */}
          <div className="mb-16">
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
              SECTION 1
            </p>
            <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
              Information We Collect
            </h2>
            <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
              <p>We collect information that you provide directly to us, including:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span><strong className="text-[#0D2C22]">Personal identification:</strong> Full name, email address, phone number, and delivery address</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span><strong className="text-[#0D2C22]">Payment information:</strong> Card details are processed securely through our payment providers (Paystack, Flutterwave) and are never stored on our servers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span><strong className="text-[#0D2C22]">Order information:</strong> Purchase history, sizing preferences, and made-to-measure specifications</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span><strong className="text-[#0D2C22]">Communications:</strong> Messages you send to our customer care team, styling consultations, and survey responses</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span><strong className="text-[#0D2C22]">Technical data:</strong> IP address, browser type, device information, and browsing behaviour collected automatically when you visit our site</span>
                </li>
              </ul>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="mb-16">
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
              SECTION 2
            </p>
            <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
              How We Use Your Information
            </h2>
            <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
              <p>We use the information we collect for the following purposes:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span>To process and fulfil your orders, including made-to-order pieces</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span>To communicate with you about orders, deliveries, and account updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span>To personalise your shopping experience and recommend relevant pieces</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span>To send promotional emails and newsletters (with your consent)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span>To improve our website, products, and services</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span>To comply with legal obligations and prevent fraud</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Data Sharing */}
          <div className="mb-16">
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
              SECTION 3
            </p>
            <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
              Data Sharing
            </h2>
            <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share your data with trusted service providers who assist us in operating our business:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span><strong className="text-[#0D2C22]">Payment processors:</strong> Paystack and Flutterwave for secure transaction processing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span><strong className="text-[#0D2C22]">Shipping partners:</strong> DHL, FedEx, and local logistics providers for order delivery</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span><strong className="text-[#0D2C22]">Analytics providers:</strong> To help us understand website usage and improve our services</span>
                </li>
              </ul>
              <p>
                All third-party service providers are contractually obligated to keep your information confidential and use it only for the purposes for which we disclose it to them.
              </p>
            </div>
          </div>

          {/* Cookie Policy */}
          <div className="mb-16">
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
              SECTION 4
            </p>
            <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
              Cookie Policy
            </h2>
            <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
              <p>
                Our website uses cookies and similar tracking technologies to enhance your browsing experience. We use the following types of cookies:
              </p>
              <div className="bg-white border border-neutral-200 p-6 space-y-4">
                <div className="border-b border-neutral-100 pb-4">
                  <h3 className="font-serif text-[#0D2C22] text-lg">Essential Cookies</h3>
                  <p className="text-sm text-neutral-500 mt-1">Required for the website to function, including shopping cart and checkout functionality. These cannot be disabled.</p>
                </div>
                <div className="border-b border-neutral-100 pb-4">
                  <h3 className="font-serif text-[#0D2C22] text-lg">Performance Cookies</h3>
                  <p className="text-sm text-neutral-500 mt-1">Help us understand how visitors interact with our website by collecting anonymous usage data.</p>
                </div>
                <div>
                  <h3 className="font-serif text-[#0D2C22] text-lg">Marketing Cookies</h3>
                  <p className="text-sm text-neutral-500 mt-1">Used to deliver relevant advertisements and track the effectiveness of our marketing campaigns.</p>
                </div>
              </div>
              <p>
                You can manage your cookie preferences through your browser settings. Disabling certain cookies may affect the functionality of our website.
              </p>
            </div>
          </div>

          {/* Your Rights */}
          <div className="mb-16">
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
              SECTION 5
            </p>
            <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
              Your Rights
            </h2>
            <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
              <p>
                In accordance with the Nigeria Data Protection Act (NDPA) 2023 and the EU General Data Protection Regulation (GDPR) where applicable, you have the following rights:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span><strong className="text-[#0D2C22]">Right of access:</strong> Request a copy of the personal data we hold about you</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span><strong className="text-[#0D2C22]">Right to rectification:</strong> Request correction of inaccurate or incomplete data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span><strong className="text-[#0D2C22]">Right to erasure:</strong> Request deletion of your personal data, subject to legal retention requirements</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span><strong className="text-[#0D2C22]">Right to restrict processing:</strong> Request limitation of how we process your data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span><strong className="text-[#0D2C22]">Right to data portability:</strong> Receive your data in a structured, commonly used format</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span><strong className="text-[#0D2C22]">Right to withdraw consent:</strong> Withdraw your consent for marketing communications at any time</span>
                </li>
              </ul>
              <p>
                To exercise any of these rights, please contact us using the details below.
              </p>
            </div>
          </div>

          {/* Contact Us */}
          <div>
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
              SECTION 6
            </p>
            <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
              Contact Us
            </h2>
            <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
              <p>
                If you have any questions about this Privacy Policy or wish to exercise your data protection rights, please contact us:
              </p>
              <div className="bg-white border border-neutral-200 p-6 space-y-2">
                <p><strong className="text-[#0D2C22]">The Heritage Edit</strong></p>
                <p>Data Protection Enquiries</p>
                <p>
                  Email:{" "}
                  <a href="mailto:privacy@theheritageedit.com" className="text-[#B08D57] underline underline-offset-4">
                    privacy@theheritageedit.com
                  </a>
                </p>
                <p>Lagos, Nigeria</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
