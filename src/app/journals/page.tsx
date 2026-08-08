import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "The Heritage Edit Journals" };

const JOURNALS = [
  {
    tag: "Craft",
    title: "The Iseyin Looms: Four Centuries of Aso Oke",
    excerpt: "Inside the family workshops where hand-woven Aso Oke cloth is still made on wooden broadlooms passed down through generations — and how The Heritage Edit is bringing this living tradition to a global audience.",
    date: "July 2025",
  },
  {
    tag: "Collection",
    title: "Drop 003: The Midnight Senator",
    excerpt: "A deep dive into the design process behind our most requested silhouette — the structured Senator top with concealed placket, cut from midnight indigo Italian-milled wool, finished with hand-stitched Uli motifs along the collar stand.",
    date: "June 2025",
  },
  {
    tag: "Culture",
    title: "Nsibidi: The Language Before Language",
    excerpt: "How the ancient Nsibidi ideographic system — once used by Igbo and Efik secret societies — informs our embroidery patterns, brand mark, and the visual identity of every Heritage Edit collection.",
    date: "May 2025",
  },
  {
    tag: "People",
    title: "Master Tailor: Baba Oja of Lagos",
    excerpt: "At 74, Alhaji Ibrahim Adekunle — known to everyone in Balogun Market as Baba Oja — has dressed governors, kings, and three generations of Lagos high society. He now leads our Agbada atelier.",
    date: "April 2025",
  },
  {
    tag: "Campaign",
    title: "Behind the Lens: Shooting Drop 002 in Osun Grove",
    excerpt: "Our creative director shares the story behind shooting our second collection in the sacred Osun-Osogbo Grove — a UNESCO World Heritage Site — and the months of community engagement that made it possible.",
    date: "March 2025",
  },
  {
    tag: "Sustainability",
    title: "Zero-Waste Cutting: How We Use Every Centimetre",
    excerpt: "From pocket squares made of offcuts to gift wrapping crafted from remnant Aso Oke, here is how our production team achieves a 94% waste diversion rate across all ateliers.",
    date: "February 2025",
  },
];

export default function JournalsPage() {
  return (
    <main className="luxury-container py-20 md:py-32">
      <h1 className="text-3xl md:text-4xl font-serif text-obsidian mb-4">The Heritage Edit Journals</h1>
      <p className="text-sm text-neutral-500 mb-16 leading-relaxed max-w-2xl">
        Stories behind the collections, the artisans, and the traditions that shape every piece we make.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
        {JOURNALS.map((journal) => (
          <article key={journal.title} className="group">
            <div className="aspect-[16/9] bg-neutral-100 mb-5 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                <span className="text-[11px] font-sans tracking-[0.15em] uppercase text-neutral-300">
                  Editorial
                </span>
              </div>
            </div>
            <p className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-heritage-green mb-2">
              {journal.tag} &middot; {journal.date}
            </p>
            <h2 className="text-lg font-serif text-obsidian mb-2 group-hover:text-heritage-green transition-colors">
              {journal.title}
            </h2>
            <p className="text-[13px] text-neutral-500 leading-relaxed">
              {journal.excerpt}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
