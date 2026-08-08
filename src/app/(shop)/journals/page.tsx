"use client";

import { useState } from "react";
import Link from "next/link";

const ARTICLES = [
  {
    slug: "art-of-aso-oke-weaving",
    title: "The Art of Aso-Oke Weaving",
    excerpt:
      "Exploring the centuries-old tradition of hand-woven Aso-Oke textiles from the Yoruba heartland of Iseyin, where master weavers transform raw thread into cultural heirlooms.",
    category: "Craft",
    date: "15 July 2026",
  },
  {
    slug: "behind-the-loom-kente-cloth",
    title: "Behind the Loom: Kente Cloth",
    excerpt:
      "A journey to Bonwire in Ghana's Ashanti Region, where every strip of Kente cloth carries symbolic meaning passed down through generations of master weavers.",
    category: "Heritage",
    date: "2 July 2026",
  },
  {
    slug: "adire-renaissance",
    title: "The Adire Renaissance",
    excerpt:
      "How a new generation of Nigerian designers is reimagining indigo-dyed Adire textiles for the global luxury market, blending ancient resist-dyeing techniques with modern silhouettes.",
    category: "Design",
    date: "18 June 2026",
  },
  {
    slug: "styling-ankara-for-every-occasion",
    title: "Styling Ankara for Every Occasion",
    excerpt:
      "From boardroom to evening soiree, our style guide shows you how to wear Ankara prints with confidence and sophistication for any occasion.",
    category: "Style",
    date: "5 June 2026",
  },
  {
    slug: "meet-the-artisans-lagos-leather",
    title: "Meet the Artisans: Lagos Leather Collective",
    excerpt:
      "Inside the workshop of the Lagos Leather Collective, where skilled craftspeople transform locally tanned hides into luxury accessories that rival the finest European ateliers.",
    category: "Artisans",
    date: "22 May 2026",
  },
  {
    slug: "african-fashion-on-the-global-stage",
    title: "African Fashion on the Global Stage",
    excerpt:
      "From Lagos Fashion Week to Paris couture, African designers are reshaping the global fashion narrative. We spotlight the creators leading this cultural shift.",
    category: "Culture",
    date: "10 May 2026",
  },
];

const CATEGORIES = ["All", "Craft", "Heritage", "Design", "Style", "Artisans", "Culture"];

export default function JournalsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? ARTICLES
      : ARTICLES.filter((a) => a.category === activeCategory);

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
            STORIES &amp; CULTURE
          </p>
          <h1 className="text-display-lg font-serif mb-6">
            The Heritage Journal
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Stories of craft, culture, and the artisans shaping the future of African luxury fashion.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 overflow-x-auto py-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-sans font-semibold tracking-[0.2em] uppercase whitespace-nowrap pb-2 border-b-2 transition-colors ${
                  activeCategory === cat
                    ? "border-[#B08D57] text-[#0D2C22]"
                    : "border-transparent text-neutral-400 hover:text-neutral-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Article Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((article) => (
              <Link key={article.slug} href="#" className="group block">
                <article>
                  <div className="bg-neutral-200 aspect-[3/2] mb-5 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center group-hover:bg-neutral-300 transition-colors">
                      <p className="text-neutral-400 font-sans text-xs">Editorial Image</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-[#B08D57]">
                      {article.category}
                    </span>
                    <span className="w-1 h-1 bg-neutral-300" />
                    <span className="text-xs font-sans text-neutral-400">
                      {article.date}
                    </span>
                  </div>
                  <h2 className="font-serif text-xl text-[#0D2C22] mb-2 group-hover:text-[#B08D57] transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-sm text-neutral-500 leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                  <p className="text-xs font-sans font-semibold tracking-[0.2em] uppercase text-[#B08D57] mt-4">
                    Read More
                  </p>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
