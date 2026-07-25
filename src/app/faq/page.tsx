"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How do I access private list drops and limited-edition releases?",
    a: "Our private list is reserved for returning clients and newsletter subscribers. When a limited drop is announced, private-list members receive a 24-hour early access window before the collection opens to the public. Subscribe to our newsletter or complete your first purchase to be added automatically.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major debit and credit cards (Visa, Mastercard, Verve) through Paystack, as well as bank transfers, USSD, and mobile money via Flutterwave. International customers can pay in NGN, USD, GBP, EUR, GHS, KES, or ZAR. Apple Pay is available in supported regions.",
  },
  {
    q: "Are your pieces available to try before buying?",
    a: "For clients in Lagos, we offer private appointments at our Victoria Island atelier where you can view fabrics, try sample fits, and consult with a stylist. Appointments are available Tuesday through Saturday. Contact concierge@heritageedit.com to book.",
  },
  {
    q: "How long does made-to-order production take?",
    a: "Standard production is 10–14 business days from order confirmation. Heavily embroidered or beaded pieces (such as full Agbada sets) may require an additional 3–5 days. Our Fast-Response Service compresses the timeline to 5–7 business days for an additional 30% surcharge.",
  },
  {
    q: "Can I modify my order after placing it?",
    a: "Measurement adjustments can be made within 24 hours of order confirmation at no charge. After production begins, changes to sizing or design details may incur an alteration fee. Contact our concierge team immediately if you need to modify your order.",
  },
  {
    q: "Do you offer corporate or bulk orders for events?",
    a: "Yes. We work with wedding parties, corporate clients, and event organisers on coordinated ensembles. Bulk orders of 5+ pieces qualify for dedicated project management and volume pricing. Email events@heritageedit.com with your requirements and timeline.",
  },
  {
    q: "What is your return and exchange policy for custom pieces?",
    a: "Because each garment is made to your measurements, we do not offer returns on made-to-order items. However, we provide one complimentary fit adjustment within 14 days of delivery. Ready-to-wear pieces may be exchanged within 7 days in unworn condition with tags attached. See our full Refund Policy for details.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order ships, you will receive an email and SMS with your tracking number and a direct link to the courier's tracking page. You can also track your order by entering your order number on our Shipment page or by contacting our support team.",
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <main className="luxury-container py-20 md:py-32 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-serif text-obsidian mb-4">Frequently Asked Questions</h1>
      <p className="text-sm text-neutral-500 mb-16 leading-relaxed">
        Everything you need to know about ordering, payments, and our process.
      </p>

      <div className="divide-y divide-neutral-200">
        {FAQS.map((faq, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-start justify-between py-6 text-left group"
              aria-expanded={open === i}
            >
              <span className="text-sm font-medium text-obsidian pr-8 group-hover:text-heritage-green transition-colors">
                {faq.q}
              </span>
              <ChevronDown
                size={16}
                className={`mt-0.5 shrink-0 text-neutral-400 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  open === i ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="text-[13px] text-neutral-500 leading-[1.8] pb-6 pr-12">
                  {faq.a}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-200 pt-10 mt-10">
        <p className="text-sm text-neutral-500">
          Still have questions?{" "}
          <a href="/contact" className="text-heritage-green underline">Contact our concierge team</a>.
        </p>
      </div>
    </main>
  );
}
