import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";

import { RoomPage } from "@/components/shop/RoomPage";
import { StockCard } from "@/components/shop/StockCard";
import { getRoom } from "@/data/rooms";
import { ARCHIVE_STOCK } from "@/data/stock";
import { getRoomInventory } from "@/lib/catalog.server";

const TITLE = "The Library — books at Bookmart & GameXchange, Dublin";
const DESCRIPTION =
  "Second-hand books in the Library: fiction, non-fiction, children's and Irish writing, plus the locked Archive of rare and signed copies. One copy of everything.";

export const Route = createFileRoute("/library/")({
  loader: () => getRoomInventory({ data: { room: "library" } }),
  validateSearch: (search: Record<string, unknown>) => ({
    shelf: typeof search["shelf"] === "string" ? (search["shelf"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LibraryRoom,
});

function LibraryRoom() {
  const { shelf } = Route.useSearch();
  const inventory = Route.useLoaderData();

  return (
    <RoomPage
      room={getRoom("library")}
      shelf={shelf}
      allLabel="All books"
      shelfHeading="On the shelves"
      featuredHeading="Featured arrivals"
      recentHeading="Recently traded books"
      inventory={inventory.filter((item) => !item.archive)}
      afterStock={<Archive inventory={inventory.filter((item) => item.archive)} />}
    />
  );
}

function Archive({ inventory }: { inventory: typeof ARCHIVE_STOCK }) {
  return (
    <section
      id="archive"
      aria-label="The Archive"
      className="mx-auto max-w-[1800px] scroll-mt-24 px-6 pb-16 sm:px-8"
    >
      <div
        className="relative isolate overflow-hidden rounded-sm bg-timber-deep/70 p-7 sm:p-9"
        style={{ boxShadow: "var(--shadow-case)" }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.55]"
          style={{
            background:
              "radial-gradient(30rem 16rem at 20% 0%, color-mix(in oklab, var(--brass) 7%, transparent), transparent 70%), repeating-linear-gradient(96deg, oklch(0 0 0 / 0.05) 0 1px, transparent 1px 7px)",
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-40"
          style={{
            background:
              "linear-gradient(104deg, transparent 24%, color-mix(in oklab, var(--lamplight) 9%, transparent) 34%, transparent 46%)",
          }}
        />
        <div className="flex items-start gap-4">
          <KeyRound className="mt-0.5 h-[1.1rem] w-[1.1rem] shrink-0 text-brass/70" />
          <div className="min-w-0">
            <p className="pixel-label text-brass/65">At the back of the Library</p>
            <h2 className="sign-plate mt-2 text-[1.35rem] leading-[1.2] text-lamplight/90">
              The Archive
            </h2>
            <p className="measure mt-3 text-[0.875rem] leading-[1.7] text-muted-foreground">
              A locked glass cabinet. First editions, signed copies and books we had to think twice
              about selling. Ask at the counter and we will open it.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...inventory, ...ARCHIVE_STOCK].map((item) => (
            <StockCard key={item.id} item={item} />
          ))}
        </div>

        <p className="shop-meta mt-8 text-brass/60">
          <Link
            to="/trade"
            className="transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight"
          >
            Selling something rare? Bring it to the Trade Counter &rarr;
          </Link>
        </p>
      </div>
    </section>
  );
}
