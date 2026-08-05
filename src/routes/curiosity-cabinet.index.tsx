import { createFileRoute } from "@tanstack/react-router";

import { RoomPage } from "@/components/shop/RoomPage";
import { getRoom } from "@/data/rooms";
import { getRoomInventory } from "@/lib/catalog.server";

const TITLE = "The Curiosity Cabinet — collectables, cards & oddities | Bookmart & GameXchange";
const DESCRIPTION =
  "Drawers of things that arrived with no category: collectables, trading cards, figures and outright oddities, all one-offs, all second-hand.";

export const Route = createFileRoute("/curiosity-cabinet/")({
  loader: () => getRoomInventory({ data: { room: "curiosity" } }),
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
  component: CuriosityRoom,
});

function CuriosityRoom() {
  const { shelf } = Route.useSearch();
  const inventory = Route.useLoaderData();

  return (
    <RoomPage
      room={getRoom("curiosity")}
      shelf={shelf}
      allLabel="Open every drawer"
      shelfHeading="Found in the drawers"
      featuredHeading="Recently discovered"
      recentHeading="Last things through the door"
      inventory={inventory}
    />
  );
}
