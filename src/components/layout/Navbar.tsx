"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, ShoppingBag, Menu, X, Heart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/collection/new-arrivals", label: "New Arrivals" },
  { href: "/collection/women", label: "Women" },
  { href: "/collection/men", label: "Men" },
  { href: "/collection/accessories", label: "Accessories" },
  { href: "/collection/editorial", label: "Editorial" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { openCart, itemCount } = useCartStore();
  const count = itemCount();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-luxury",
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-slate-border"
            : "bg-transparent",
        )}
      >
        <div className="luxury-container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 -ml-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Navigation links — left */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-sans font-medium tracking-[0.15em] uppercase text-obsidian/80 hover:text-heritage-green transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Logo — center */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
            >
              <span className="text-lg md:text-xl font-serif font-semibold tracking-[0.08em] text-obsidian whitespace-nowrap">
                THE HERITAGE EDIT
              </span>
            </Link>

            {/* Actions — right */}
            <div className="flex items-center gap-4 md:gap-6">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-1 text-obsidian/70 hover:text-heritage-green transition-colors"
                aria-label="Search"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>
              <Link
                href="/wishlist"
                className="hidden md:block p-1 text-obsidian/70 hover:text-heritage-green transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={18} strokeWidth={1.5} />
              </Link>
              <Link
                href="/account"
                className="hidden md:block p-1 text-obsidian/70 hover:text-heritage-green transition-colors"
                aria-label="Account"
              >
                <User size={18} strokeWidth={1.5} />
              </Link>
              <button
                onClick={openCart}
                className="relative p-1 text-obsidian/70 hover:text-heritage-green transition-colors"
                aria-label="Shopping bag"
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-heritage-green text-white text-[9px] font-sans font-bold rounded-full"
                  >
                    {count}
                  </motion.span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-white lg:hidden"
          >
            <div className="pt-20 px-6">
              <nav className="flex flex-col gap-6">
                {NAV_LINKS.map((link, idx) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-2xl font-serif text-obsidian hover:text-heritage-green transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/98 backdrop-blur-sm flex items-start justify-center pt-32"
          >
            <div className="w-full max-w-2xl px-6">
              <div className="relative">
                <Search
                  className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search designers, collections, pieces..."
                  className="w-full h-14 pl-8 pr-4 bg-transparent border-b-2 border-obsidian text-xl font-serif placeholder:text-neutral-300 focus:outline-none focus:border-heritage-green transition-colors"
                  autoFocus
                />
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute top-6 right-6 p-2 text-obsidian/60 hover:text-obsidian"
              >
                <X size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
