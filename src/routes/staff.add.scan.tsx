import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { BigButton, Field, inputClass, inputShadow } from "@/components/staff/StaffKit";
import { StaffShell } from "@/components/staff/StaffShell";
import { saveItem, useCurrentItem } from "@/lib/staff";

export const Route = createFileRoute("/staff/add/scan")({
  head: () => ({
    meta: [
      { title: "Scan barcode — Bookmart back office" },
      { name: "description", content: "Scan the barcode on the item." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Scan barcode" },
      { property: "og:description", content: "Scan the barcode on the item." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ScanStep,
});

function ScanStep() {
  const item = useCurrentItem();
  const navigate = useNavigate();
  const [typed, setTyped] = useState("");
  const [held, setHeld] = useState(item?.barcode ?? "");

  function keep(code: string) {
    if (item) saveItem(item.id, { barcode: code });
    setHeld(code);
  }

  return (
    <StaffShell
      step="Step 2 of 5"
      title="Scan barcode"
      intro="Hold the barcode inside the box. If there is no barcode, skip this — plenty of our stock is older than barcodes."
      back={{ to: "/staff/add", label: "Back" }}
      footer={
        <>
          <BigButton onClick={() => navigate({ to: "/staff/add/photos" })}>
            {held ? "Next — take photos" : "No barcode — take photos"}
          </BigButton>
        </>
      }
    >
      {/* The viewfinder. Camera scanning gets wired to the shop scanner later. */}
      <div
        className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-sm bg-timber-deep/60"
        style={{ boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--brass) 18%, transparent)" }}
      >
        <div
          aria-hidden="true"
          className="h-24 w-3/4 rounded-[2px]"
          style={{ boxShadow: "0 0 0 2px color-mix(in oklab, var(--brass) 55%, transparent)" }}
        />
        <p className="shop-meta absolute bottom-4 text-brass/55">Camera opens here</p>
      </div>

      <p aria-live="polite" className="mt-4 min-h-[1.4em] text-[0.92rem] text-lamplight/80">
        {held ? `Barcode held: ${held}` : "Nothing scanned yet."}
      </p>

      <div className="mt-6 space-y-4">
        <Field label="Or type the numbers" hint="The long number printed under the lines.">
          <input
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            inputMode="numeric"
            placeholder="9780141182682"
            className={inputClass}
            style={inputShadow}
          />
        </Field>
        <BigButton tone="quiet" disabled={typed.trim().length < 4} onClick={() => keep(typed.trim())}>
          Use this number
        </BigButton>
      </div>
    </StaffShell>
  );
}