import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Row } from "@/components/staff/StaffKit";
import { StaffShell } from "@/components/staff/StaffShell";
import { ITEM_KINDS, startItem } from "@/lib/staff";

export const Route = createFileRoute("/staff/add/")({
  head: () => ({
    meta: [
      { title: "What are you adding? — Bookmart back office" },
      { name: "description", content: "Start adding an item to the shop." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "What are you adding?" },
      { property: "og:description", content: "Start adding an item to the shop." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AddStart,
});

function AddStart() {
  const navigate = useNavigate();

  return (
    <StaffShell
      step="Step 1 of 5"
      title="What are you adding?"
      intro="Pick the closest one. You can change it later."
      back={{ to: "/staff/today", label: "Today" }}
    >
      <div className="space-y-2">
        {ITEM_KINDS.map((kind) => (
          <Row
            key={kind.id}
            title={kind.label}
            detail={kind.hint}
            onClick={() => {
              startItem(kind.id);
              navigate({ to: "/staff/add/scan" });
            }}
          />
        ))}
      </div>
    </StaffShell>
  );
}
