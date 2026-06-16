"use client";

import Link from "next/link";

const FOOTER_LINKS = {
  "Client Services": [
    { href: "/contact", label: "Contact Us" },
    { href: "/shipping", label: "Shipping & Returns" },
    { href: "/faq", label: "FAQ" },
    { href: "/size-guide", label: "Size Guide" },
  ],
  "The House": [
    { href: "/about", label: "Our Story" },
    { href: "/heritage", label: "The Heritage Edit" },
    { href: "/sustainability", label: "Sustainability" },
    { href: "/careers", label: "Careers" },
  ],
  Legal: [
    { href: "/terms", label: "Terms & Conditions" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/cookies", label: "Cookie Policy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-heritage-green text-white">
      <div className="luxury-container py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand column */}
          <div>
            <h3 className="text-xl font-serif tracking-wide mb-4">
              THE HERITAGE EDIT
            </h3>
            <p className="text-sm font-sans text-white/60 leading-relaxed max-w-xs">
              Meticulously curated luxury fashion, enriched with the stories
              behind every piece. Where heritage meets contemporary elegance.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-sans font-medium tracking-[0.2em] uppercase text-white/40 mb-6">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-sans text-white/70 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/10 pt-12 mb-12">
          <div className="max-w-md">
            <h4 className="text-xs font-sans font-medium tracking-[0.2em] uppercase text-white/40 mb-4">
              Join The Edit
            </h4>
            <div className="flex">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 h-12 px-4 bg-white/5 border border-white/20 text-sm font-sans text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
              />
              <button className="h-12 px-8 bg-white text-heritage-green text-xs font-sans font-semibold tracking-wider uppercase hover:bg-white/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans text-white/30">
          <p>&copy; {new Date().getFullYear()} The Heritage Edit. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Amex</span>
            <span>Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
