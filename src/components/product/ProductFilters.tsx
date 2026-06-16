"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSection {
  key: string;
  label: string;
  options: Array<{ value: string; label: string; count?: number }>;
  type: "checkbox" | "range";
}

interface ProductFiltersProps {
  sections: FilterSection[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (key: string, values: string[]) => void;
  onClearAll: () => void;
  totalResults: number;
}

export function ProductFilters({
  sections,
  activeFilters,
  onFilterChange,
  onClearAll,
  totalResults,
}: ProductFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map((s) => s.key)),
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const totalActiveFilters = Object.values(activeFilters).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleOption = (sectionKey: string, value: string) => {
    const current = activeFilters[sectionKey] ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange(sectionKey, next);
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Active filter pills */}
      {totalActiveFilters > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-medium tracking-wider uppercase text-neutral-400">
              Active Filters
            </span>
            <button
              onClick={onClearAll}
              className="text-xs font-sans text-heritage-green hover:underline"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, values]) =>
              values.map((val) => (
                <button
                  key={`${key}-${val}`}
                  onClick={() => toggleOption(key, val)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-ivory text-xs font-sans text-obsidian border border-slate-border hover:border-heritage-green transition-colors"
                >
                  {val}
                  <X size={10} />
                </button>
              )),
            )}
          </div>
        </div>
      )}

      {/* Filter sections */}
      {sections.map((section) => (
        <div key={section.key} className="border-t border-slate-border pt-5">
          <button
            onClick={() => toggleSection(section.key)}
            className="flex items-center justify-between w-full mb-4"
          >
            <span className="text-xs font-sans font-medium tracking-[0.15em] uppercase text-obsidian">
              {section.label}
            </span>
            <ChevronDown
              size={14}
              className={cn(
                "text-neutral-400 transition-transform duration-200",
                expandedSections.has(section.key) && "rotate-180",
              )}
            />
          </button>

          <AnimatePresence>
            {expandedSections.has(section.key) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-2.5 pb-2">
                  {section.options.map((opt) => {
                    const isActive = (
                      activeFilters[section.key] ?? []
                    ).includes(opt.value);

                    return (
                      <label
                        key={opt.value}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div
                          className={cn(
                            "w-4 h-4 border flex items-center justify-center transition-all duration-200",
                            isActive
                              ? "bg-heritage-green border-heritage-green"
                              : "border-neutral-300 group-hover:border-heritage-green",
                          )}
                        >
                          {isActive && (
                            <svg
                              width="10"
                              height="8"
                              viewBox="0 0 10 8"
                              fill="none"
                            >
                              <path
                                d="M1 4L3.5 6.5L9 1"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-sans text-obsidian/80 group-hover:text-obsidian transition-colors">
                          {opt.label}
                        </span>
                        {opt.count !== undefined && (
                          <span className="ml-auto text-xs font-sans text-neutral-300">
                            ({opt.count})
                          </span>
                        )}
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => toggleOption(section.key, opt.value)}
                          className="sr-only"
                        />
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-24 self-start">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-sans font-semibold tracking-[0.2em] uppercase text-obsidian">
            Filter
          </h2>
          <span className="text-xs font-sans text-neutral-400">
            {totalResults} results
          </span>
        </div>
        {filterContent}
      </aside>

      {/* Mobile filter trigger */}
      <div className="lg:hidden mb-6 flex items-center justify-between">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="inline-flex items-center gap-2 luxury-button-secondary h-10 px-5"
        >
          <SlidersHorizontal size={14} />
          <span>Filter</span>
          {totalActiveFilters > 0 && (
            <span className="w-5 h-5 flex items-center justify-center bg-heritage-green text-white text-[10px] rounded-full">
              {totalActiveFilters}
            </span>
          )}
        </button>
        <span className="text-xs font-sans text-neutral-400">
          {totalResults} results
        </span>
      </div>

      {/* Mobile filter panel */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-50 p-6 overflow-y-auto lg:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-sans font-semibold tracking-wider uppercase">
                  Filter
                </h2>
                <button onClick={() => setIsMobileOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              {filterContent}
              <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t border-slate-border">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="luxury-button-primary w-full"
                >
                  Show {totalResults} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
