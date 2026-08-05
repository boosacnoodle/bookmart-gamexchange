import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Flashlight, ScanLine, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";

import { BigButton, Field, inputClass, inputShadow } from "@/components/staff/StaffKit";
import { StaffShell } from "@/components/staff/StaffShell";
import { lookupBarcode } from "@/lib/intake.server";
import { saveItem, useCurrentItem } from "@/lib/staff";

export const Route = createFileRoute("/staff/add/scan")({
  head: () => ({
    meta: [
      { title: "Scan barcode — Bookmart back office" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ScanStep,
});

function ScanStep() {
  const item = useCurrentItem();
  const navigate = useNavigate();
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef<IScannerControls | null>(null);
  const lastCode = useRef("");
  const [typed, setTyped] = useState(item?.barcode ?? "");
  const [status, setStatus] = useState(
    item?.barcode ? `Barcode held: ${item.barcode}` : "Camera is off.",
  );
  const [scanning, setScanning] = useState(false);
  const [working, setWorking] = useState(false);
  const [torch, setTorch] = useState(false);

  const stop = () => {
    controls.current?.stop();
    controls.current = null;
    setScanning(false);
    setTorch(false);
  };

  useEffect(() => stop, []);

  async function accept(code: string) {
    const clean = code.replace(/[^0-9A-Za-z-]/g, "").trim();
    if (!item || clean.length < 4 || working || clean === lastCode.current) return;
    lastCode.current = clean;
    stop();
    setWorking(true);
    setStatus(`Barcode captured: ${clean}. Looking it up…`);
    try {
      const result = await lookupBarcode({ data: { barcode: clean, kind: item.kind } });
      saveItem(item.id, {
        barcode: result.barcode || clean,
        barcodeType: result.barcodeType,
        intakeId: result.intakeId,
        candidate: result.candidate ?? undefined,
        duplicates: result.duplicates,
        title: result.candidate?.title || item.title,
        maker: result.candidate?.creator || result.candidate?.platform || item.maker,
        year: result.candidate?.publicationDate?.match(/\d{4}/)?.[0] || item.year,
        extra: result.candidate?.publisher || result.candidate?.format || item.extra,
      });
      setTyped(result.barcode || clean);
      setStatus(result.message);
    } catch (error) {
      lastCode.current = "";
      setStatus(
        error instanceof Error
          ? error.message
          : "Lookup failed. Type the number or continue manually.",
      );
    } finally {
      setWorking(false);
    }
  }

  async function start() {
    if (!video.current) return;
    if (!window.isSecureContext && location.hostname !== "localhost") {
      setStatus("The camera needs a secure HTTPS address. Type the barcode below for now.");
      return;
    }
    stop();
    lastCode.current = "";
    setStatus("Point the rear camera at the barcode.");
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      controls.current = await reader.decodeFromConstraints(
        { audio: false, video: { facingMode: { ideal: "environment" } } },
        video.current,
        (result) => {
          if (result) void accept(result.getText());
        },
      );
      setScanning(true);
    } catch (error) {
      setStatus(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access in the browser settings, then tap Retry."
          : "The camera is unavailable. Type the barcode below instead.",
      );
    }
  }

  return (
    <StaffShell
      step="Step 2 of 5"
      title="Scan barcode"
      intro="Use the rear camera, or type the number. No barcode is fine — older stock can be added by hand."
      back={{ to: "/staff/add", label: "Back" }}
      footer={
        <BigButton
          onClick={() => {
            stop();
            navigate({ to: "/staff/add/photos" });
          }}
        >
          {item?.barcode ? "Next — take photos" : "No barcode — take photos"}
        </BigButton>
      }
    >
      <div
        className="relative overflow-hidden rounded-sm bg-black"
        style={{ boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--brass) 24%, transparent)" }}
      >
        <video ref={video} muted playsInline className="aspect-[4/3] w-full object-cover" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[25%_12%] rounded-[2px] border-2 border-brass/70"
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <BigButton tone="quiet" onClick={scanning ? stop : start}>
          {scanning ? (
            <>
              <Square className="mr-2 h-4 w-4" />
              Stop
            </>
          ) : (
            <>
              <ScanLine className="mr-2 h-5 w-5" />
              {item?.barcode ? "Retry" : "Start scan"}
            </>
          )}
        </BigButton>
        <BigButton
          tone="quiet"
          disabled={!controls.current?.switchTorch}
          onClick={async () => {
            const next = !torch;
            await controls.current?.switchTorch?.(next);
            setTorch(next);
          }}
        >
          <Flashlight className="mr-2 h-4 w-4" />
          {torch ? "Torch off" : "Torch"}
        </BigButton>
      </div>
      <p
        aria-live="polite"
        className="mt-4 min-h-[2.8em] text-[0.92rem] leading-[1.5] text-lamplight/80"
      >
        {status}
      </p>
      {item?.duplicates?.length ? (
        <div className="mt-4 rounded-sm border border-brass/25 bg-timber-deep/55 p-4">
          <p className="shop-meta text-brass">Possible duplicate</p>
          {item.duplicates.map((duplicate) => (
            <p key={duplicate.id} className="mt-2 text-sm text-foreground/70">
              {duplicate.title} · {duplicate.sku} · {duplicate.state}
            </p>
          ))}
          <p className="mt-2 text-xs leading-5 text-foreground/45">
            You may still make a separate listing for a different used copy.
          </p>
        </div>
      ) : null}
      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void accept(typed);
        }}
      >
        <Field label="Or type the numbers" hint="The number printed under the lines.">
          <input
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            inputMode="numeric"
            enterKeyHint="done"
            placeholder="9780141182682"
            className={inputClass}
            style={inputShadow}
          />
        </Field>
        <BigButton type="submit" tone="quiet" disabled={typed.trim().length < 4 || working}>
          {working ? "Looking it up…" : "Use this number"}
        </BigButton>
      </form>
    </StaffShell>
  );
}
