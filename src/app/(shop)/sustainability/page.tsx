export default function SustainabilityPage() {
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
            OUR VALUES
          </p>
          <h1 className="text-display-lg font-serif mb-6">
            Our Commitment to Sustainability
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Luxury and responsibility are not opposites. Every piece we curate reflects our dedication to people, planet, and cultural heritage.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-base text-neutral-600 leading-relaxed max-w-3xl mx-auto">
              At The Heritage Edit, sustainability is woven into the fabric of everything we do. From the hands that craft our garments to the communities they sustain, we believe that true luxury honours the people and traditions behind every thread.
            </p>
          </div>

          {/* Pillar 1: Artisan Empowerment */}
          <div className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="bg-neutral-200 aspect-[4/5] flex items-center justify-center">
                <p className="text-neutral-400 font-sans text-sm">Artisan at work</p>
              </div>
              <div>
                <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
                  PILLAR ONE
                </p>
                <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
                  Artisan Empowerment
                </h2>
                <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
                  <p>
                    We work directly with over 200 artisans across Nigeria, Ghana, and Senegal, ensuring fair wages and dignified working conditions. Our partnerships go beyond transactions; we invest in training programmes, provide access to quality materials, and help artisan cooperatives grow sustainably.
                  </p>
                  <p>
                    From master Aso-Oke weavers in Iseyin to Adire artists in Abeokuta and Kente craftspeople in Bonwire, every artisan in our network receives above-market compensation and long-term partnership commitments.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 2: Ethical Sourcing */}
          <div className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
                  PILLAR TWO
                </p>
                <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
                  Ethical Sourcing
                </h2>
                <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
                  <p>
                    Every material in our collections is responsibly sourced. We prioritise organic cotton from West African farms, naturally derived indigo dyes for our Adire textiles, and locally produced silk from artisan cooperatives.
                  </p>
                  <p>
                    We maintain full traceability across our supply chain, from raw fibre to finished garment. Our commitment extends to packaging: we use recycled kraft paper, biodegradable garment bags, and soy-based inks for all printed materials.
                  </p>
                </div>
              </div>
              <div className="order-1 md:order-2 bg-neutral-200 aspect-[4/5] flex items-center justify-center">
                <p className="text-neutral-400 font-sans text-sm">Fabric sourcing</p>
              </div>
            </div>
          </div>

          {/* Pillar 3: Slow Fashion */}
          <div className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="bg-neutral-200 aspect-[4/5] flex items-center justify-center">
                <p className="text-neutral-400 font-sans text-sm">Handcrafted garment</p>
              </div>
              <div>
                <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
                  PILLAR THREE
                </p>
                <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
                  Slow Fashion
                </h2>
                <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
                  <p>
                    We reject the cycle of disposable fashion. Our made-to-order model means we produce only what is needed, eliminating the overproduction and waste that plague the industry. Each garment is crafted with intention, built to be worn, cherished, and passed down.
                  </p>
                  <p>
                    By choosing quality over quantity and timeless design over fleeting trends, we create pieces that transcend seasons. Our Aso-Oke and Kente garments are heirloom pieces, designed to last a lifetime and beyond.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 4: Cultural Preservation */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
                  PILLAR FOUR
                </p>
                <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
                  Cultural Preservation
                </h2>
                <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
                  <p>
                    Many of Africa&apos;s textile traditions are at risk of being lost as younger generations move away from artisanal crafts. We see it as our responsibility to preserve these heritage techniques by creating a viable, global market for them.
                  </p>
                  <p>
                    Through our Artisan Apprenticeship Programme, we fund training for the next generation of weavers, dyers, and textile artists. We document traditional techniques, support master artisans in mentoring apprentices, and ensure that the stories behind each craft are shared with the world.
                  </p>
                </div>
              </div>
              <div className="order-1 md:order-2 bg-neutral-200 aspect-[4/5] flex items-center justify-center">
                <p className="text-neutral-400 font-sans text-sm">Heritage techniques</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="py-20 md:py-28 bg-[#0D2C22] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
              OUR IMPACT
            </p>
            <h2 className="text-display-sm font-serif">
              Numbers That Matter
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-serif text-[#B08D57] mb-2">200+</p>
              <p className="text-sm text-white/60 font-sans">Artisans Supported</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-serif text-[#B08D57] mb-2">85%</p>
              <p className="text-sm text-white/60 font-sans">Locally Sourced Materials</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-serif text-[#B08D57] mb-2">Zero</p>
              <p className="text-sm text-white/60 font-sans">Overproduction Waste</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-serif text-[#B08D57] mb-2">12</p>
              <p className="text-sm text-white/60 font-sans">Communities Empowered</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
