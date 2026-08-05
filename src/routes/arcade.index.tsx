import { createFileRoute } from "@tanstack/react-router";

import { RoomPage } from "@/components/shop/RoomPage";
import { getRoom } from "@/data/rooms";
import { getRoomInventory } from "@/lib/catalog.server";

const TITLE = "The Arcade — retro & modern games in Dublin | Bookmart & GameXchange";
const DESCRIPTION =
  "Second-hand games in the Arcade: Nintendo, PlayStation, Xbox and retro shelves. Every cart and disc tested in the shop before it goes out.";

export const Route = createFileRoute("/arcade/")({
  loader: () => getRoomInventory({ data: { room: "arcade" } }),
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
  component: ArcadeRoom,
});

function ArcadeRoom() {
  const { shelf } = Route.useSearch();
  const inventory = Route.useLoaderData();

  return (
    <RoomPage
      room={getRoom("arcade")}
      shelf={shelf}
      allLabel="Every platform"
      shelfHeading="On the shelves"
      featuredHeading="Pick of the shelves"
      recentHeading="Recently traded in"
      inventory={inventory}
    />
  );
}
