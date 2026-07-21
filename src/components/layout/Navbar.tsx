"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, ShoppingBag, Menu, X, Heart, ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { cn, getImagePlaceholder } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";

/* ──────────────────────────────────────────────────────────
   MEGA-MENU DATA
   ────────────────────────────────────────────────────────── */

interface MegaMenuColumn {
  heading: string;
  links: Array<{ label: string; href: string }>;
}

interface MegaMenuCategory {
  label: string;
  href: string;
  columns: MegaMenuColumn[];
  featured?: {
    title: string;
    subtitle: string;
    href: string;
    image: string;
  };
}

const MEGA_MENU: MegaMenuCategory[] = [
  {
    label: "New Arrivals",
    href: "/shop?sort=newest",
    columns: [
      {
        heading: "Just Landed",
        links: [
          { label: "View All New", href: "/shop?sort=newest" },
          { label: "This Week", href: "/shop?sort=newest&days=7" },
          { label: "Back in Stock", href: "/shop?tag=back-in-stock" },
          { label: "Exclusives", href: "/shop?tag=exclusive" },
        ],
      },
      {
        heading: "By Category",
        links: [
          { label: "Ankara Dresses", href: "/shop?category=ankara-dresses&sort=newest" },
          { label: "Agbada & Robes", href: "/shop?category=agbada-robes&sort=newest" },
          { label: "Tailored Suits", href: "/shop?category=tailored-suits&sort=newest" },
          { label: "Bags & Clutches", href: "/shop?category=bags-clutches&sort=newest" },
          { label: "Accessories", href: "/shop?category=accessories&sort=newest" },
        ],
      },
    ],
    featured: {
      title: "Heritage Classics",
      subtitle: "Timeless African textile artistry",
      href: "/collection/heritage-classics",
      image: "/images/editorial/heritage-classics.jpg",
    },
  },
  {
    label: "Designers",
    href: "/shop",
    columns: [
      {
        heading: "West Africa",
        links: [
          { label: "Ozwald Boateng", href: "/shop?brand=ozwald-boateng" },
          { label: "Duro Olowu", href: "/shop?brand=duro-olowu" },
          { label: "Lisa Folawiyo", href: "/shop?brand=lisa-folawiyo" },
          { label: "Maki Oh", href: "/shop?brand=maki-oh" },
          { label: "Kenneth Ize", href: "/shop?brand=kenneth-ize" },
        ],
      },
      {
        heading: "Southern & East Africa",
        links: [
          { label: "Thebe Magugu", href: "/shop?brand=thebe-magugu" },
          { label: "Laduma Ngxokolo", href: "/shop?brand=laduma-ngxokolo" },
          { label: "Imane Ayissi", href: "/shop?brand=imane-ayissi" },
          { label: "Christie Brown", href: "/shop?brand=christie-brown" },
          { label: "Tongoro", href: "/shop?brand=tongoro" },
        ],
      },
      {
        heading: "Diaspora",
        links: [
          { label: "Ahluwalia", href: "/shop?brand=ahluwalia" },
          { label: "Orange Culture", href: "/shop?brand=orange-culture" },
          { label: "All Designers A\u2013Z", href: "/shop" },
        ],
      },
    ],
    featured: {
      title: "Kenneth Ize",
      subtitle: "Master of Aso Oke weaving",
      href: "/shop?brand=kenneth-ize",
      image: "/images/editorial/kenneth-ize.jpg",
    },
  },
  {
    label: "Women",
    href: "/collection/women",
    columns: [
      {
        heading: "Clothing",
        links: [
          { label: "View All", href: "/collection/women" },
          { label: "Ankara Dresses", href: "/shop?category=ankara-dresses" },
          { label: "Kente Wear", href: "/shop?category=kente-wear" },
          { label: "Dashiki & Tops", href: "/shop?category=dashiki-tops" },
          { label: "Aso Oke", href: "/shop?category=aso-oke" },
        ],
      },
      {
        heading: "Accessories",
        links: [
          { label: "Bags & Clutches", href: "/shop?category=bags-clutches" },
          { label: "Headwraps & Gele", href: "/shop?category=headwraps-gele" },
          { label: "Shoes & Sandals", href: "/shop?category=shoes-sandals" },
          { label: "Jewellery", href: "/shop?category=accessories" },
        ],
      },
    ],
    featured: {
      title: "Wedding & Ceremony",
      subtitle: "Luxurious pieces for celebrations",
      href: "/collection/wedding-ceremony",
      image: "/images/editorial/wedding.jpg",
    },
  },
  {
    label: "Men",
    href: "/collection/men",
    columns: [
      {
        heading: "Clothing",
        links: [
          { label: "View All", href: "/collection/men" },
          { label: "Agbada & Robes", href: "/shop?category=agbada-robes" },
          { label: "Tailored Suits", href: "/shop?category=tailored-suits" },
          { label: "Dashiki & Tops", href: "/shop?category=dashiki-tops" },
          { label: "Outerwear", href: "/shop?category=outerwear" },
        ],
      },
      {
        heading: "Accessories",
        links: [
          { label: "Shoes & Sandals", href: "/shop?category=shoes-sandals" },
          { label: "Bags", href: "/shop?category=bags-clutches" },
          { label: "Accessories", href: "/shop?category=accessories" },
        ],
      },
    ],
    featured: {
      title: "The Agbada Edit",
      subtitle: "Regal presence, modern cut",
      href: "/shop?category=agbada-robes",
      image: "/images/editorial/agbada.jpg",
    },
  },
  {
    label: "Kids",
    href: "/kids",
    columns: [
      {
        heading: "Girls",
        links: [
          { label: "View All Girls", href: "/kids?gender=girls" },
          { label: "Ankara Dresses", href: "/kids?category=ankara-dresses&gender=girls" },
          { label: "Kente Sets", href: "/kids?category=kente-wear&gender=girls" },
          { label: "Accessories", href: "/kids?category=accessories&gender=girls" },
          { label: "Shoes", href: "/kids?category=shoes&gender=girls" },
        ],
      },
      {
        heading: "Boys",
        links: [
          { label: "View All Boys", href: "/kids?gender=boys" },
          { label: "Dashiki Sets", href: "/kids?category=dashiki&gender=boys" },
          { label: "Agbada", href: "/kids?category=agbada&gender=boys" },
          { label: "Accessories", href: "/kids?category=accessories&gender=boys" },
          { label: "Shoes", href: "/kids?category=shoes&gender=boys" },
        ],
      },
      {
        heading: "Baby",
        links: [
          { label: "View All Baby", href: "/kids?category=baby" },
          { label: "Onesies & Sets", href: "/kids?category=baby-sets" },
          { label: "Gifts", href: "/kids?category=baby-gifts" },
        ],
      },
    ],
    featured: {
      title: "Mini Heritage",
      subtitle: "African fashion for little ones",
      href: "/kids",
      image: "/images/editorial/kids.jpg",
    },
  },
  {
    label: "Life",
    href: "/life",
    columns: [
      {
        heading: "Home & Living",
        links: [
          { label: "View All", href: "/life" },
          { label: "Textiles & Throws", href: "/life?category=textiles" },
          { label: "Wall Art", href: "/life?category=wall-art" },
          { label: "Candles & Fragrance", href: "/life?category=fragrance" },
          { label: "Tableware", href: "/life?category=tableware" },
        ],
      },
      {
        heading: "Beauty",
        links: [
          { label: "Skincare", href: "/life?category=skincare" },
          { label: "Body Care", href: "/life?category=body-care" },
          { label: "Fragrance", href: "/life?category=fragrance" },
          { label: "Hair Care", href: "/life?category=hair-care" },
        ],
      },
      {
        heading: "Gifts",
        links: [
          { label: "Gift Guide", href: "/life?category=gifts" },
          { label: "Gift Cards", href: "/gift-cards" },
          { label: "Under ₦100,000", href: "/life?category=gifts&maxPrice=10000" },
          { label: "Luxury Gifts", href: "/life?category=gifts&minPrice=50000" },
        ],
      },
    ],
    featured: {
      title: "African Home",
      subtitle: "Artisan-crafted living",
      href: "/life",
      image: "/images/editorial/home.jpg",
    },
  },
  {
    label: "Sale",
    href: "/sale",
    columns: [
      {
        heading: "Women's Sale",
        links: [
          { label: "View All", href: "/sale?gender=women" },
          { label: "Dresses", href: "/sale?category=ankara-dresses" },
          { label: "Accessories", href: "/sale?category=accessories" },
          { label: "Shoes", href: "/sale?category=shoes" },
        ],
      },
      {
        heading: "Men's Sale",
        links: [
          { label: "View All", href: "/sale?gender=men" },
          { label: "Suits & Agbada", href: "/sale?category=agbada-robes" },
          { label: "Accessories", href: "/sale?category=accessories" },
        ],
      },
      {
        heading: "By Discount",
        links: [
          { label: "Up to 30% Off", href: "/sale?discount=30" },
          { label: "Up to 50% Off", href: "/sale?discount=50" },
          { label: "Up to 70% Off", href: "/sale?discount=70" },
        ],
      },
    ],
  },
];

/* ──────────────────────────────────────────────────────────
   NAVBAR COMPONENT
   ────────────────────────────────────────────────────────── */

export function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [mobileSubMenu, setMobileSubMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { openCart, itemCount } = useCartStore();
  const { formatPrice, t } = useLocale();
  const count = itemCount();
  const megaTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setMobileSubMenu(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleMegaEnter = useCallback((label: string) => {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
    setActiveMega(label);
  }, []);

  const handleMegaLeave = useCallback(() => {
    megaTimeoutRef.current = setTimeout(() => setActiveMega(null), 180);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed.length > 0) {
      setIsSearchOpen(false);
      setSearchQuery("");
      router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    }
  };

  const activeMenu = MEGA_MENU.find((m) => m.label === activeMega);

  return (
    <>
      {/* ── HEADER ── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-luxury",
          isScrolled
            ? "bg-white/[0.97] backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.04)]"
            : "bg-white",
        )}
      >
        {/* ─ TOP BAR ─ */}
        <div className="hidden lg:block border-b border-slate-border">
          <div className="luxury-container flex items-center justify-between h-8">
            <span className="text-[10px] font-sans font-medium tracking-[0.2em] uppercase text-neutral-400">
              {t("shipping.free")} {formatPrice(50_000_000)}
            </span>
            <div className="flex items-center gap-6">
              <Link
                href="/about"
                className="text-[10px] font-sans font-medium tracking-[0.15em] uppercase text-neutral-400 hover:text-obsidian transition-colors"
              >
                Our Heritage
              </Link>
              <Link
                href="/contact"
                className="text-[10px] font-sans font-medium tracking-[0.15em] uppercase text-neutral-400 hover:text-obsidian transition-colors"
              >
                Client Services
              </Link>
            </div>
          </div>
        </div>

        {/* ─ MAIN NAV BAR ─ */}
        <div className="luxury-container">
          {/* Mobile layout */}
          <div className="flex lg:hidden items-center justify-between h-16">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-obsidian"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>

            <Link href="/">
              <span className="text-[15px] font-serif font-semibold tracking-[0.12em] text-obsidian whitespace-nowrap select-none">
                THE HERITAGE EDIT
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-obsidian/60 hover:text-obsidian transition-colors"
                aria-label="Search"
              >
                <Search size={19} strokeWidth={1.5} />
              </button>
              <button
                onClick={openCart}
                className="relative p-2 text-obsidian/60 hover:text-obsidian transition-colors"
                aria-label="Shopping bag"
              >
                <ShoppingBag size={19} strokeWidth={1.5} />
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0.5 right-0.5 w-[17px] h-[17px] flex items-center justify-center bg-heritage-green text-white text-[9px] font-sans font-bold rounded-full"
                  >
                    {count > 9 ? "9+" : count}
                  </motion.span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop layout — 3-column grid: left nav | center logo | right nav + icons */}
          <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center h-[72px]">
            {/* Left nav links */}
            <nav
              className="flex items-center justify-start"
              onMouseLeave={handleMegaLeave}
            >
              {MEGA_MENU.slice(0, 3).map((item) => (
                <div
                  key={item.label}
                  onMouseEnter={() => handleMegaEnter(item.label)}
                  className="relative"
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "relative block px-4 xl:px-5 py-6 text-[11px] font-sans font-medium tracking-[0.14em] uppercase transition-colors duration-200",
                      activeMega === item.label
                        ? "text-heritage-green"
                        : "text-obsidian/80 hover:text-obsidian",
                    )}
                  >
                    {item.label}
                    {activeMega === item.label && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute bottom-4 left-4 right-4 xl:left-5 xl:right-5 h-[1.5px] bg-heritage-green"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Center logo */}
            <Link href="/" className="px-8 xl:px-12">
              <span className="text-[17px] font-serif font-semibold tracking-[0.12em] text-obsidian whitespace-nowrap select-none">
                THE HERITAGE EDIT
              </span>
            </Link>

            {/* Right nav links + icons */}
            <div className="flex items-center justify-end">
              <nav
                className="flex items-center"
                onMouseLeave={handleMegaLeave}
              >
                {MEGA_MENU.slice(3).map((item) => (
                  <div
                    key={item.label}
                    onMouseEnter={() => handleMegaEnter(item.label)}
                    className="relative"
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "relative block px-4 xl:px-5 py-6 text-[11px] font-sans font-medium tracking-[0.14em] uppercase transition-colors duration-200",
                        activeMega === item.label
                          ? "text-heritage-green"
                          : "text-obsidian/80 hover:text-obsidian",
                      )}
                    >
                      {item.label}
                      {activeMega === item.label && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute bottom-4 left-4 right-4 xl:left-5 xl:right-5 h-[1.5px] bg-heritage-green"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  </div>
                ))}
              </nav>

              <div className="flex items-center gap-4 ml-4 xl:ml-6 pl-4 xl:pl-6 border-l border-slate-border">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-obsidian/60 hover:text-obsidian transition-colors"
                  aria-label="Search"
                >
                  <Search size={19} strokeWidth={1.5} />
                </button>
                <Link
                  href="/wishlist"
                  className="p-2 text-obsidian/60 hover:text-obsidian transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart size={19} strokeWidth={1.5} />
                </Link>
                <Link
                  href="/account"
                  className="p-2 text-obsidian/60 hover:text-obsidian transition-colors"
                  aria-label="Account"
                >
                  <User size={19} strokeWidth={1.5} />
                </Link>
                <button
                  onClick={openCart}
                  className="relative p-2 text-obsidian/60 hover:text-obsidian transition-colors"
                  aria-label="Shopping bag"
                >
                  <ShoppingBag size={19} strokeWidth={1.5} />
                  {count > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-0.5 right-0.5 w-[17px] h-[17px] flex items-center justify-center bg-heritage-green text-white text-[9px] font-sans font-bold rounded-full"
                    >
                      {count > 9 ? "9+" : count}
                    </motion.span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── MEGA-MENU DROPDOWN ── */}
        <AnimatePresence>
          {activeMenu && (
            <motion.div
              key={activeMenu.label}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full left-0 right-0 bg-white border-t border-slate-border shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] z-40"
              onMouseEnter={() => handleMegaEnter(activeMenu.label)}
              onMouseLeave={handleMegaLeave}
            >
              <div className="luxury-container py-10">
                <div className="flex gap-0">
                  {/* Columns */}
                  <div className="flex-1 grid grid-cols-3 gap-x-12 gap-y-8">
                    {activeMenu.columns.map((col) => (
                      <div key={col.heading}>
                        <h3 className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-5">
                          {col.heading}
                        </h3>
                        <ul className="space-y-3">
                          {col.links.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                onClick={() => setActiveMega(null)}
                                className="text-[13px] font-sans text-obsidian/75 hover:text-heritage-green transition-colors duration-200 leading-relaxed"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Featured card */}
                  {activeMenu.featured && (
                    <div className="w-[280px] ml-12 shrink-0">
                      <Link
                        href={activeMenu.featured.href}
                        onClick={() => setActiveMega(null)}
                        className="group block"
                      >
                        <div className="relative aspect-[4/5] bg-ivory overflow-hidden mb-4">
                          <Image
                            src={activeMenu.featured.image || getImagePlaceholder(280, 350)}
                            alt={activeMenu.featured.title}
                            fill
                            sizes="280px"
                            className="object-cover transition-transform duration-700 ease-luxury group-hover:scale-105"
                          />
                        </div>
                        <p className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-heritage-purple mb-1">
                          Editorial
                        </p>
                        <h4 className="text-sm font-serif text-obsidian group-hover:text-heritage-green transition-colors">
                          {activeMenu.featured.title}
                        </h4>
                        <p className="text-xs font-sans text-neutral-400 mt-1">
                          {activeMenu.featured.subtitle}
                        </p>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-white lg:hidden overflow-y-auto"
          >
            <div className="pt-24 pb-10 px-6">
              {/* Top-level categories */}
              {mobileSubMenu === null && (
                <motion.nav
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col"
                >
                  {MEGA_MENU.map((item, idx) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setMobileSubMenu(item.label)}
                      className="flex items-center justify-between py-4 border-b border-slate-border group"
                    >
                      <span className="text-lg font-serif text-obsidian group-hover:text-heritage-green transition-colors">
                        {item.label}
                      </span>
                      <ChevronRight size={18} className="text-neutral-300 group-hover:text-heritage-green transition-colors" />
                    </motion.button>
                  ))}

                  <div className="mt-10 space-y-4">
                    <Link
                      href="/wishlist"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-sm font-sans text-obsidian/60 hover:text-obsidian"
                    >
                      <Heart size={18} strokeWidth={1.5} />
                      Wishlist
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-sm font-sans text-obsidian/60 hover:text-obsidian"
                    >
                      <User size={18} strokeWidth={1.5} />
                      My Account
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-sm font-sans text-obsidian/60 hover:text-obsidian"
                    >
                      <User size={18} strokeWidth={1.5} />
                      Create Account
                    </Link>
                  </div>
                </motion.nav>
              )}

              {/* Sub-level links */}
              {mobileSubMenu !== null && (() => {
                const menu = MEGA_MENU.find((m) => m.label === mobileSubMenu);
                if (!menu) return null;

                return (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <button
                      onClick={() => setMobileSubMenu(null)}
                      className="flex items-center gap-2 text-xs font-sans font-medium tracking-[0.15em] uppercase text-neutral-400 mb-8"
                    >
                      <ChevronRight size={14} className="rotate-180" />
                      Back
                    </button>

                    <h2 className="text-2xl font-serif text-obsidian mb-6">
                      {menu.label}
                    </h2>

                    <Link
                      href={menu.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-sm font-sans font-medium text-heritage-green mb-8"
                    >
                      View All {menu.label}
                    </Link>

                    {menu.columns.map((col) => (
                      <div key={col.heading} className="mb-8">
                        <h3 className="text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-4">
                          {col.heading}
                        </h3>
                        <ul className="space-y-3">
                          {col.links.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-[15px] font-sans text-obsidian/70 hover:text-obsidian transition-colors"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </motion.div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SEARCH OVERLAY ── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-white/[0.98] backdrop-blur-sm"
          >
            <div className="flex flex-col items-center pt-32 px-6">
              <p className="text-[10px] font-sans font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-6">
                Search The Heritage Edit
              </p>

              <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl relative">
                <Search
                  className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-300"
                  size={22}
                  strokeWidth={1.5}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search designers, pieces, collections..."
                  className="w-full h-16 pl-10 pr-4 bg-transparent border-b-2 border-obsidian/10 text-xl font-serif text-obsidian placeholder:text-neutral-300 focus:outline-none focus:border-heritage-green transition-colors"
                />
              </form>

              <div className="mt-10 flex flex-wrap justify-center gap-2">
                {["Agbada", "Aso Oke", "Ankara", "Senator Wear", "Coral Beads"].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                      router.push(`/shop?search=${encodeURIComponent(term)}`);
                    }}
                    className="px-4 py-2 border border-slate-border text-xs font-sans text-neutral-500 hover:border-heritage-green hover:text-heritage-green transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
              }}
              className="absolute top-6 right-6 p-3 text-obsidian/40 hover:text-obsidian transition-colors"
              aria-label="Close search"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
