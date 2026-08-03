"use client";

import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Camera, CheckCircle, Flashlight, RotateCcw, ScanLine, Search, X } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { lookupBarcodeAction, publishRapidListing, type LookupState, type PublishState } from "@/app/intake-actions";
import { classifyCandidate } from "@/lib/intake/classification";
import type { MetadataCandidate } from "@/lib/intake/metadata";
import { StatusMessage } from "./status-message";

const lookupInitial: LookupState = { ok: false, message: "" };
const publishInitial: PublishState = { ok: false, message: "" };
const productCategories = [
  ["BOOKS", "Books"],
  ["RARE_COLLECTIBLE", "Rare Books"],
  ["GAMES", "Games"],
  ["CONSOLES", "Consoles"],
  ["MUSIC_FILM", "Films & Music"],
  ["VINYL", "Vinyl"],
  ["COLLECTIBLES", "Collectibles"],
  ["ACCESSORIES", "Accessories"],
  ["MISCELLANEOUS", "Other"]
] as const;

export function IntakeWorkflow({ locations, aiMessage }: { locations: Array<{ id: string; publicLabel: string }>; aiMessage: string }) {
  const [lookupState, lookupAction] = useActionState(lookupBarcodeAction, lookupInitial);
  const [publishState, publishAction] = useActionState(publishRapidListing, publishInitial);
  const [selected, setSelected] = useState<MetadataCandidate | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualCreator, setManualCreator] = useState("");
  const [manualPlatform, setManualPlatform] = useState("");
  const [categoryOverride, setCategoryOverride] = useState("BOOKS");
  const [platformOverride, setPlatformOverride] = useState("");
  const [markRare, setMarkRare] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState<Array<{ name: string; url: string }>>([]);
  const [cameraMessage, setCameraMessage] = useState("");
  const [scanLocked, setScanLocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (lookupState.candidates?.length === 1 && !lookupState.ambiguous) setSelected(lookupState.candidates[0] ?? null);
  }, [lookupState]);

  useEffect(() => {
    if (!selected) return;
    setCategoryOverride(selected.category);
    setPlatformOverride(selected.platform ?? "");
    setMarkRare(false);
  }, [selected]);

  async function startCamera() {
    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      setCameraMessage("Camera scanning needs HTTPS. Use the live secure site, or enter the barcode manually.");
      return;
    }
    setCameraMessage("Starting rear camera...");
    setScanLocked(false);
    try {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E, BarcodeFormat.QR_CODE]);
      const reader = new BrowserMultiFormatReader(hints);
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const rear = devices.find((device) => /back|rear|environment/i.test(device.label)) ?? devices[0];
      if (!rear || !videoRef.current) throw new Error("No camera found.");
      controlsRef.current = await reader.decodeFromVideoDevice(rear.deviceId, videoRef.current, (result) => {
        if (!result || scanLocked) return;
        setScanLocked(true);
        setManualCode(result.getText());
        setCameraMessage("Barcode captured. Review or submit lookup.");
        if ("vibrate" in navigator) navigator.vibrate(80);
        controlsRef.current?.stop();
      });
    } catch (error) {
      setCameraMessage(error instanceof Error ? error.message : "Camera permission denied or unavailable.");
    }
  }

  function stopCamera() {
    controlsRef.current?.stop();
    setCameraMessage("Camera stopped. You can retry or enter the barcode manually.");
  }

  function makeManualCandidate(): MetadataCandidate | null {
    if (!lookupState.intakeId || manualTitle.trim().length < 2) return null;
    const category = categoryOverride as MetadataCandidate["category"];
    return {
      id: `manual-${lookupState.intakeId}`,
      provider: "Manual staff entry",
      confidence: 0.5,
      category,
      title: manualTitle.trim(),
      subtitle: null,
      creator: manualCreator.trim() || null,
      publisher: null,
      platform: manualPlatform.trim() || null,
      region: null,
      format: null,
      isbn10: lookupState.barcodeType === "ISBN_10" ? lookupState.barcode ?? null : null,
      isbn13: lookupState.barcodeType === "ISBN_13" ? lookupState.barcode ?? null : null,
      ean: lookupState.barcodeType?.startsWith("EAN") ? lookupState.barcode ?? null : null,
      upc: lookupState.barcodeType?.startsWith("UPC") ? lookupState.barcode ?? null : null,
      language: null,
      publicationDate: null,
      releaseDate: null,
      edition: null,
      pageCount: null,
      subjects: [],
      description: null,
      coverImageUrl: null,
      sourcePayload: { manual: true, barcode: lookupState.barcode ?? null }
    };
  }

  function syncPhotoPreviews(input: HTMLInputElement) {
    const files = Array.from(input.files ?? []);
    photoPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    setPhotoPreviews(files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })));
  }

  function updateFiles(files: File[]) {
    const input = fileInputRef.current;
    if (!input) return;
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;
    syncPhotoPreviews(input);
  }

  function removePhoto(index: number) {
    const files = Array.from(fileInputRef.current?.files ?? []);
    updateFiles(files.filter((_, itemIndex) => itemIndex !== index));
  }

  function movePhoto(index: number, direction: -1 | 1) {
    const files = Array.from(fileInputRef.current?.files ?? []);
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= files.length) return;
    [files[index], files[nextIndex]] = [files[nextIndex], files[index]];
    updateFiles(files);
  }

  const candidateForPublish = selected ?? makeManualCandidate();
  const classification = candidateForPublish
    ? classifyCandidate(candidateForPublish, {
        category: categoryOverride as MetadataCandidate["category"],
        platform: platformOverride || null,
        rare: markRare
      })
    : null;

  return (
    <div className="intake-grid">
      <section className="intake-panel primary">
        <div className="section-head"><h1>Rapid barcode intake</h1><p>Scan ISBN, EAN, UPC or an internal Bookmart QR code. Barcode metadata identifies the product only; condition still belongs to this physical copy.</p></div>
        <div className="scanner-frame">
          <video ref={videoRef} muted playsInline aria-label="Barcode scanner camera preview" />
          <div className="scan-target"><ScanLine size={34} /></div>
        </div>
        <div className="button-row">
          <button className="button button-primary" type="button" onClick={startCamera}><Camera size={18} /> Start rear camera</button>
          <button className="button button-secondary" type="button" onClick={stopCamera}><RotateCcw size={18} /> Retry / stop</button>
          <button className="button button-secondary" type="button" onClick={() => setCameraMessage("Torch support depends on the device browser. If unavailable, use better lighting or manual entry.")}><Flashlight size={18} /> Torch</button>
        </div>
        {cameraMessage ? <p className="form-status success" role="status">{cameraMessage}</p> : null}
        <form action={lookupAction} className="intake-manual-form">
          <label>Manual barcode entry<input name="barcode" value={manualCode} onChange={(event) => setManualCode(event.target.value)} placeholder="9780141187761" required /></label>
          <button className="button button-primary" type="submit"><Search size={18} /> Look up metadata</button>
        </form>
        <StatusMessage state={lookupState} />
      </section>

      <section className="intake-panel">
        <h2>Photo identification</h2>
        <p>{aiMessage}</p>
        <p>Use barcode lookup or manual entry in this milestone. Product photos can still be uploaded before publishing.</p>
      </section>

      {lookupState.duplicates?.length ? (
        <section className="intake-panel warning">
          <h2>Existing copies found</h2>
          <p>Multiple physical copies are allowed, but each must have its own SKU, condition and price.</p>
          {lookupState.duplicates.map((item) => <p key={item.id}><strong>{item.sku}</strong> / {item.state} / {item.title}</p>)}
        </section>
      ) : null}

      {lookupState.candidates?.length ? (
        <section className="intake-panel candidates">
          <h2>Candidate identity</h2>
          <div className="candidate-list">
            {lookupState.candidates.map((candidate) => (
              <button className={selected?.id === candidate.id ? "candidate selected" : "candidate"} type="button" key={candidate.id} onClick={() => setSelected(candidate)}>
                {candidate.coverImageUrl ? <img src={candidate.coverImageUrl} alt="" /> : <span className="cover-placeholder">No cover</span>}
                <strong>{candidate.title}</strong>
                <span>{candidate.creator ?? candidate.platform ?? "Creator unknown"}</span>
                <span>{candidate.publisher ?? candidate.region ?? "Publisher unknown"}</span>
                <span>{candidate.publicationDate ?? candidate.releaseDate ?? "Date unknown"} / {candidate.provider}</span>
                <span>Confidence {Math.round(candidate.confidence * 100)}%</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {lookupState.intakeId && !lookupState.candidates?.length ? (
        <section className="intake-panel candidates">
          <h2>Complete manually</h2>
          <p>No reliable metadata was found. Keep the barcode and fill in the plain shop details below.</p>
          <div className="management-form">
            <label>Title<input value={manualTitle} onChange={(event) => setManualTitle(event.target.value)} placeholder="Book, game, console or item title" /></label>
            <label>Author / maker<input value={manualCreator} onChange={(event) => setManualCreator(event.target.value)} placeholder="Optional" /></label>
            <label>Platform<input value={manualPlatform} onChange={(event) => setManualPlatform(event.target.value)} placeholder="Nintendo DS, PS2, Xbox 360..." /></label>
          </div>
        </section>
      ) : null}

      {candidateForPublish && lookupState.intakeId ? (
        <section className="intake-panel rapid-form">
          <h2>Review and publish</h2>
          <form action={publishAction} className="management-form">
            <input type="hidden" name="intakeId" value={lookupState.intakeId} />
            <input type="hidden" name="candidate" value={JSON.stringify(candidateForPublish)} />
            <input type="hidden" name="detectedType" value={classification?.detectedType ?? "Other"} />
            <input type="hidden" name="publicDepartment" value={classification?.publicDepartment ?? "More"} />
            <div className="management-card">
              <h3>Category review</h3>
              <dl className="detail-list">
                <dt>Detected type</dt><dd>{classification?.detectedType}</dd>
                <dt>Suggested shelf</dt><dd>{classification?.publicDepartment}</dd>
                <dt>Detected platform</dt><dd>{classification?.platform ?? "Not applicable"}</dd>
              </dl>
              <label>Category<select name="categoryOverride" value={categoryOverride} onChange={(event) => setCategoryOverride(event.target.value)}>
                {productCategories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select></label>
              <label>Platform<input name="platformOverride" value={platformOverride} onChange={(event) => setPlatformOverride(event.target.value)} placeholder="Nintendo DS, PlayStation 2, Xbox 360..." /></label>
              <label className="check"><input type="checkbox" name="markRare" checked={markRare} onChange={(event) => setMarkRare(event.target.checked)} /> Mark as rare / collectible</label>
            </div>
            <label>Condition<select name="conditionGrade" required><option value="GOOD">Good</option><option value="VERY_GOOD">Very good</option><option value="LIKE_NEW">Like new</option><option value="ACCEPTABLE">Acceptable</option><option value="FOR_PARTS_UNTESTED">For parts / repair</option><option value="STAFF_REVIEWED_COLLECTIBLE">Collectible</option><option value="NEW_SEALED">New / sealed</option></select></label>
            <label>Selling price<input name="priceMajor" type="number" min="0.01" step="0.01" required /></label>
            <label>Quantity<input name="quantity" type="number" min="1" max="1" defaultValue="1" required /></label>
            <p className="product-meta">This creates one copy with one unique SKU. Add another copy by scanning again or choosing an existing duplicate intentionally.</p>
            <label>Shelf location<input name="shelfLocation" placeholder="Games / PS2" required /></label>
            <label>Stock location<select name="stockLocationId"><option value="">Unassigned</option>{locations.map((location) => <option value={location.id} key={location.id}>{location.publicLabel}</option>)}</select></label>
            <label>Shipping profile<select name="shippingProfile"><option value="standard">Standard shipping</option><option value="collection-only">Collection only</option></select></label>
            <label>Condition report<textarea name="conditionReport" rows={4} required placeholder="Describe this physical copy only." /></label>
            <label>Included components<input name="included" placeholder="Book, dust jacket / Disc, case, manual" /></label>
            <label>Missing components<input name="missing" placeholder="Manual, inserts, dust jacket" /></label>
            <label>Tested status<input name="testedStatus" placeholder="Only enter if staff tested it" /></label>
            <label>Actual-item photographs<input ref={fileInputRef} name="images" type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => event.currentTarget && syncPhotoPreviews(event.currentTarget)} /></label>
            {photoPreviews.length ? (
              <div className="photo-preview-list">
                {photoPreviews.map((photo, index) => (
                  <div className="photo-preview" key={photo.url}>
                    <img src={photo.url} alt="" />
                    <span>{photo.name}</span>
                    <div className="button-row">
                      <button type="button" className="button button-secondary" onClick={() => movePhoto(index, -1)}>Up</button>
                      <button type="button" className="button button-secondary" onClick={() => movePhoto(index, 1)}>Down</button>
                      <button type="button" className="button button-secondary" onClick={() => removePhoto(index)}><X size={14} /> Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            {categoryOverride === "BOOKS" || categoryOverride === "RARE_COLLECTIBLE" ? <BookFields /> : null}
            {categoryOverride === "GAMES" ? <GameFields /> : null}
            {categoryOverride === "CONSOLES" || categoryOverride === "ACCESSORIES" ? <ConsoleFields /> : null}
            <label>Staff notes<textarea name="staffNotes" rows={3} /></label>
            <label className="check"><input type="checkbox" name="collectionOnly" value="true" /> Collection only</label>
            <label className="check"><input type="checkbox" name="publishNow" value="true" defaultChecked /> Publish after save</label>
            <button className="button button-primary" type="submit"><CheckCircle size={18} /> Publish listing</button>
            <StatusMessage state={publishState} />
          </form>
        </section>
      ) : null}
    </div>
  );
}

function BookFields() {
  return (
    <>
      <label>Dust jacket present<select name="dustJacketPresent"><option value="">Unknown / not applicable</option><option>Present</option><option>Missing</option><option>Not issued</option></select></label>
      <label>Other book defects<input name="otherDefects" placeholder="Foxing, water damage, ex-library markings, odour" /></label>
    </>
  );
}

function GameFields() {
  return (
    <>
      <label>Manual present<select name="manualPresent"><option value="">Unknown</option><option>Present</option><option>Missing</option><option>Not issued</option></select></label>
      <label>Other game defects<input name="otherDefects" placeholder="Disc marks, label wear, case cracks" /></label>
    </>
  );
}

function ConsoleFields() {
  return (
    <>
      <label>Powers on<select name="powersOn"><option value="">Not tested</option><option>Yes</option><option>No</option></select></label>
      <label>Serial number<input name="serialNumber" placeholder="Only if clearly visible" /></label>
    </>
  );
}
