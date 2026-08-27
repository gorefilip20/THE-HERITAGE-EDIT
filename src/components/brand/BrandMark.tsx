import Image from "next/image";
import Link from "next/link";

type BrandMarkProps = {
  href?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_MAP = {
  sm: { image: 28, text: "text-[11px]", gap: "gap-2" },
  md: { image: 38, text: "text-[14px]", gap: "gap-2.5" },
  lg: { image: 54, text: "text-[18px]", gap: "gap-3" },
} as const;

export function BrandMark({
  href,
  showWordmark = true,
  size = "md",
  className = "",
}: BrandMarkProps) {
  const config = SIZE_MAP[size];
  const content = (
    <span className={`inline-flex items-center ${config.gap} ${className}`}>
      <Image
        src="/brand/the-heritage-edit-logo.jpg"
        alt="The Heritage Edit emblem"
        width={config.image}
        height={config.image}
        className="shrink-0 rounded-[3px] object-cover"
        priority={size !== "sm"}
      />
      {showWordmark && (
        <span className={`${config.text} font-serif font-semibold tracking-[0.12em] whitespace-nowrap`}>
          THE HERITAGE EDIT
        </span>
      )}
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
