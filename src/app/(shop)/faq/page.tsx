"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How do I place an order?",
    a: "Browse our collections, select your desired piece and size, then proceed to checkout. We accept Paystack, Flutterwave, and all major credit and debit cards. You will receive an order confirmation email immediately after your purchase.",
  },
  {
    q: "How long does shipping take?",
    a: "Domestic orders within Nigeria are delivered in 3–5 business days. International shipping takes 5–9 business days via DHL or FedEx. Made-to-order pieces require an additional 10–14 business days for production before dispatch.",
  },
  {
    q: "How do I find my size?",
    a: "Visit our Size Guide page for detailed measurement charts by garment type. If you are between sizes, we recommend sizing up. For a perfect fit, consider our Made-to-Measure service where we craft each piece to your exact measurements.",
  },
  {
    q: "What is your return policy?",
    a: "We offer a 14-day return window from the date of delivery. Items must be unworn, unwashed, and have all original tags attached. Made-to-order and personalised items are final sale. Refunds are processed within 5–10 business days.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Visa, Mastercard, Verve, and bank transfers via Paystack (primary). International customers can also pay via Flutterwave. All transactions are encrypted and secured with 256-bit SSL protection.",
  },
  {
    q: "How does Made-to-Order work?",
    a: "Our Made-to-Order service allows you to have any piece custom-crafted by our master artisans. After placing your order, our team will contact you to confirm measurements and any customisation details. Production takes 10–14 business days.",
  },
  {
    q: "How should I care for my Heritage Edit garments?",
    a: "Most of our handwoven textiles — Aso-Oke, Kente, and Adire — should be dry-cleaned or hand-washed in cold water with mild detergent. Avoid wringing. Lay flat to dry away from direct sunlight. Store folded in a cool, dry place.",
  },
  {
    q: "Do you offer wholesale or trade accounts?",
    a: "Yes, we work with select boutiques, stylists, and interior designers worldwide. Please contact us at wholesale@theheritageedit.com with details about your business for trade pricing and minimum order information.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="bg-ivory min-h-screen">
      <section className="bg-obsidian text-white py-20 md:py-28">
        <div className="luxury-container text-center">
          <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-white/40 mb-4">
            HELP CENTRE
          </p>
          <h1 className="font-serif italic text-3xl md:text-5xl mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-sm font-sans text-white/60 max-w-xl mx-auto">
            Everything you need to know about shopping with The Heritage Edit.
          </p>
        </div>
      </section>

      <section className="luxury-container py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          {FAQS.map((faq, i) => (
            <div key={i} className="border-b border-slate-border">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between py-6 text-left group"
                aria-expanded={openIndex === i}
              >
                <span className="text-[15px] font-sans font-medium text-obsidian pr-8 group-hover:text-heritage-green transition-colors">
                  {faq.q}
                </span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-neutral-400 transition-transform duration-300 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  openIndex === i
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="pb-6 text-[14px] font-sans text-neutral-500 leading-relaxed pr-12">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm font-sans text-neutral-500 mb-4">
            Still have questions?
          </p>
          <a
            href="/contact"
            className="inline-flex h-12 px-8 items-center bg-heritage-green text-white text-[11px] font-sans font-semibold tracking-[0.2em] uppercase hover:bg-[#163829] transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>
    </main>
  );
}
