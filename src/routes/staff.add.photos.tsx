import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Camera, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { BigButton } from "@/components/staff/StaffKit";
import { StaffShell } from "@/components/staff/StaffShell";
import { addPhotos, itemPhotos, removePhoto, setPhotoOrder, useCurrentItem } from "@/lib/staff";

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
const CLEAN_BACKGROUND_COLOR = "#f6f1e7";

function PhotoStep() {
  const item = useCurrentItem();
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const [shots, setShots] = useState<string[]>(item ? itemPhotos(item.id) : []);
  const [problem, setProblem] = useState("");
  const [cleanBackground, setCleanBackground] = useState(true);
  const [processing, setProcessing] = useState(false);

  const move = (index: number, direction: -1 | 1) => {
    if (!item) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= shots.length) return;
    const next = [...shots];
    [next[index], next[nextIndex]] = [next[nextIndex]!, next[index]!];
    setPhotoOrder(item.id, next);
    setShots(next);
  };

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
          setProblem("");
          setProcessing(true);
          void Promise.all(files.slice(0, 6).map((file) => processPhoto(file, cleanBackground)))
            .then((urls) => {
              addPhotos(item.id, urls);
              setShots(itemPhotos(item.id));
            })
            .catch(() =>
              setProblem(
                "One of those photos could not be read. Use a JPG, PNG or WebP under 15 MB.",
              ),
            )
            .finally(() => setProcessing(false));
          event.target.value = "";
        }}
      />

      <BigButton onClick={() => input.current?.click()} disabled={processing}>
        <Camera aria-hidden="true" className="mr-3 h-5 w-5" />
        {processing
          ? "Cleaning photos…"
          : shots.length > 0
            ? "Take another photo"
            : "Open the camera"}
      </BigButton>

      <label className="mt-3 flex items-center gap-2 text-sm text-foreground/70">
        <input
          type="checkbox"
          checked={cleanBackground}
          onChange={(event) => setCleanBackground(event.target.checked)}
        />
        Remove the background for a cleaner listing
      </label>

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
          {shots.map((url, index) => (
            <div key={url} className="relative overflow-hidden rounded-sm bg-timber-deep/60">
              <img src={url} alt="" className="aspect-square w-full object-cover" />
              {index === 0 ? (
                <span className="shop-meta absolute top-1 left-1 bg-ink/80 px-2 py-1 text-lamplight">
                  Primary
                </span>
              ) : null}
              <div className="absolute bottom-1 left-1 flex gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  aria-label="Move photo earlier"
                  onClick={() => move(index, -1)}
                  className="grid h-10 w-10 place-items-center rounded-sm bg-ink/75 text-brass/80 disabled:opacity-30"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={index === shots.length - 1}
                  aria-label="Move photo later"
                  onClick={() => move(index, 1)}
                  className="grid h-10 w-10 place-items-center rounded-sm bg-ink/75 text-brass/80 disabled:opacity-30"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
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
      <p aria-live="polite" className="mt-4 text-sm leading-6 text-lamplight/75">
        {problem}
      </p>
    </StaffShell>
  );
}

async function compressPhoto(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Not an image");
  if (file.size > 15_000_000) throw new Error("Image too large");
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.76);
}

async function processPhoto(file: File, clean: boolean) {
  const compressed = await compressPhoto(file);
  if (!clean) return compressed;
  try {
    return await removeBackgroundAndComposite(compressed);
  } catch {
    return compressed;
  }
}

async function removeBackgroundAndComposite(dataUrl: string): Promise<string> {
  const { removeBackground } = await import("@imgly/background-removal");
  const blob = await removeBackground(dataUrl);
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d")!;
  context.fillStyle = CLEAN_BACKGROUND_COLOR;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}
