import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { BigButton } from "@/components/staff/StaffKit";
import { StaffShell } from "@/components/staff/StaffShell";
import { addPhotos, itemPhotos, removePhoto, useCurrentItem } from "@/lib/staff";

export const Route = createFileRoute("/staff/add/photos")({
  head: () => ({
    meta: [
      { title: "Take photos — Bookmart back office" },
      { name: "description", content: "Photograph the item for the shop." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Take photos" },
      { property: "og:description", content: "Photograph the item for the shop." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PhotoStep,
});

const SHOTS = ["The front", "The back", "Any marks or damage"];

function PhotoStep() {
  const item = useCurrentItem();
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const [shots, setShots] = useState<string[]>(item ? itemPhotos(item.id) : []);

  return (
    <StaffShell
      step="Step 3 of 5"
      title="Take photos"
      intro="Three is plenty. Shoot it on the counter, under the lamp — that is what makes our listings look like ours."
      back={{ to: "/staff/add/scan", label: "Back" }}
      footer={
        <>
          <BigButton onClick={() => navigate({ to: "/staff/add/details" })}>
            {shots.length > 0 ? "Next — check the details" : "Skip photos for now"}
          </BigButton>
        </>
      }
    >
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="sr-only"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (!item || files.length === 0) return;
          const urls = files.map((file) => URL.createObjectURL(file));
          addPhotos(item.id, urls);
          setShots(itemPhotos(item.id));
          event.target.value = "";
        }}
      />

      <BigButton onClick={() => input.current?.click()}>
        <Camera aria-hidden="true" className="mr-3 h-5 w-5" />
        {shots.length > 0 ? "Take another photo" : "Open the camera"}
      </BigButton>

      <ul className="mt-6 space-y-2">
        {SHOTS.map((shot, i) => (
          <li key={shot} className="flex items-center gap-3 text-[0.92rem] text-foreground/60">
            <span
              aria-hidden="true"
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.7rem] ${
                shots.length > i ? "bg-timber text-lamplight" : "text-brass/50"
              }`}
              style={{
                boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--brass) 30%, transparent)",
              }}
            >
              {shots.length > i ? "✓" : i + 1}
            </span>
            {shot}
          </li>
        ))}
      </ul>

      {shots.length > 0 ? (
        <div className="mt-7 grid grid-cols-3 gap-2">
          {shots.map((url) => (
            <div key={url} className="relative overflow-hidden rounded-sm bg-timber-deep/60">
              <img src={url} alt="" className="aspect-square w-full object-cover" />
              <button
                type="button"
                aria-label="Remove this photo"
                onClick={() => {
                  if (!item) return;
                  removePhoto(item.id, url);
                  setShots(itemPhotos(item.id));
                }}
                className="absolute right-1 bottom-1 grid h-10 w-10 place-items-center rounded-sm bg-ink/75 text-brass/80"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </StaffShell>
  );
}