"use client";

import { useLocale } from "@/context/LocaleContext";

export function Marquee() {
  const { formatPrice, t } = useLocale();
  const shippingThreshold = formatPrice(50_000_000);

  const items = [
    `${t("shipping.free")} ${shippingThreshold}`,
    "Authentic luxury — every piece verified",
    "AI-powered heritage narratives for every garment",
    "Express worldwide delivery available",
  ];

  const repeated = [...items, ...items];

  return (
    <div className="bg-heritage-green text-white overflow-hidden h-9 flex items-center">
      <div className="animate-marquee flex whitespace-nowrap">
        {repeated.map((item, idx) => (
          <span
            key={idx}
            className="text-[10px] font-sans font-medium tracking-[0.2em] uppercase mx-12"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
