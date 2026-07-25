import { Metadata } from "next";

export const metadata: Metadata = { title: "Sizing Guide" };

const MEASUREMENTS = [
  { name: "Chest", description: "Measure around the fullest part of your chest, keeping the tape level under your arms and across your shoulder blades." },
  { name: "Shoulder", description: "Measure from the edge of one shoulder seam straight across the back to the other shoulder seam." },
  { name: "Arm Length", description: "With your arm slightly bent, measure from the shoulder point down to just past the wrist bone." },
  { name: "Torso Length", description: "Measure from the base of the neck at the centre back, down to the natural waist." },
  { name: "Hip", description: "Measure around the fullest part of your hips, approximately 20 cm below your natural waist." },
  { name: "Thigh", description: "Measure around the fullest part of your upper thigh, directly below the groin." },
];

const GARMENT_GUIDES = [
  {
    garment: "Agbada",
    notes: "Our Agbada is cut with a generous, flowing silhouette. Chest and shoulder measurements are critical — the outer robe (Agbada) drapes from the shoulders and should hang approximately 10 cm past the fingertips. We recommend adding 5–8 cm of ease to your chest measurement for the inner Buba. Typical lengths: short Agbada to the knee, full Agbada to the ankle.",
  },
  {
    garment: "Kaftan",
    notes: "Kaftans follow a relaxed, straight-cut pattern. Key measurements are chest circumference, torso length (for determining the overall garment length), and arm length. Our standard Kaftan falls mid-calf; specify ankle-length or knee-length if preferred. Neckline options include Mandarin collar, V-cut, or round.",
  },
  {
    garment: "Aso Oke Structured Fits",
    notes: "Hand-woven Aso Oke fabric has minimal stretch. Precise measurements are essential — we recommend professional measurement for structured pieces like the Aso Oke Fila (cap), Ipele (shoulder sash), and Iro (wrapper). Fila sizing requires head circumference. Iro wraps are cut to waist-to-ankle length plus 15 cm for folding and tucking.",
  },
  {
    garment: "Senator Wear",
    notes: "Senator tops are fitted through the shoulders and chest with a straight hem. Trousers follow a tapered or straight-leg cut. Provide chest, waist, hip, inseam, and arm length. Our Senator silhouette sits at the natural waist — measure accordingly.",
  },
];

export default function SizingPage() {
  return (
    <main className="luxury-container py-20 md:py-32 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-serif text-obsidian mb-4">Sizing Guide</h1>
      <p className="text-sm text-neutral-500 mb-16 leading-relaxed">
        Every Heritage Edit piece is crafted to your measurements. Use this guide to take accurate body measurements before placing your order.
      </p>

      <section className="mb-16">
        <h2 className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-6">
          How to Measure
        </h2>
        <div className="space-y-6">
          {MEASUREMENTS.map((m) => (
            <div key={m.name} className="border-b border-neutral-100 pb-5">
              <h3 className="text-sm font-medium text-obsidian mb-1">{m.name}</h3>
              <p className="text-[13px] text-neutral-500 leading-relaxed">{m.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-6">
          Garment-Specific Guidance
        </h2>
        <div className="space-y-8">
          {GARMENT_GUIDES.map((g) => (
            <div key={g.garment}>
              <h3 className="text-base font-serif text-obsidian mb-2">{g.garment}</h3>
              <p className="text-[13px] text-neutral-500 leading-[1.8]">{g.notes}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-neutral-200 pt-10 mt-16">
        <p className="text-sm text-neutral-500 leading-relaxed">
          Need help? Our concierge team offers virtual sizing consultations via WhatsApp or video call.
          Reach us at{" "}
          <a href="mailto:concierge@heritageedit.com" className="text-heritage-green underline">
            concierge@heritageedit.com
          </a>.
        </p>
      </div>
    </main>
  );
}
