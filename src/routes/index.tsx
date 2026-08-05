import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";

import { ShopBar } from "@/components/shop/ShopBar";
import { Storefront } from "@/components/shop/Storefront";
import { Rooms } from "@/components/shop/Rooms";
import { TradeCounter } from "@/components/shop/TradeCounter";

const TITLE = "Bookmart & GameXchange — Second-hand shop, Talbot Street, Dublin";
const DESCRIPTION =
  "An independent second-hand shop in Dublin 1. Books, rare books, retro games, Nintendo, PlayStation, Xbox, films, music and collectables. Every copy is the only one we have.";

export const Route = createFileRoute("/")({
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
  component: Index,
});

function Index() {
  const enter = useCallback(() => {
    document.getElementById("inside")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="min-h-screen bg-ink">
      <ShopBar />
      <main>
        <Storefront onEnter={enter} />
        <Rooms />
        <TradeCounter />
      </main>
    </div>
  );
}
