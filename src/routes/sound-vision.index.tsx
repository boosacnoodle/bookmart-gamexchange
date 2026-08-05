import { createFileRoute } from "@tanstack/react-router";

import { RoomPage } from "@/components/shop/RoomPage";
import { getRoom } from "@/data/rooms";

const TITLE = "Sound & Vision — vinyl, CDs, DVDs & Blu-rays | Bookmart & GameXchange";
const DESCRIPTION =
  "Dig through the crates in Sound & Vision: second-hand vinyl, CDs, DVDs, Blu-rays and soundtracks, all graded and played through in the shop.";

export const Route = createFileRoute("/sound-vision/")({
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
  component: SoundVisionRoom,
});

function SoundVisionRoom() {
  const { shelf } = Route.useSearch();

  return (
    <RoomPage
      room={getRoom("sound-vision")}
      shelf={shelf}
      allLabel="Every crate"
      shelfHeading="In the crates"
      featuredHeading="On the turntable this week"
      recentHeading="Just come in"
    />
  );
}