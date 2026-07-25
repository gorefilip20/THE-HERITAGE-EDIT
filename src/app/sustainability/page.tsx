import { Metadata } from "next";

export const metadata: Metadata = { title: "Sustainability" };

const PILLARS = [
  {
    num: "01",
    title: "Zero-Waste Production",
    body: "Every garment is cut to order — we do not produce surplus inventory. Fabric remnants from our cutting rooms are repurposed into accessories, pocket squares, and gift packaging, or donated to textile training programmes in Lagos and Abeokuta. Our goal is to send zero production waste to landfill by the end of 2026, and we are on track: current diversion rates exceed 94%.",
  },
  {
    num: "02",
    title: "Ethical Local Sourcing",
    body: "Over 85% of our materials are sourced within West Africa. Our hand-woven Aso Oke comes from family-run looms in Iseyin and Oyo, where the craft has been practised for over four centuries. We work directly with weavers, paying above-market rates and guaranteeing seasonal purchase commitments so artisans can plan their livelihoods with confidence.",
  },
  {
    num: "03",
    title: "Limited-Run Philosophy",
    body: "We deliberately limit each collection to 128 pieces or fewer. Small runs mean every garment receives individual attention from pattern drafting to final pressing. They also mean we never overproduce, never discount to clear stock, and never burn unsold inventory. When a piece sells out, it is gone.",
  },
  {
    num: "04",
    title: "Our Artisans",
    body: "The Heritage Edit employs and partners with over 60 artisans across Nigeria, Ghana, and Kenya. Every artisan receives a living wage, health coverage, and access to skills development workshops. We publish an annual Artisan Impact Report detailing compensation benchmarks, training hours, and community investment.",
  },
];

export default function SustainabilityPage() {
  return (
    <main>
      {/* Dark Hero */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-[#0D2C22] via-[#1a4a3a] to-[#2E1A47] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/10 translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="luxury-container relative z-10 text-center">
          <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-gold mb-4">
            Our Commitment
          </p>
          <h1 className="text-display-md md:text-display-lg font-serif mb-6">
            Sustainability
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Luxury that honours the earth as much as the artisan. Every decision
            we make — from sourcing to packaging — is guided by respect for
            people and planet.
          </p>
        </div>
      </section>

      {/* Numbered Pillars */}
      <section className="luxury-container py-20 md:py-28 max-w-4xl">
        <div className="space-y-20">
          {PILLARS.map((pillar) => (
            <div key={pillar.num} className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-6 md:gap-10">
              <span className="text-display-md font-serif text-gold">
                {pillar.num}
              </span>
              <div>
                <h2 className="text-xl font-serif text-obsidian mb-4">
                  {pillar.title}
                </h2>
                <p className="text-[14px] text-neutral-600 leading-[1.8]">
                  {pillar.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Packaging & Shipping */}
      <section className="bg-neutral-50 border-t border-slate-border">
        <div className="luxury-container py-20 md:py-24 max-w-4xl">
          <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-gold mb-4">
            Packaging
          </p>
          <h2 className="text-display-sm font-serif text-obsidian mb-6">
            Considered Down to the Last Thread
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <p className="text-[14px] text-neutral-600 leading-[1.8]">
              Our shipping boxes are made from 100% recycled corrugated board.
              Tissue paper is acid-free and FSC-certified. Garment bags are woven
              from organic cotton and designed to be reused for travel or
              storage. We have eliminated all single-use plastic from our
              packaging chain since 2024.
            </p>
            <p className="text-[14px] text-neutral-600 leading-[1.8]">
              For carbon-conscious clients, we offer a carbon-offset option at
              checkout in partnership with verified reforestation projects in the
              Niger Delta. Every shipment is fully insured and tracked, with
              signature confirmation at no additional cost.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
