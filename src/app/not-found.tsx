import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <p className="text-[10px] font-sans font-medium tracking-[0.4em] uppercase text-neutral-400 mb-4">
          Page Not Found
        </p>
        <h1 className="text-5xl font-serif text-obsidian mb-4">404</h1>
        <p className="text-sm font-sans text-neutral-500 mb-8 leading-relaxed">
          The page you are looking for may have been moved or no longer exists.
          Let us guide you back to our collection.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-8 bg-heritage-green text-white text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-heritage-green/90 transition-colors"
          >
            Return Home
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center h-12 px-8 border border-slate-border text-obsidian text-[11px] font-sans font-semibold tracking-[0.15em] uppercase hover:bg-obsidian hover:text-white transition-colors"
          >
            Shop Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
