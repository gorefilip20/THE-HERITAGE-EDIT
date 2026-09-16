import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type PolicySection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

type PolicyPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  updated?: string;
  sections: PolicySection[];
};

export function PolicyPage({ eyebrow, title, intro, updated = "Effective immediately", sections }: PolicyPageProps) {
  return (
    <div className="min-h-screen bg-ivory text-obsidian">
      <Navbar />
      <main id="main-content">
        <header className="border-b border-slate-border bg-[#f4eadc]">
          <div className="luxury-container px-5 py-20 md:px-8 md:py-28">
            <Link href="/" className="mb-8 inline-flex text-[10px] font-sans font-semibold tracking-[0.24em] uppercase text-heritage-green hover:text-heritage-purple transition-colors">
              The Heritage Edit
            </Link>
            <p className="mb-4 text-[10px] font-sans font-semibold tracking-[0.34em] uppercase text-heritage-purple">
              {eyebrow}
            </p>
            <h1 className="max-w-3xl text-4xl font-serif leading-tight tracking-[-0.03em] text-obsidian md:text-6xl">
              {title}
            </h1>
            <p className="mt-7 max-w-2xl text-base font-sans leading-8 text-obsidian/65 md:text-lg">
              {intro}
            </p>
            <p className="mt-6 text-[11px] font-sans tracking-[0.12em] uppercase text-obsidian/45">
              {updated}
            </p>
          </div>
        </header>

        <div className="luxury-container grid gap-12 px-5 py-16 md:grid-cols-[220px_minmax(0,1fr)] md:px-8 md:py-24">
          <aside className="hidden md:block">
            <p className="sticky top-8 text-[10px] font-sans font-semibold tracking-[0.24em] uppercase text-obsidian/40">
              Customer care
            </p>
          </aside>
          <article className="max-w-3xl space-y-12">
            {sections.map((section) => (
              <section key={section.title} className="border-b border-slate-border pb-10 last:border-0">
                <h2 className="text-2xl font-serif text-obsidian md:text-3xl">{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-5 text-[15px] font-sans leading-8 text-obsidian/70">
                    {paragraph}
                  </p>
                ))}
                {section.items && (
                  <ul className="mt-5 space-y-4 text-[15px] font-sans leading-8 text-obsidian/70">
                    {section.items.map((item) => <li key={item} className="pl-5 before:mr-3 before:-ml-5 before:text-heritage-green before:content-['—']">{item}</li>)}
                  </ul>
                )}
              </section>
            ))}
            <div className="border border-heritage-green/20 bg-white/60 p-6 text-sm font-sans leading-7 text-obsidian/65">
              Questions? Contact <a className="font-medium text-heritage-green underline underline-offset-4" href="mailto:officialtheheritageedit@gmail.com">officialtheheritageedit@gmail.com</a>.
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
