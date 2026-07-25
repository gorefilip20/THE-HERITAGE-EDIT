import { Metadata } from "next";

export const metadata: Metadata = { title: "Careers" };

const ROLES = [
  {
    department: "Design",
    positions: [
      { title: "Senior Textile Designer", location: "Lagos, Nigeria", type: "Full-time" },
      { title: "Pattern Drafter — Agbada & Kaftan", location: "Lagos, Nigeria", type: "Full-time" },
      { title: "Embroidery Artisan Lead", location: "Lagos, Nigeria", type: "Contract" },
    ],
  },
  {
    department: "Production",
    positions: [
      { title: "Quality Control Supervisor", location: "Lagos, Nigeria", type: "Full-time" },
      { title: "Master Tailor — Aso Oke Structures", location: "Abeokuta, Nigeria", type: "Full-time" },
    ],
  },
  {
    department: "Digital & Curation",
    positions: [
      { title: "E-Commerce Product Manager", location: "Remote (WAT hours)", type: "Full-time" },
      { title: "Visual Merchandiser & Stylist", location: "Lagos, Nigeria", type: "Full-time" },
      { title: "Content Editor — Heritage Journals", location: "Remote", type: "Part-time" },
    ],
  },
];

export default function CareersPage() {
  return (
    <main className="luxury-container py-20 md:py-32">
      <h1 className="text-3xl md:text-4xl font-serif text-obsidian mb-4">Careers</h1>
      <p className="text-sm text-neutral-500 max-w-2xl mb-16 leading-relaxed">
        Join our mission to bring Africa&apos;s finest textile heritage to the global luxury stage.
        We are always looking for artisans, creatives, and operators who share our obsession with craft.
      </p>

      {ROLES.map((dept) => (
        <section key={dept.department} className="mb-14">
          <h2 className="text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-6">
            {dept.department}
          </h2>
          <div className="space-y-4">
            {dept.positions.map((pos) => (
              <div
                key={pos.title}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-neutral-200 hover:border-neutral-400 transition-colors"
              >
                <div>
                  <h3 className="text-sm font-medium text-obsidian">{pos.title}</h3>
                  <p className="text-xs text-neutral-400 mt-1">{pos.location} &middot; {pos.type}</p>
                </div>
                <a
                  href={`mailto:careers@heritageedit.com?subject=Application: ${pos.title}`}
                  className="mt-3 sm:mt-0 text-[11px] font-sans font-medium tracking-[0.1em] uppercase text-heritage-green hover:underline"
                >
                  Apply
                </a>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="border-t border-neutral-200 pt-10 mt-10">
        <p className="text-sm text-neutral-500 leading-relaxed max-w-xl">
          Don&apos;t see your role? Send your portfolio and a note about what excites you about African luxury to{" "}
          <a href="mailto:careers@heritageedit.com" className="text-heritage-green underline">
            careers@heritageedit.com
          </a>.
        </p>
      </div>
    </main>
  );
}
