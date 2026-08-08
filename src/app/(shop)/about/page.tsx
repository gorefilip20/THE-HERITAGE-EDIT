import Link from "next/link";
import Image from "next/image";

const ARTISANS = [
  {
    name: "Adebayo Ogunlesi",
    craft: "Master Aso Oke Weaver",
    location: "Iseyin, Oyo State",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face",
  },
  {
    name: "Ngozi Okafor",
    craft: "Adire Textile Artist",
    location: "Abeokuta, Ogun State",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&crop=face",
  },
  {
    name: "Kwame Asante",
    craft: "Kente Master Weaver",
    location: "Bonwire, Ashanti Region",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&crop=face",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[#FBFBFA]">
      {/* Hero */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-[#0D2C22] to-[#2E1A47] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-gold mb-4">
            Our Story
          </p>
          <h1 className="text-display-lg font-serif mb-6">
            Celebrating Africa&apos;s<br />Sartorial Heritage
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            The Heritage Edit is a luxury fashion destination that bridges the richness of African textile traditions with contemporary global style.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-gold mb-4">
                Our Mission
              </p>
              <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
                Connecting Cultures Through Fashion
              </h2>
              <p className="text-base text-neutral-600 leading-relaxed mb-4">
                We believe that every garment tells a story. From the intricate patterns of Kente cloth to the bold prints of Ankara, African textiles carry centuries of cultural wisdom, artistic expression, and communal identity.
              </p>
              <p className="text-base text-neutral-600 leading-relaxed mb-4">
                The Heritage Edit curates the finest African-inspired fashion, making it accessible to a global audience while ensuring that the artisans and communities behind each piece are honored and fairly compensated.
              </p>
              <p className="text-base text-neutral-600 leading-relaxed">
                Our platform uses AI-powered heritage narratives to educate customers about the cultural significance of each garment, transforming every purchase into a meaningful cultural exchange.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] bg-gradient-to-br from-[#0D2C22]/10 to-[#2E1A47]/10 flex items-center justify-center">
                <div className="text-center px-8">
                  <p className="text-6xl font-serif text-[#0D2C22]/20 mb-4">&ldquo;</p>
                  <p className="text-lg font-serif text-[#0D2C22] italic leading-relaxed">
                    Fashion is the armor to survive the reality of everyday life.
                  </p>
                  <p className="text-sm text-neutral-500 mt-4">— Bill Cunningham</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white border-y border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-gold mb-4">
              Our Values
            </p>
            <h2 className="text-display-sm font-serif text-[#0D2C22]">
              What We Stand For
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Cultural Authenticity",
                description: "Every product on our platform is verified for cultural authenticity. We work directly with artisans and designers who understand and respect the traditions they draw from.",
              },
              {
                title: "Sustainable Luxury",
                description: "We champion sustainable practices across our supply chain. From ethically sourced materials to fair-trade partnerships, luxury and responsibility go hand in hand.",
              },
              {
                title: "Global Accessibility",
                description: "African fashion deserves a global stage. We make premium African-inspired clothing accessible to fashion lovers worldwide with seamless international shipping.",
              },
            ].map((value, idx) => (
              <div key={idx} className="p-8 border border-neutral-200 hover:border-[#0D2C22]/20 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-[#0D2C22]/5 flex items-center justify-center mb-4">
                  <span className="text-lg font-serif text-[#0D2C22]">{idx + 1}</span>
                </div>
                <h3 className="text-base font-semibold text-neutral-800 mb-3">{value.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Artisan Profiles */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-gold mb-4">
              The Artisans
            </p>
            <h2 className="text-display-sm font-serif text-[#0D2C22]">
              The Hands Behind the Heritage
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ARTISANS.map((artisan) => (
              <div key={artisan.name} className="text-center">
                <div className="relative aspect-[4/5] mb-6 overflow-hidden bg-neutral-100">
                  <Image
                    src={artisan.image}
                    alt={artisan.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover grayscale"
                  />
                </div>
                <h3 className="text-base font-serif text-[#0D2C22] mb-1">{artisan.name}</h3>
                <p className="text-[13px] font-sans text-neutral-500 mb-0.5">{artisan.craft}</p>
                <p className="text-[12px] font-sans text-neutral-400">{artisan.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-display-sm font-serif text-[#0D2C22] mb-4">
            Join the Heritage Movement
          </h2>
          <p className="text-base text-neutral-500 mb-8 max-w-2xl mx-auto">
            Discover pieces that honor tradition while embracing modern elegance. Every purchase supports African artisans and preserves cultural heritage.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center h-12 px-8 bg-[#0D2C22] text-white text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-[#163829] transition-colors"
          >
            Explore the Collection
          </Link>
        </div>
      </section>
    </div>
  );
}
