import { Link } from "@tanstack/react-router";

import { ShopBar } from "@/components/shop/ShopBar";
import type { LegalDoc } from "@/data/legal";

/**
 * A quiet, brass-and-ink legal page. One shared layout for the four
 * small-print documents so they read as a set.
 */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <div className="min-h-screen bg-ink">
      <ShopBar />
      <main className="animate-walk-in">
        <section className="mx-auto max-w-[820px] px-6 pt-28 pb-6 sm:px-8">
          <p className="pixel-label text-brass/70">Bookmart &amp; GameXchange</p>
          <h1 className="sign-plate mt-2.5 text-[clamp(1.8rem,4vw,2.5rem)] leading-[1.12] text-lamplight">
            {doc.title}
          </h1>
          <p className="mt-3 text-[0.8rem] text-muted-foreground/70">
            Last updated {doc.lastUpdated}
          </p>
        </section>

        <section className="mx-auto max-w-[820px] px-6 pb-16 sm:px-8">
          <div className="space-y-10">
            {doc.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="sign-plate text-[1.15rem] leading-[1.3] text-lamplight/90">
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 40)}
                      className="measure text-[0.9rem] leading-[1.75] text-foreground/75"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <footer className="mt-16 border-t border-brass/15 pt-8">
            <p className="pixel-label text-brass/60">The small print</p>
            <nav aria-label="Legal" className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
              <Link
                to="/privacy"
                activeProps={{ "aria-current": "page" }}
                className="shop-meta text-brass/70 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight aria-[current=page]:text-lamplight"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                activeProps={{ "aria-current": "page" }}
                className="shop-meta text-brass/70 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight aria-[current=page]:text-lamplight"
              >
                Terms &amp; Conditions
              </Link>
              <Link
                to="/returns"
                activeProps={{ "aria-current": "page" }}
                className="shop-meta text-brass/70 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight aria-[current=page]:text-lamplight"
              >
                Returns Policy
              </Link>
              <Link
                to="/cookies"
                activeProps={{ "aria-current": "page" }}
                className="shop-meta text-brass/70 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight aria-[current=page]:text-lamplight"
              >
                Cookie Policy
              </Link>
            </nav>
            <p className="mt-6 text-[0.75rem] leading-[1.6] text-muted-foreground/60">
              &copy; {new Date().getFullYear()} Bookmart &amp; GameXchange, 73 Talbot Street,
              Dublin 1, D01 TW28, Ireland.
            </p>
          </footer>
        </section>
      </main>
    </div>
  );
}
