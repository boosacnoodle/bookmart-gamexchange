import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera } from "lucide-react";
import { useEffect } from "react";

import { BigLink, Empty, Panel, Row } from "@/components/staff/StaffKit";
import { StaffShell } from "@/components/staff/StaffShell";
import { getStaffDashboard } from "@/lib/intake.server";
import { itemName, useDrafts, useStaff, whenTouched } from "@/lib/staff";

export const Route = createFileRoute("/staff/today")({
  loader: () => getStaffDashboard(),
  head: () => ({
    meta: [
      { title: "Today — Bookmart & GameXchange back office" },
      { name: "description", content: "What needs doing in the shop today." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Today — Bookmart back office" },
      { property: "og:description", content: "What needs doing in the shop today." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Today,
});

function Today() {
  const staff = useStaff();
  const navigate = useNavigate();
  const drafts = useDrafts();
  const dashboard = Route.useLoaderData();

  useEffect(() => {
    if (staff === null) navigate({ to: "/staff", replace: true });
  }, [staff, navigate]);

  const hello = staff ? `Morning, ${staff.name}.` : "";

  return (
    <StaffShell
      step="Today"
      title={hello || "Today"}
      intro="Everything waiting on you, in the order it matters."
      footer={
        <BigLink to="/staff/add">
          <Camera aria-hidden="true" className="mr-3 h-5 w-5" />
          Scan and list item
        </BigLink>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <Count label="Not finished" value={drafts.length} />
        <Count label="Put up today" value={dashboard.publishedToday} />
      </div>

      <Panel title="Orders needing attention">
        {dashboard.orders === 0 ? (
          <Empty>No paid orders are waiting for attention.</Empty>
        ) : (
          <Row
            to="/staff/orders"
            title={`${dashboard.orders} order${dashboard.orders === 1 ? "" : "s"} waiting`}
            detail="Open orders and prepare collection or dispatch."
            flag
          />
        )}
      </Panel>

      <Panel title="Back office">
        <Row
          to="/staff/add"
          title="Add item manually"
          detail="For stock without a usable barcode"
        />
        <Row to="/staff/orders" title="Orders" detail="Prepare collection and dispatch orders" />
        <Row to="/staff/stock" title="Stock" detail="Everything currently on the shelves" />
        <Row
          to="/staff/settings"
          title="Setup status"
          detail="Scanner, lookup, payments and email"
        />
      </Panel>

      <Panel title="Not finished yet">
        {drafts.length === 0 ? (
          <Empty>Nothing half-done. Anything you start and leave shows up here.</Empty>
        ) : (
          drafts.map((item) => (
            <Row
              key={item.id}
              to="/staff/add/details"
              title={itemName(item)}
              detail={item.photos > 0 ? `${item.photos} photo(s) taken` : "No photos yet"}
              meta={whenTouched(item.updated)}
            />
          ))
        )}
      </Panel>

      <Panel title="Items needing another look">
        {dashboard.review === 0 ? (
          <Empty>No listings need review.</Empty>
        ) : (
          <Row
            to="/staff/stock"
            title={`${dashboard.review} item${dashboard.review === 1 ? "" : "s"} need another look`}
            detail="Check the listing before it goes live."
          />
        )}
      </Panel>

      <Panel title="Just put up" action={{ to: "/staff/stock", label: "View stock" }}>
        {dashboard.recent.length === 0 ? (
          <Empty>Nothing yet today. Items you publish appear here.</Empty>
        ) : (
          dashboard.recent.map((item) => (
            <Row
              key={item.id}
              to="/staff/stock"
              title={item.title}
              detail={`${item.shelf} · €${(item.priceMinor / 100).toFixed(2)}`}
              meta={whenTouched(item.updated)}
            />
          ))
        )}
      </Panel>
    </StaffShell>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-sm bg-timber-deep/45 px-4 py-4"
      style={{ boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--brass) 14%, transparent)" }}
    >
      <p className="sign-plate text-[1.6rem] leading-none text-lamplight">{value}</p>
      <p className="shop-meta mt-2 text-brass/55">{label}</p>
    </div>
  );
}
