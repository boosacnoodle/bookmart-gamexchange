import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { ObjectPage } from "@/components/shop/ObjectPage";
import { ShopBar } from "@/components/shop/ShopBar";
import { getRoom } from "@/data/rooms";
import { availabilityLabel, findItem, shopkeeperNote } from "@/data/objects";

const ROOM = "sound-vision" as const;

export const Route = createFileRoute("/sound-vision/$slug")({
  loader: ({ params }) => {
    const item = findItem(ROOM, params.slug);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Not on the shelf — Bookmart & GameXchange" }, { name: "robots", content: "noindex" }],
      };
    }
    const { item } = loaderData;
    const title = `${item.title} — ${item.maker} | Sound & Vision, Bookmart & GameXchange`;
    const description = [
      `${item.condition} second-hand copy of ${item.title} by ${item.maker} on the ${item.shelf} shelf in Sound & Vision, Dublin.`,
      availabilityLabel(item),
      shopkeeperNote(item) ?? item.note,
    ]
      .join(" ")
      .slice(0, 157);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: MissingObject,
  component: ObjectRoute,
});

function ObjectRoute() {
  const { item } = Route.useLoaderData();
  return <ObjectPage room={getRoom(ROOM)} item={item} />;
}

function MissingObject() {
  const room = getRoom(ROOM);
  return (
    <div className="min-h-screen bg-ink">
      <ShopBar />
      <main className="mx-auto max-w-[900px] px-6 pt-32 pb-24 sm:px-8">
        <h1 className="sign-plate text-[clamp(1.5rem,3vw,2.1rem)] leading-[1.2] text-lamplight">
          Not on the shelf
        </h1>
        <p className="measure mt-4 text-[0.95rem] leading-[1.75] text-foreground/70">
          There is one copy of everything here, so things do leave. Have a look along the rest of
          the shelves and we will keep an eye out for another.
        </p>
        <p className="shop-meta mt-8 text-brass/60">
          <Link
            to={room.href}
            className="transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight"
          >
            Back into Sound & Vision
          </Link>
        </p>
      </main>
    </div>
  );
}
