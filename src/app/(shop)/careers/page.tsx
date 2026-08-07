export default function CareersPage() {
  const positions = [
    {
      title: "Creative Director",
      department: "Design",
      location: "Lagos, Nigeria",
      type: "Full-time",
      description:
        "Lead the creative vision across all collections, campaigns, and brand touchpoints. You will work closely with our artisan partners and design team to shape the future of African luxury fashion.",
    },
    {
      title: "Digital Marketing Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      description:
        "Drive brand awareness and customer acquisition across digital channels. You will own our social media strategy, email marketing, influencer partnerships, and paid advertising campaigns.",
    },
    {
      title: "Artisan Relations Coordinator",
      department: "Operations",
      location: "Lagos, Nigeria",
      type: "Full-time",
      description:
        "Manage relationships with our network of 200+ artisans across West Africa. You will oversee quality assurance, production timelines, and our artisan empowerment programmes.",
    },
    {
      title: "Customer Experience Specialist",
      department: "Client Services",
      location: "Remote",
      type: "Full-time",
      description:
        "Deliver world-class service to our global clientele. You will handle enquiries, styling consultations, order management, and ensure every customer interaction reflects our brand values.",
    },
  ];

  return (
    <main className="bg-ivory min-h-screen">
      <section className="bg-obsidian text-white py-20 md:py-28">
        <div className="luxury-container text-center">
          <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-white/40 mb-4">
            JOIN US
          </p>
          <h1 className="font-serif italic text-3xl md:text-5xl mb-4">
            Join Our Team
          </h1>
          <p className="text-sm font-sans text-white/60 max-w-xl mx-auto">
            Help us bring African luxury fashion to the world stage.
          </p>
        </div>
      </section>

      <section className="luxury-container py-16 md:py-24">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <p className="text-[15px] font-sans text-neutral-600 leading-relaxed">
            The Heritage Edit is more than a fashion platform — we are a
            movement to celebrate, preserve, and elevate African craftsmanship.
            We are looking for passionate individuals who share our vision of
            redefining luxury through cultural heritage.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {positions.map((pos, i) => (
            <div
              key={i}
              className="bg-white border border-slate-border p-6 md:p-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-serif text-lg text-obsidian mb-1">
                    {pos.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-[11px] font-sans text-neutral-400">
                    <span>{pos.department}</span>
                    <span className="text-neutral-200">|</span>
                    <span>{pos.location}</span>
                    <span className="text-neutral-200">|</span>
                    <span>{pos.type}</span>
                  </div>
                </div>
                <a
                  href={`mailto:careers@theheritageedit.com?subject=Application: ${pos.title}`}
                  className="shrink-0 inline-flex h-10 px-6 items-center bg-heritage-green text-white text-[10px] font-sans font-semibold tracking-[0.2em] uppercase hover:bg-[#163829] transition-colors"
                >
                  Apply
                </a>
              </div>
              <p className="text-[14px] font-sans text-neutral-500 leading-relaxed">
                {pos.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm font-sans text-neutral-500 mb-2">
            Don&apos;t see a role that fits?
          </p>
          <p className="text-sm font-sans text-neutral-400">
            Send your CV and a note to{" "}
            <a
              href="mailto:careers@theheritageedit.com"
              className="text-heritage-green hover:underline"
            >
              careers@theheritageedit.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
