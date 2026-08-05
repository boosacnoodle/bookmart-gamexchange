import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  BigButton,
  ChoiceRow,
  Field,
  inputClass,
  inputShadow,
} from "@/components/staff/StaffKit";
import { StaffShell } from "@/components/staff/StaffShell";
import { CONDITIONS, SHELVES, itemName, publishItem, saveItem, useCurrentItem } from "@/lib/staff";

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
  const [price, setPrice] = useState("");
  const [shelf, setShelf] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!item) return;
    setCondition(item.condition);
    setPrice(item.price);
    setShelf(item.shelf);
    setNote(item.note ?? "");
  }, [item?.id]);

  const shelves = item ? SHELVES[item.room] : [];
  const ready = price.trim().length > 0 && shelf.length > 0;

  return (
    <StaffShell
      step="Step 5 of 5"
      title="Last three questions"
      intro={item ? itemName(item) : undefined}
      back={{ to: "/staff/add/details", label: "Back" }}
      footer={
        <BigButton
          disabled={!ready}
          onClick={() => {
            if (!item) return;
            saveItem(item.id, { condition, price: price.trim(), shelf, note: note.trim() });
            publishItem(item.id);
            navigate({ to: "/staff/add/done" });
          }}
        >
          Publish item
        </BigButton>
      }
    >
      <div className="space-y-8">
        <Field label="What condition is it in?">
          <ChoiceRow options={CONDITIONS} value={condition} onChange={setCondition} />
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
      </div>
    </StaffShell>
  );
}