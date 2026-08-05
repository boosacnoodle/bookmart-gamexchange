import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { BigButton, ChoiceRow, Field, inputClass, inputShadow } from "@/components/staff/StaffKit";
import { StaffShell } from "@/components/staff/StaffShell";
import type { RoomId } from "@/data/rooms";
import { publishListing } from "@/lib/intake.server";
import {
  BOOK_CONDITIONS,
  GENERAL_CONDITIONS,
  SHELVES,
  completeItem,
  itemName,
  saveItem,
  useCurrentItem,
} from "@/lib/staff";

const DEPARTMENTS: { label: string; value: RoomId }[] = [
  { label: "Books", value: "library" },
  { label: "Games", value: "arcade" },
  { label: "Music & Film", value: "sound-vision" },
  { label: "Rare & Collectible", value: "curiosity" },
];

export const Route = createFileRoute("/staff/add/confirm")({
  head: () => ({
    meta: [
      { title: "Condition, price and shelf — Bookmart back office" },
      { name: "description", content: "Set the condition, price and shelf before publishing." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Condition, price and shelf" },
      { property: "og:description", content: "Set the condition, price and shelf." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConfirmStep,
});

function ConfirmStep() {
  const item = useCurrentItem();
  const navigate = useNavigate();

  const [condition, setCondition] = useState("Very good");
  const [room, setRoom] = useState<RoomId>("library");
  const [price, setPrice] = useState("");
  const [shelf, setShelf] = useState("");
  const [note, setNote] = useState("");
  const [included, setIncluded] = useState("");
  const [missing, setMissing] = useState("");
  const [deliveryEligible, setDeliveryEligible] = useState(true);
  const [clickCollectEligible, setClickCollectEligible] = useState(true);
  const [problem, setProblem] = useState("");
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!item) return;
    setCondition(item.condition);
    setRoom(item.room);
    setPrice(item.price);
    setShelf(item.shelf);
    setNote(item.note ?? "");
    setIncluded(item.included ?? "");
    setMissing(item.missing ?? "");
    setDeliveryEligible(item.deliveryEligible ?? true);
    setClickCollectEligible(item.clickCollectEligible ?? true);
  }, [item]);

  const shelves = SHELVES[room];
  const conditions = item?.kind === "book" ? BOOK_CONDITIONS : GENERAL_CONDITIONS;
  const ready =
    price.trim().length > 0 && shelf.length > 0 && (deliveryEligible || clickCollectEligible);

  return (
    <StaffShell
      step="Step 5 of 5"
      title="Last three questions"
      intro={item ? itemName(item) : undefined}
      back={{ to: "/staff/add/details", label: "Back" }}
      footer={
        <BigButton
          disabled={!ready}
          onClick={async () => {
            if (!item) return;
            saveItem(item.id, {
              room,
              condition,
              price: price.trim(),
              shelf,
              note: note.trim(),
              included: included.trim(),
              missing: missing.trim(),
              deliveryEligible,
              clickCollectEligible,
            });
            setProblem("");
            setPublishing(true);
            try {
              const result = await publishListing({
                data: {
                  intakeId: item.intakeId,
                  kind: item.kind,
                  barcode: item.barcode,
                  candidate: item.candidate,
                  title: item.title,
                  maker: item.maker,
                  year: item.year || "",
                  extra: item.extra || "",
                  room,
                  shelf,
                  condition,
                  price: price.trim(),
                  note: note.trim(),
                  included: included.trim(),
                  missing: missing.trim(),
                  deliveryEligible,
                  clickCollectEligible,
                  photos: item.photoData || [],
                },
              });
              completeItem(item.id, result);
              navigate({ to: "/staff/add/done" });
            } catch (error) {
              setProblem(
                error instanceof Error
                  ? error.message
                  : "The item was not published. Check the details and try again.",
              );
            } finally {
              setPublishing(false);
            }
          }}
        >
          {publishing ? "Publishing…" : "Publish item"}
        </BigButton>
      }
    >
      <div className="space-y-8">
        <Field label="What condition is it in?">
          <ChoiceRow options={conditions} value={condition} onChange={setCondition} />
        </Field>

        <Field
          label="Which section should it appear in?"
          hint="This is the public website section. Change it if our suggestion is wrong."
        >
          <ChoiceRow
            options={DEPARTMENTS.map((department) => department.label)}
            value={DEPARTMENTS.find((department) => department.value === room)?.label ?? "Books"}
            onChange={(label) => {
              const next =
                DEPARTMENTS.find((department) => department.label === label)?.value ?? "library";
              setRoom(next);
              setShelf("");
            }}
          />
        </Field>

        <Field label="How much?" hint="Euro. Round numbers are fine.">
          <div className="flex items-center gap-3">
            <span className="sign-plate text-[1.4rem] text-lamplight/70">€</span>
            <input
              value={price}
              onChange={(event) => setPrice(event.target.value.replace(/[^0-9.]/g, "").slice(0, 7))}
              inputMode="decimal"
              placeholder="8.50"
              className={inputClass}
              style={inputShadow}
            />
          </div>
        </Field>

        <Field label="Where is it in the shop?">
          <ChoiceRow options={shelves} value={shelf} onChange={setShelf} />
        </Field>

        <div className="rounded-sm border border-brass/15 bg-timber-deep/35 p-4">
          <p className="shop-meta text-brass/60">One copy</p>
          <p className="mt-2 text-sm leading-6 text-foreground/55">
            Second-hand items start at quantity one. Scan another copy separately so its condition
            stays accurate.
          </p>
        </div>

        <Field
          label="What comes with it?"
          hint="Optional. For example: manual, dust jacket, cables or original box."
        >
          <input
            value={included}
            onChange={(event) => setIncluded(event.target.value)}
            className={inputClass}
            style={inputShadow}
          />
        </Field>

        <Field label="Anything missing or faulty?" hint="Optional. Keep this factual and specific.">
          <input
            value={missing}
            onChange={(event) => setMissing(event.target.value)}
            className={inputClass}
            style={inputShadow}
          />
        </Field>

        <Field label="How can the customer get it?">
          <div className="grid gap-2">
            <label className="flex min-h-12 items-center gap-3 rounded-sm border border-brass/15 px-4 text-sm text-foreground/75">
              <input
                type="checkbox"
                checked={clickCollectEligible}
                onChange={(event) => setClickCollectEligible(event.target.checked)}
              />
              Click &amp; collect
            </label>
            <label className="flex min-h-12 items-center gap-3 rounded-sm border border-brass/15 px-4 text-sm text-foreground/75">
              <input
                type="checkbox"
                checked={deliveryEligible}
                onChange={(event) => setDeliveryEligible(event.target.checked)}
              />
              Delivery in Ireland
            </label>
          </div>
        </Field>

        <Field
          label="Want to say something about it?"
          hint="Optional. A line in your own words, printed on the item's page."
        >
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Read to bits by somebody who clearly loved it."
            className="block w-full rounded-sm bg-timber-deep/55 px-4 py-3 text-[1rem] leading-[1.6] text-lamplight placeholder:text-foreground/35 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-brass/70"
            style={inputShadow}
          />
        </Field>

        {!ready ? (
          <p className="text-[0.86rem] text-foreground/45">
            Put a price on it and pick a shelf, then you can publish.
          </p>
        ) : null}
        <p aria-live="polite" className="text-[0.86rem] leading-6 text-lamplight/75">
          {problem}
        </p>
      </div>
    </StaffShell>
  );
}
