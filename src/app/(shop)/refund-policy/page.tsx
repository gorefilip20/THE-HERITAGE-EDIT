export default function RefundPolicyPage() {
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
            OUR POLICY
          </p>
          <h1 className="text-display-lg font-serif mb-6">
            Returns &amp; Exchanges
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            We want you to love every piece you receive. If something does not feel right, we are here to help.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Return Window */}
          <div className="mb-16">
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
              RETURN WINDOW
            </p>
            <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
              14-Day Return Policy
            </h2>
            <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
              <p>
                We accept returns within 14 days of delivery. To be eligible for a return, items must meet the following conditions:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span>Items must be unworn, unwashed, and in their original condition</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span>All original tags, labels, and packaging must be attached and intact</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span>Items must be free from perfume, deodorant, or any other scent</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span>A proof of purchase (order confirmation email or receipt) is required</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Final Sale */}
          <div className="mb-16">
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
              NON-RETURNABLE ITEMS
            </p>
            <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
              Final Sale Items
            </h2>
            <div className="bg-[#0D2C22] text-white p-8">
              <p className="text-white/80 leading-relaxed mb-4">
                The following items are considered final sale and cannot be returned or exchanged:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span className="text-white/80">Made-to-order and bespoke garments crafted to your measurements</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span className="text-white/80">Personalised or monogrammed items</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span className="text-white/80">Items purchased during final sale or clearance events</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#B08D57] mt-2 flex-shrink-0" />
                  <span className="text-white/80">Intimate apparel and swimwear for hygiene reasons</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Refund Process */}
          <div className="mb-16">
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
              REFUND TIMELINE
            </p>
            <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
              Refund Process
            </h2>
            <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
              <p>
                Once we receive and inspect your returned item, we will notify you via email about the status of your refund.
              </p>
              <div className="bg-white border border-neutral-200 p-6 space-y-4">
                <div className="flex justify-between items-start border-b border-neutral-100 pb-4">
                  <div>
                    <h3 className="font-serif text-[#0D2C22] text-lg">Inspection</h3>
                    <p className="text-sm text-neutral-500 mt-1">Item received at our warehouse</p>
                  </div>
                  <p className="font-sans text-[#0D2C22] font-medium text-sm">1&ndash;2 business days</p>
                </div>
                <div className="flex justify-between items-start border-b border-neutral-100 pb-4">
                  <div>
                    <h3 className="font-serif text-[#0D2C22] text-lg">Refund Initiated</h3>
                    <p className="text-sm text-neutral-500 mt-1">Credited to your original payment method</p>
                  </div>
                  <p className="font-sans text-[#0D2C22] font-medium text-sm">3&ndash;5 business days</p>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-[#0D2C22] text-lg">Bank Processing</h3>
                    <p className="text-sm text-neutral-500 mt-1">Depending on your bank or payment provider</p>
                  </div>
                  <p className="font-sans text-[#0D2C22] font-medium text-sm">1&ndash;3 business days</p>
                </div>
              </div>
              <p className="text-sm text-neutral-500">
                Total estimated refund timeline: 5&ndash;10 business days from when we receive your return.
              </p>
            </div>
          </div>

          {/* Exchange Process */}
          <div className="mb-16">
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
              EXCHANGE
            </p>
            <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
              Exchange Process
            </h2>
            <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
              <p>
                If you would like to exchange an item for a different size or colour, please initiate a return and place a new order for the desired item. This ensures the fastest processing time and guarantees availability.
              </p>
              <p>
                For assistance with sizing before placing an exchange, consult our{" "}
                <a href="/sizing" className="text-[#B08D57] underline underline-offset-4">
                  Size Guide
                </a>{" "}
                or contact our styling team.
              </p>
            </div>
          </div>

          {/* How to Return */}
          <div>
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
              GETTING STARTED
            </p>
            <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
              How to Initiate a Return
            </h2>
            <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
              <p>
                To start a return, email us at{" "}
                <a href="mailto:returns@theheritageedit.com" className="text-[#B08D57] underline underline-offset-4">
                  returns@theheritageedit.com
                </a>{" "}
                with your order number, the item(s) you wish to return, and the reason for your return. Our team will respond within 24 hours with a return authorisation and shipping instructions.
              </p>
              <p>
                Return shipping costs are the responsibility of the customer unless the item arrived damaged or defective. We recommend using a tracked shipping service to ensure your return reaches us safely.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
