import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { BigLink } from "@/components/staff/StaffKit";
import { StaffShell } from "@/components/staff/StaffShell";
import { getRoom } from "@/data/rooms";
import { itemName, usePublished } from "@/lib/staff";

export const Route = createFileRoute("/staff/add/done")({
  head: () => ({
    meta: [
      { title: "It's up — Bookmart back office" },
      { name: "description", content: "The item is live on the website." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "It's up" },
      { property: "og:description", content: "The item is live on the website." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DoneStep,
});

function DoneStep() {
  const item = usePublished()[0];
  const room = item ? getRoom(item.room) : undefined;

  return (
    <StaffShell title="It's up" intro="On the website now, and on the shelf where you said.">
      <div
        className="rounded-sm bg-timber-deep/50 px-5 py-7 text-center"
        style={{ boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--brass) 22%, transparent)" }}
      >
        <span
          aria-hidden="true"
          className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-timber/90 text-lamplight"
          style={{ boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--brass) 45%, transparent)" }}
        >
          <Check className="h-6 w-6" />
        </span>
        <p className="sign-plate mt-5 text-[1.15rem] text-lamplight">
          {item ? itemName(item) : "Item published"}
        </p>
        {item ? (
          <p className="mt-2 text-[0.9rem] leading-[1.6] text-foreground/60">
            €{item.price} · {item.condition} · {item.shelf}
            {room ? `, ${room.name}` : ""}
          </p>
        ) : null}
      </div>

      <div className="mt-7 space-y-3">
        <BigLink to="/staff/add">Add another item</BigLink>
        {room ? (
          <BigLink to={room.href} tone="quiet">
            See it on the website
          </BigLink>
        ) : null}
        <BigLink to="/staff/today" tone="quiet">
          Back to today
        </BigLink>
      </div>
    </StaffShell>
  );
}