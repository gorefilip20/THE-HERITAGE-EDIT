interface HEMonogramProps {
  variant?: "dark" | "gold" | "white";
  size?: number;
  className?: string;
}

const COLORS = {
  dark: "#0D2C22",
  gold: "#B08D57",
  white: "#FFFFFF",
};

export default function HEMonogram({
  variant = "dark",
  size = 32,
  className = "",
}: HEMonogramProps) {
  const color = COLORS[variant];

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="THE HERITAGE EDIT monogram"
    >
      {/* Outer frame with corner marks — Nsibidi-inspired geometric border */}
      <rect
        x="4"
        y="4"
        width="112"
        height="112"
        stroke={color}
        strokeWidth="2.5"
      />
      {/* Corner marks */}
      <line x1="4" y1="4" x2="18" y2="4" stroke={color} strokeWidth="3.5" />
      <line x1="4" y1="4" x2="4" y2="18" stroke={color} strokeWidth="3.5" />
      <line x1="102" y1="4" x2="116" y2="4" stroke={color} strokeWidth="3.5" />
      <line x1="116" y1="4" x2="116" y2="18" stroke={color} strokeWidth="3.5" />
      <line x1="4" y1="102" x2="4" y2="116" stroke={color} strokeWidth="3.5" />
      <line x1="4" y1="116" x2="18" y2="116" stroke={color} strokeWidth="3.5" />
      <line
        x1="116"
        y1="102"
        x2="116"
        y2="116"
        stroke={color}
        strokeWidth="3.5"
      />
      <line
        x1="102"
        y1="116"
        x2="116"
        y2="116"
        stroke={color}
        strokeWidth="3.5"
      />

      {/* H letterform — left vertical */}
      <rect x="24" y="24" width="7" height="72" fill={color} />
      {/* H — right vertical */}
      <rect x="53" y="24" width="7" height="72" fill={color} />
      {/* H — crossbar */}
      <rect x="24" y="57" width="36" height="6" fill={color} />

      {/* E letterform — vertical stem, fused with H's right vertical */}
      <rect x="53" y="24" width="7" height="72" fill={color} />
      {/* E — top arm */}
      <rect x="53" y="24" width="36" height="6" fill={color} />
      {/* E — middle arm */}
      <rect x="53" y="57" width="32" height="6" fill={color} />
      {/* E — bottom arm */}
      <rect x="53" y="90" width="36" height="6" fill={color} />

      {/* Ichi diamond at H-E intersection */}
      <polygon
        points="56.5,51 63,57 56.5,63 50,57"
        fill={color}
        opacity="0.85"
      />

      {/* Subtle Uli spiral flourish — bottom right */}
      <path
        d="M92,82 C92,76 98,76 98,82 C98,90 88,90 88,80 C88,70 102,70 102,82"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
