import { Metadata } from "next";

export const metadata: Metadata = { title: "Sustainability" };

export default function SustainabilityPage() {
  return (
    <main className="luxury-container py-20 md:py-32 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-serif text-obsidian mb-4">Sustainability</h1>
      <p className="text-sm text-neutral-500 mb-16 leading-relaxed">
        Luxury that honours the earth as much as the artisan.
      </p>

      <section className="mb-14">
        <h2 className="text-base font-serif text-obsidian mb-3">Zero-Waste Production</h2>
        <p className="text-[13px] text-neutral-500 leading-[1.8]">
          Every garment is cut to order — we do not produce surplus inventory. Fabric remnants from our cutting rooms are repurposed into accessories, pocket squares, and gift packaging, or donated to textile training programmes in Lagos and Abeokuta. Our goal is to send zero production waste to landfill by the end of 2026, and we are on track: current diversion rates exceed 94%.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="text-base font-serif text-obsidian mb-3">Ethical Local Sourcing</h2>
        <p className="text-[13px] text-neutral-500 leading-[1.8]">
          Over 85% of our materials are sourced within West Africa. Our hand-woven Aso Oke comes from family-run looms in Iseyin and Oyo, where the craft has been practised for over four centuries. We work directly with weavers, paying above-market rates and guaranteeing seasonal purchase commitments so artisans can plan their livelihoods with confidence. Embroidery threads, beadwork, and trims are sourced from certified suppliers who meet our standards for fair labour and environmental compliance.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="text-base font-serif text-obsidian mb-3">Limited-Run Philosophy</h2>
        <p className="text-[13px] text-neutral-500 leading-[1.8]">
          We deliberately limit each collection to 128 pieces or fewer. This is not a marketing device — it is a production constraint rooted in our commitment to quality and sustainability. Small runs mean every garment receives individual attention from pattern drafting to final pressing. They also mean we never overproduce, never discount to clear stock, and never burn unsold inventory. When a piece sells out, it is gone.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="text-base font-serif text-obsidian mb-3">Packaging & Shipping</h2>
        <p className="text-[13px] text-neutral-500 leading-[1.8]">
          Our shipping boxes are made from 100% recycled corrugated board. Tissue paper is acid-free and FSC-certified. Garment bags are woven from organic cotton and designed to be reused for travel or storage. We have eliminated all single-use plastic from our packaging chain since 2024. For carbon-conscious clients, we offer a carbon-offset option at checkout in partnership with verified reforestation projects in the Niger Delta.
        </p>
      </section>

      <section>
        <h2 className="text-base font-serif text-obsidian mb-3">Our Artisans</h2>
        <p className="text-[13px] text-neutral-500 leading-[1.8]">
          The Heritage Edit employs and partners with over 60 artisans across Nigeria, Ghana, and Kenya. Every artisan receives a living wage, health coverage, and access to skills development workshops. We publish an annual Artisan Impact Report detailing compensation benchmarks, training hours, and community investment. We believe that luxury without dignity is not luxury at all.
        </p>
      </section>
    </main>
  );
}
