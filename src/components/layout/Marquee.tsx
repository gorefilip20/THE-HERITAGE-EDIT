"use client";

import { useLocale } from "@/context/LocaleContext";

export function Marquee() {
  const { formatPrice, t } = useLocale();
  const shippingThreshold = formatPrice(50_000_000);

  const items = [
    `${t("shipping.free")} ${shippingThreshold}`,
    "Authentic luxury — every piece verified",
    "Handcrafted heritage narratives for every garment",
    "Express worldwide delivery available",
  ];

  const repeated = [...items, ...items];

  return (
    <div className="bg-heritage-green text-white overflow-hidden h-9 flex items-center">
      <div className="animate-marquee flex whitespace-nowrap">
        {repeated.map((item, idx) => (
          <span
            key={idx}
            className="text-[11px] font-sans font-medium tracking-[0.2em] uppercase text-white/70"
          >
            <span className="mx-5 text-white/30">✦</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
