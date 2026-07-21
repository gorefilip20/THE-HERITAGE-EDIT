"use client";

export function Marquee() {
  const items = [
    "Complimentary shipping on orders over ₦500,000",
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
