"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Calendar, ShoppingBag } from "lucide-react";
import type { HeritageNarrative as HeritageData } from "@/types";

interface HeritageNarrativeProps {
  heritage: HeritageData;
}

const tabs = [
  { id: "heritage", label: "Heritage & History", icon: BookOpen },
  { id: "styling", label: "When to Wear", icon: Sparkles },
  { id: "occasions", label: "The Right Occasion", icon: Calendar },
  { id: "complete", label: "Complete the Look", icon: ShoppingBag },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function HeritageNarrativeComponent({ heritage }: HeritageNarrativeProps) {
  const [activeTab, setActiveTab] = useState<TabId>("heritage");

  return (
    <section className="border-t border-slate-border">
      {/* Section header */}
      <div className="pt-12 pb-8 text-center">
        <p className="text-[10px] font-sans font-medium tracking-[0.3em] uppercase text-heritage-purple mb-3">
          AI-Curated
        </p>
        <h2 className="text-display-sm md:text-display-md font-serif italic text-obsidian">
          The Heritage Narrative
        </h2>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-slate-border">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-6 py-4 whitespace-nowrap text-sm font-sans font-medium tracking-wide transition-colors duration-200 ${
                  isActive ? "text-heritage-green" : "text-neutral-400 hover:text-obsidian"
                }`}
              >
                <Icon size={16} strokeWidth={1.5} />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="heritage-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-heritage-green"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="py-10 md:py-14 min-h-[300px]">
        <AnimatePresence mode="wait">
          {activeTab === "heritage" && (
            <TabPanel key="heritage">
              <div className="max-w-3xl mx-auto">
                <div className="prose prose-lg font-serif text-obsidian/80 leading-relaxed">
                  {heritage.historyAndHeritage.split("\n\n").map((paragraph, idx) => (
                    <p key={idx} className="mb-6 first:text-xl first:leading-relaxed first:text-obsidian">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </TabPanel>
          )}

          {activeTab === "styling" && (
            <TabPanel key="styling">
              <div className="max-w-3xl mx-auto">
                <div className="prose prose-lg font-serif text-obsidian/80 leading-relaxed">
                  {heritage.whenToWear.split("\n\n").map((paragraph, idx) => (
                    <p key={idx} className="mb-6 first:text-xl first:leading-relaxed first:text-obsidian">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </TabPanel>
          )}

          {activeTab === "occasions" && (
            <TabPanel key="occasions">
              <div className="max-w-3xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {heritage.rightOccasion.map((occasion, idx) => (
                    <motion.div
                      key={occasion}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-4 p-5 bg-ivory border border-slate-border"
                    >
                      <div className="w-8 h-8 flex items-center justify-center bg-heritage-green/5 text-heritage-green shrink-0">
                        <Calendar size={16} strokeWidth={1.5} />
                      </div>
                      <p className="text-sm font-sans text-obsidian/80 leading-relaxed">
                        {occasion}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabPanel>
          )}

          {activeTab === "complete" && (
            <TabPanel key="complete">
              <div className="max-w-3xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {heritage.styleRecommendations.map((rec, idx) => (
                    <motion.div
                      key={rec}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-4 p-5 border border-slate-border group hover:border-heritage-green/30 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 flex items-center justify-center bg-heritage-purple/5 text-heritage-purple shrink-0">
                        <ShoppingBag size={16} strokeWidth={1.5} />
                      </div>
                      <p className="text-sm font-sans text-obsidian/80 leading-relaxed group-hover:text-heritage-green transition-colors">
                        {rec}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabPanel>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function TabPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
