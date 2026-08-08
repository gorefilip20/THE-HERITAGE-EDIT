"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "How long does a made-to-order piece take?",
    a: "Made-to-order pieces require 10–14 business days for production, plus 5–7 days for delivery within Nigeria and 10–14 days for international shipping.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, we ship worldwide from Lagos, partnering with trusted global couriers to ensure secure, tracked delivery straight to your doorstep.",
  },
  {
    q: "Can I return a made-to-order item?",
    a: "Because each piece is custom-crafted to your unique specifications and limited-run inventory, we do not offer standard returns, but we provide complimentary alterations to ensure a flawless fit.",
  },
  {
    q: "How should I care for my Heritage Edit piece?",
    a: "Dry clean only for all structured Aso Oke, velvet, and embellished items. Store in breathable garment bags away from direct sunlight to preserve the metallic threading and hand-woven integrity.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept secure local and international debit/credit cards, bank transfers, and luxury split-payment options for private list members.",
  },
  {
    q: "How do I get measured for an Agbada?",
    a: "You can upload your precise body measurements using our digital Sizing Guide, or book a virtual/in-person consultation with our Lagos tailoring studio team.",
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <main className="luxury-container py-20 md:py-32 max-w-3xl">
      <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-gold mb-4">
        Support
      </p>
      <h1 className="text-display-sm md:text-display-md font-serif text-obsidian mb-4">
        Frequently Asked Questions
      </h1>
      <p className="text-[15px] text-neutral-500 mb-16 leading-relaxed">
        Everything you need to know about ordering, payments, and our process.
      </p>

      <div className="divide-y divide-slate-border">
        {FAQS.map((faq, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-start justify-between py-6 text-left group"
              aria-expanded={open === i}
            >
              <span className="text-[15px] font-medium text-obsidian pr-8 group-hover:text-heritage-green transition-colors">
                {faq.q}
              </span>
              <span className="mt-0.5 shrink-0 w-6 h-6 flex items-center justify-center text-lg font-light text-neutral-400 select-none">
                {open === i ? "−" : "+"}
              </span>
            </button>
            <div
              className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                open === i
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="text-[14px] text-[#666] leading-[1.7] pb-6 pr-12">
                  {faq.a}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-border pt-10 mt-10">
        <p className="text-sm text-neutral-500">
          Still have questions?{" "}
          <a href="/contact" className="text-heritage-green underline">
            Contact our concierge team
          </a>
          .
        </p>
      </div>
    </main>
  );
}
