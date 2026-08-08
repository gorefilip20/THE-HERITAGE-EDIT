export default function SizingPage() {
  return (
    <main className="bg-ivory min-h-screen">
      <section className="bg-obsidian text-white py-20 md:py-28">
        <div className="luxury-container text-center">
          <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-white/40 mb-4">
            FIT & MEASUREMENTS
          </p>
          <h1 className="font-serif italic text-3xl md:text-5xl mb-4">
            Size Guide
          </h1>
          <p className="text-sm font-sans text-white/60 max-w-xl mx-auto">
            Find your perfect fit across our collections. All measurements in
            centimetres.
          </p>
        </div>
      </section>

      <section className="luxury-container py-16 md:py-24">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Women's */}
          <div>
            <h2 className="font-serif text-2xl text-obsidian mb-2">
              Women&apos;s Tops &amp; Dresses
            </h2>
            <p className="text-sm font-sans text-neutral-400 mb-6">
              Measurements in cm. If between sizes, we recommend sizing up.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans border-collapse">
                <thead>
                  <tr className="border-b border-slate-border bg-white">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Size</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Bust</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Waist</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Hips</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["XXS", "78", "60", "84"],
                    ["XS", "82", "64", "88"],
                    ["S", "86", "68", "92"],
                    ["M", "90", "72", "96"],
                    ["L", "96", "78", "102"],
                    ["XL", "102", "84", "108"],
                    ["XXL", "108", "90", "114"],
                    ["3XL", "116", "98", "122"],
                  ].map(([size, bust, waist, hips]) => (
                    <tr key={size} className="border-b border-slate-border">
                      <td className="px-4 py-3 font-medium text-obsidian">{size}</td>
                      <td className="px-4 py-3 text-center text-neutral-600">{bust}</td>
                      <td className="px-4 py-3 text-center text-neutral-600">{waist}</td>
                      <td className="px-4 py-3 text-center text-neutral-600">{hips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Men's */}
          <div>
            <h2 className="font-serif text-2xl text-obsidian mb-2">
              Men&apos;s Shirts &amp; Agbada
            </h2>
            <p className="text-sm font-sans text-neutral-400 mb-6">
              Measurements in cm.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans border-collapse">
                <thead>
                  <tr className="border-b border-slate-border bg-white">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Size</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Chest</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Shoulders</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Length</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["S", "92", "44", "72"],
                    ["M", "98", "46", "74"],
                    ["L", "104", "48", "76"],
                    ["XL", "110", "50", "78"],
                    ["XXL", "116", "52", "80"],
                    ["3XL", "122", "54", "82"],
                  ].map(([size, chest, shoulders, length]) => (
                    <tr key={size} className="border-b border-slate-border">
                      <td className="px-4 py-3 font-medium text-obsidian">{size}</td>
                      <td className="px-4 py-3 text-center text-neutral-600">{chest}</td>
                      <td className="px-4 py-3 text-center text-neutral-600">{shoulders}</td>
                      <td className="px-4 py-3 text-center text-neutral-600">{length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Made-to-Measure */}
          <div className="bg-white border border-slate-border p-8 md:p-12">
            <p className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-heritage-green/50 mb-3">
              BESPOKE SERVICE
            </p>
            <h3 className="font-serif text-xl text-obsidian mb-4">
              Made-to-Measure
            </h3>
            <p className="text-[14px] font-sans text-neutral-500 leading-relaxed mb-6">
              For the ultimate fit, choose our Made-to-Measure option at checkout.
              Our team will contact you to collect precise measurements for bust,
              waist, hips, shoulder width, arm length, and garment length. Your
              piece will be hand-tailored by our master artisans to your exact
              specifications within 10–14 business days.
            </p>
            <a
              href="/contact"
              className="inline-flex h-12 px-8 items-center bg-heritage-green text-white text-[11px] font-sans font-semibold tracking-[0.2em] uppercase hover:bg-[#163829] transition-colors"
            >
              Request Measurement Guide
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
