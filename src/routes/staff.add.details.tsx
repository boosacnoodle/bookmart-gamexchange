import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { BigButton, Field, inputClass, inputShadow } from "@/components/staff/StaffKit";
import { StaffShell } from "@/components/staff/StaffShell";
import { identifyPhotos } from "@/lib/intake.server";
import { itemPhotos, saveItem, useCurrentItem } from "@/lib/staff";

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

function DetailsStep() {
  const item = useCurrentItem();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [maker, setMaker] = useState("");
  const [year, setYear] = useState("");
  const [extra, setExtra] = useState("");
  const [identifying, setIdentifying] = useState(false);
  const [identifyNote, setIdentifyNote] = useState("");

  useEffect(() => {
    if (!item) return;
    setTitle(item.title || item.candidate?.title || "");
    setMaker(item.maker || item.candidate?.creator || item.candidate?.platform || "");
    setYear(item.year || item.candidate?.publicationDate?.match(/\d{4}/)?.[0] || "");
    setExtra(item.extra || item.candidate?.publisher || item.candidate?.format || "");
  }, [item]);

  const makerLabel =
    item?.kind === "game"
      ? "Which machine is it for?"
      : item?.kind === "music-film"
        ? "Who is it by?"
        : "Who made it?";

  async function identify() {
    if (!item || identifying) return;
    const photos = itemPhotos(item.id);
    if (photos.length === 0) return;
    setIdentifying(true);
    setIdentifyNote("");
    try {
      const result = await identifyPhotos({ data: { kind: item.kind, photos } });
      if (result.title) setTitle(result.title);
      if (result.creator) setMaker(result.creator);
      if (result.year) setYear(result.year);
      const extraBits = [result.publisher, result.format].filter(Boolean).join(" · ");
      if (extraBits) setExtra(extraBits);
      setIdentifyNote(
        result.title
          ? "Filled from your photos by Gemini — check it before continuing."
          : "Gemini could not read a title from those photos.",
      );
    } catch (error) {
      setIdentifyNote(
        error instanceof Error ? error.message : "Photo identification failed. Fill in by hand.",
      );
    } finally {
      setIdentifying(false);
    }
  }

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
      <p
        className="rounded-sm bg-timber-deep/45 px-4 py-4 text-[0.88rem] leading-[1.6] text-foreground/60"
        style={{ boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--brass) 14%, transparent)" }}
      >
        {item?.candidate
          ? `Suggested by ${item.candidate.provider} from barcode ${item.barcode}.`
          : "No reliable catalogue match was found, so fill in what you can."}{" "}
        Nothing goes on the website until you say so.
      </p>

      {(item?.photos ?? 0) > 0 ? (
        <div className="mt-6">
          <BigButton tone="quiet" disabled={identifying} onClick={() => void identify()}>
            {identifying ? "Identifying from photos…" : "Identify from photos"}
          </BigButton>
          {identifyNote ? (
            <p className="mt-3 text-[0.86rem] leading-6 text-lamplight/75">{identifyNote}</p>
          ) : (
            <p className="mt-3 text-[0.86rem] leading-6 text-foreground/45">
              Uses Gemini (free). It can read books, games, CDs and vinyl from a photo — always
              check the result.
            </p>
          )}
        </div>
      ) : null}

      <div className="mt-6 space-y-6">
        <Field label="What is it called?">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            style={inputShadow}
          />
        </Field>
        <Field label={makerLabel}>
          <input
            value={maker}
            onChange={(e) => setMaker(e.target.value)}
            className={inputClass}
            style={inputShadow}
          />
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
          <input
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            className={inputClass}
            style={inputShadow}
          />
        </Field>
      </div>
    </StaffShell>
  );
}
