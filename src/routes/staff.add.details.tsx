import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { BigButton, Field, inputClass, inputShadow } from "@/components/staff/StaffKit";
import { StaffShell } from "@/components/staff/StaffShell";
import { saveItem, useCurrentItem } from "@/lib/staff";

export const Route = createFileRoute("/staff/add/details")({
  head: () => ({
    meta: [
      { title: "Is this right? — Bookmart back office" },
      { name: "description", content: "Check what we found about the item." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Is this right?" },
      { property: "og:description", content: "Check what we found about the item." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DetailsStep,
});

/** Example suggestions, as if read off the barcode and the photographs. */
const SUGGESTED = {
  book: { title: "At Swim-Two-Birds", maker: "Flann O'Brien", year: "1976", extra: "Penguin Books" },
  game: { title: "The Legend of Zelda: Majora's Mask", maker: "Nintendo 64", year: "2000", extra: "Cartridge only" },
  "music-film": { title: "Rumours", maker: "Fleetwood Mac", year: "1977", extra: "Warner Bros. Records" },
  rare: { title: "Boxed Stormtrooper figure", maker: "Kenner", year: "1983", extra: "Carded, unopened" },
} as const;

function DetailsStep() {
  const item = useCurrentItem();
  const navigate = useNavigate();
  const guess = item ? SUGGESTED[item.kind] : undefined;

  const [title, setTitle] = useState("");
  const [maker, setMaker] = useState("");
  const [year, setYear] = useState("");
  const [extra, setExtra] = useState("");

  useEffect(() => {
    if (!item) return;
    setTitle(item.title || guess?.title || "");
    setMaker(item.maker || guess?.maker || "");
    setYear(item.year || guess?.year || "");
    setExtra(item.extra || guess?.extra || "");
  }, [item?.id]);

  const makerLabel =
    item?.kind === "game" ? "Which machine is it for?" : item?.kind === "music-film" ? "Who is it by?" : "Who made it?";

  return (
    <StaffShell
      step="Step 4 of 5"
      title="Is this right?"
      intro="We had a look at the barcode and your photos and filled this in. Fix anything that looks wrong."
      back={{ to: "/staff/add/photos", label: "Back" }}
      footer={
        <BigButton
          disabled={title.trim().length < 2}
          onClick={() => {
            if (item) saveItem(item.id, { title: title.trim(), maker: maker.trim(), year, extra });
            navigate({ to: "/staff/add/confirm" });
          }}
        >
          Yes, that&rsquo;s right
        </BigButton>
      }
    >
      <p className="rounded-sm bg-timber-deep/45 px-4 py-4 text-[0.88rem] leading-[1.6] text-foreground/60"
        style={{ boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--brass) 14%, transparent)" }}
      >
        Suggested from the barcode {item?.barcode ? `(${item.barcode})` : "and your photographs"}. Nothing
        goes on the website until you say so.
      </p>

      <div className="mt-6 space-y-6">
        <Field label="What is it called?">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} style={inputShadow} />
        </Field>
        <Field label={makerLabel}>
          <input value={maker} onChange={(e) => setMaker(e.target.value)} className={inputClass} style={inputShadow} />
        </Field>
        <Field label="What year?" hint="Leave it blank if you are not sure.">
          <input
            value={year}
            onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            className={inputClass}
            style={inputShadow}
          />
        </Field>
        <Field label="Anything else worth saying?" hint="Publisher, label, what is in the box.">
          <input value={extra} onChange={(e) => setExtra(e.target.value)} className={inputClass} style={inputShadow} />
        </Field>
      </div>
    </StaffShell>
  );
}