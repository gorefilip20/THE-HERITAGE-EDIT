const POSITIONS = [
  {
    title: "Creative Director",
    location: "Lagos, Nigeria",
    type: "Full-time",
    description:
      "Lead the creative vision for The Heritage Edit, overseeing brand identity, campaign direction, and product presentation. You will shape how African luxury fashion is perceived globally, working closely with artisan partners and design teams to create cohesive visual narratives across all channels.",
  },
  {
    title: "Digital Marketing Manager",
    location: "Lagos, Nigeria / Remote",
    type: "Full-time",
    description:
      "Drive our digital growth strategy across social media, email marketing, paid advertising, and content creation. You will build and engage our community of discerning customers who value African craftsmanship, managing campaigns that tell the stories behind our artisan-made pieces.",
  },
  {
    title: "Artisan Relations Coordinator",
    location: "Lagos, Nigeria",
    type: "Full-time",
    description:
      "Serve as the vital link between The Heritage Edit and our network of 200+ artisans across West Africa. You will manage partnerships with weaving cooperatives in Iseyin, Adire workshops in Abeokuta, and Kente communities in Ghana, ensuring fair trade practices and production quality.",
  },
  {
    title: "Customer Experience Specialist",
    location: "Remote",
    type: "Full-time",
    description:
      "Deliver an exceptional, personalised experience for every customer. From styling guidance to order support, you will be the voice of The Heritage Edit, helping clients navigate our collections, understand African textile heritage, and find pieces that resonate with their personal style.",
  },
];

export default function CareersPage() {
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
            WORK WITH US
          </p>
          <h1 className="text-display-lg font-serif mb-6">
            Join Our Team
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Help us redefine luxury fashion by celebrating Africa&apos;s rich textile heritage and empowering artisan communities.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
              WHY THE HERITAGE EDIT
            </p>
            <h2 className="text-display-sm font-serif text-[#0D2C22] mb-6">
              A Mission Worth Joining
            </h2>
            <div className="space-y-4 text-base text-neutral-600 leading-relaxed">
              <p>
                At The Heritage Edit, we are building more than a fashion brand. We are creating a bridge between centuries-old African craftsmanship and the global luxury market, ensuring that the artisans behind these extraordinary textiles receive the recognition and compensation they deserve.
              </p>
              <p>
                We are a small, passionate team based in Lagos with collaborators across West Africa and the diaspora. We value creativity, cultural curiosity, and a deep respect for the artisan communities we serve. If you believe fashion can be a force for cultural preservation and economic empowerment, we would love to hear from you.
              </p>
            </div>
          </div>

          {/* What We Offer */}
          <div className="mb-20">
            <h2 className="text-display-sm font-serif text-[#0D2C22] mb-8">
              What We Offer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Competitive Compensation", desc: "Salary packages that reflect the talent and dedication you bring" },
                { title: "Flexible Working", desc: "Hybrid and remote options for roles that support it" },
                { title: "Learning Budget", desc: "Annual allowance for courses, conferences, and professional development" },
                { title: "Staff Discount", desc: "Generous discount on all Heritage Edit collections" },
              ].map((perk) => (
                <div key={perk.title} className="bg-white border border-neutral-200 p-6">
                  <h3 className="font-serif text-[#0D2C22] text-lg mb-2">{perk.title}</h3>
                  <p className="text-sm text-neutral-500">{perk.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Open Positions */}
          <div>
            <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-[#B08D57] mb-4">
              OPEN POSITIONS
            </p>
            <h2 className="text-display-sm font-serif text-[#0D2C22] mb-8">
              Current Openings
            </h2>
            <div className="space-y-6">
              {POSITIONS.map((position) => (
                <div
                  key={position.title}
                  className="bg-white border border-neutral-200 p-6 md:p-8"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-serif text-xl text-[#0D2C22] mb-2">
                        {position.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-sans text-neutral-500">
                          {position.location}
                        </span>
                        <span className="w-1 h-1 bg-neutral-300" />
                        <span className="text-xs font-sans text-neutral-500">
                          {position.type}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`mailto:careers@theheritageedit.com?subject=Application: ${position.title}`}
                      className="inline-block bg-[#0D2C22] text-white font-sans text-xs font-semibold tracking-[0.2em] uppercase px-8 py-3 hover:bg-[#0D2C22]/90 transition-colors whitespace-nowrap self-start"
                    >
                      Apply Now
                    </a>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {position.description}
                  </p>
                </div>
              ))}
            </div>

            {/* General Application */}
            <div className="mt-12 bg-[#0D2C22] text-white p-8 md:p-12 text-center">
              <h3 className="font-serif text-xl mb-4">
                Don&apos;t See Your Role?
              </h3>
              <p className="text-white/70 text-sm max-w-xl mx-auto mb-6">
                We are always looking for talented individuals who share our passion for African heritage and luxury fashion. Send us your CV and a brief note about what you would bring to the team.
              </p>
              <a
                href="mailto:careers@theheritageedit.com?subject=General Application"
                className="inline-block border border-[#B08D57] text-[#B08D57] font-sans text-xs font-semibold tracking-[0.2em] uppercase px-10 py-4 hover:bg-[#B08D57] hover:text-white transition-colors"
              >
                Send Your CV
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
