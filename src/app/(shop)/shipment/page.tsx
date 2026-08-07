export default function ShipmentPage() {
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
            DELIVERY INFORMATION
          </p>
          <h1 className="text-display-lg font-serif mb-6">
            Shipping &amp; Delivery
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            We deliver heritage craftsmanship to your doorstep with care and precision, ensuring every piece arrives in pristine condition.
          </p>
        </div>
      </section>

      {/* Domestic Shipping */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
              WITHIN NIGERIA
            </p>
            <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
              Domestic Shipping
            </h2>
            <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
              <p>
                We deliver to all 36 states across Nigeria. Standard domestic orders are dispatched within 1&ndash;2 business days of purchase confirmation.
              </p>
              <div className="bg-white border border-neutral-200 p-6 space-y-4">
                <div className="flex justify-between items-start border-b border-neutral-100 pb-4">
                  <div>
                    <h3 className="font-serif text-[#0D2C22] text-lg">Standard Delivery</h3>
                    <p className="text-sm text-neutral-500 mt-1">3&ndash;5 business days</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-[#0D2C22] font-medium">{"₦"}4,500</p>
                    <p className="text-xs text-neutral-400 mt-1">Flat rate</p>
                  </div>
                </div>
                <div className="flex justify-between items-start border-b border-neutral-100 pb-4">
                  <div>
                    <h3 className="font-serif text-[#0D2C22] text-lg">Express Delivery</h3>
                    <p className="text-sm text-neutral-500 mt-1">1&ndash;2 business days</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-[#0D2C22] font-medium">{"₦"}8,500</p>
                    <p className="text-xs text-neutral-400 mt-1">Lagos, Abuja, Port Harcourt</p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-[#0D2C22] text-lg">Free Shipping</h3>
                    <p className="text-sm text-neutral-500 mt-1">Orders over {"₦"}250,000</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-[#B08D57] font-medium">Complimentary</p>
                    <p className="text-xs text-neutral-400 mt-1">Standard delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* International Shipping */}
          <div className="mb-16">
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
              WORLDWIDE
            </p>
            <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
              International Shipping
            </h2>
            <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
              <p>
                We partner with DHL and FedEx to deliver your orders safely across the globe. International shipments are fully tracked and insured.
              </p>
              <div className="bg-white border border-neutral-200 p-6 space-y-4">
                <div className="flex justify-between items-start border-b border-neutral-100 pb-4">
                  <div>
                    <h3 className="font-serif text-[#0D2C22] text-lg">West Africa</h3>
                    <p className="text-sm text-neutral-500 mt-1">Ghana, Senegal, C&ocirc;te d&apos;Ivoire &amp; more</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-[#0D2C22] font-medium">5&ndash;7 business days</p>
                    <p className="text-xs text-neutral-400 mt-1">From {"₦"}15,000</p>
                  </div>
                </div>
                <div className="flex justify-between items-start border-b border-neutral-100 pb-4">
                  <div>
                    <h3 className="font-serif text-[#0D2C22] text-lg">Rest of Africa</h3>
                    <p className="text-sm text-neutral-500 mt-1">South Africa, Kenya, Ethiopia &amp; more</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-[#0D2C22] font-medium">5&ndash;9 business days</p>
                    <p className="text-xs text-neutral-400 mt-1">From {"₦"}22,000</p>
                  </div>
                </div>
                <div className="flex justify-between items-start border-b border-neutral-100 pb-4">
                  <div>
                    <h3 className="font-serif text-[#0D2C22] text-lg">Europe &amp; Americas</h3>
                    <p className="text-sm text-neutral-500 mt-1">UK, US, Canada, EU &amp; more</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-[#0D2C22] font-medium">7&ndash;9 business days</p>
                    <p className="text-xs text-neutral-400 mt-1">From {"₦"}28,000</p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-[#0D2C22] text-lg">Asia &amp; Oceania</h3>
                    <p className="text-sm text-neutral-500 mt-1">UAE, Australia, Japan &amp; more</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-[#0D2C22] font-medium">7&ndash;9 business days</p>
                    <p className="text-xs text-neutral-400 mt-1">From {"₦"}32,000</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-neutral-500">
                International duties and import taxes are the responsibility of the recipient and are not included in the shipping cost.
              </p>
            </div>
          </div>

          {/* Made-to-Order */}
          <div className="mb-16">
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
              BESPOKE PIECES
            </p>
            <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
              Made-to-Order Items
            </h2>
            <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
              <p>
                Our made-to-order pieces are crafted by hand by skilled artisans across Nigeria and West Africa. Because each garment is created specifically for you, please allow additional time for production.
              </p>
              <div className="bg-[#0D2C22] text-white p-8">
                <h3 className="font-serif text-xl mb-4">Production Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-[#B08D57] text-white text-sm font-sans font-semibold flex-shrink-0">1</span>
                    <p className="text-white/80 text-sm">Order confirmed and artisan notified (1&ndash;2 days)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-[#B08D57] text-white text-sm font-sans font-semibold flex-shrink-0">2</span>
                    <p className="text-white/80 text-sm">Fabric sourcing and preparation (2&ndash;3 days)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-[#B08D57] text-white text-sm font-sans font-semibold flex-shrink-0">3</span>
                    <p className="text-white/80 text-sm">Handcrafting and quality inspection (7&ndash;10 days)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-[#B08D57] text-white text-sm font-sans font-semibold flex-shrink-0">4</span>
                    <p className="text-white/80 text-sm">Shipping to your location (see delivery times above)</p>
                  </div>
                </div>
                <p className="text-white/60 text-sm mt-6">
                  Total estimated timeline: 10&ndash;14 business days plus shipping.
                </p>
              </div>
            </div>
          </div>

          {/* Order Tracking */}
          <div>
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
              STAY INFORMED
            </p>
            <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
              Order Tracking
            </h2>
            <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
              <p>
                Once your order has been dispatched, you will receive a confirmation email containing your tracking number and a direct link to track your shipment in real time.
              </p>
              <p>
                For domestic orders, tracking is available through our logistics partners. International shipments can be tracked directly on the DHL or FedEx website using the tracking number provided.
              </p>
              <p>
                If you have any questions about your delivery, please contact our customer care team at{" "}
                <a href="mailto:hello@theheritageedit.com" className="text-[#B08D57] underline underline-offset-4">
                  hello@theheritageedit.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
