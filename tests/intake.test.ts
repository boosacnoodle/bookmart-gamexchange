import { describe, expect, it } from "vitest";
import { parseBarcode } from "../src/lib/intake/barcode";
import { classifyCandidate, publicDepartmentFor } from "../src/lib/intake/classification";
import { DemoMetadataProvider, lookupMetadata } from "../src/lib/intake/metadata";
import { aiExtractionSchema, validateGeneratedCopy } from "../src/lib/intake/schemas";
import { aiPhotoConfigured, DisabledPhotoIdentificationProvider } from "../src/lib/intake/ai-service";

describe("barcode parsing", () => {
  it("supports ISBN-10, ISBN-13, EAN, UPC and internal QR values", () => {
    expect(parseBarcode("014118776X")).toMatchObject({ type: "ISBN_10", valid: true });
    expect(parseBarcode("9780141187761")).toMatchObject({ type: "ISBN_13", valid: true });
    expect(parseBarcode("4006381333931")).toMatchObject({ type: "EAN_13", valid: true });
    expect(parseBarcode("071171200131")).toMatchObject({ type: "UPC_A", valid: true });
    expect(parseBarcode("BMGX-DEMO-0001")).toMatchObject({ type: "INTERNAL_QR", valid: true });
  });

  it("rejects malformed OCR identifiers and unknown barcodes", () => {
    expect(parseBarcode("not a barcode").valid).toBe(false);
    expect(parseBarcode("9780141187762")).toMatchObject({ type: "ISBN_13", valid: false });
  });
});

describe("metadata providers", () => {
  it("returns valid barcode matches and ambiguous edition candidates", async () => {
    const provider = new DemoMetadataProvider();
    const candidates = await provider.lookup(parseBarcode("9780141187761"));
    expect(candidates).toHaveLength(2);
    expect(candidates[0]?.title).toBe("Dubliners");
  });

  it("handles unknown barcode results without inventing metadata", async () => {
    const result = await lookupMetadata("4006381333931");
    expect(result.parsed.type).toBe("EAN_13");
    expect(result.candidates.every((candidate) => candidate.title)).toBe(true);
  });

  it("represents disc-only game metadata separately from physical condition", async () => {
    const candidates = await new DemoMetadataProvider().lookup(parseBarcode("071171200131"));
    expect(candidates[0]?.platform).toBe("PlayStation 2");
    expect(candidates[0]?.description).toContain("condition must be entered by staff");
  });
});

describe("deterministic intake classification", () => {
  it("routes ordinary books to Books unless staff marks them rare", () => {
    const ordinary = classifyCandidate({ category: "BOOKS", platform: null, subjects: ["Fiction"], title: "Dubliners", edition: null });
    expect(ordinary.productCategory).toBe("BOOKS");
    expect(ordinary.publicDepartment).toBe("Books");

    const rare = classifyCandidate({ category: "BOOKS", platform: null, subjects: ["Signed"], title: "Dubliners", edition: "First edition" }, { rare: true });
    expect(rare.productCategory).toBe("RARE_COLLECTIBLE");
    expect(rare.publicDepartment).toBe("Rare Books");
  });

  it("routes game platforms using structured platform metadata", () => {
    expect(publicDepartmentFor("GAMES", "Nintendo Switch")).toBe("Nintendo");
    expect(publicDepartmentFor("GAMES", "PlayStation 2")).toBe("PlayStation");
    expect(publicDepartmentFor("GAMES", "Xbox 360")).toBe("Xbox");
    expect(publicDepartmentFor("GAMES", "Sega Mega Drive")).toBe("Retro Games");
  });

  it("honours staff category and platform overrides", () => {
    const classified = classifyCandidate(
      { category: "GAMES", platform: "PlayStation 2", subjects: [], title: "Loose cartridge", edition: null },
      { category: "GAMES", platform: "Sega Mega Drive" }
    );
    expect(classified.publicDepartment).toBe("Retro Games");
    expect(classified.categoryRoute).toContain("Sega%20Mega%20Drive");
  });
});

describe("AI photo identification boundary", () => {
  it("is disabled without OpenAI configuration and makes no live request", async () => {
    expect(aiPhotoConfigured()).toBe(false);
    await expect(new DisabledPhotoIdentificationProvider().identify({ category: "books", imageUrls: [] })).rejects.toThrow(/not currently configured/);
  });

  it("rejects malformed AI output and flags forbidden generic copy", () => {
    expect(() => aiExtractionSchema.parse({ title: { value: "Book" } })).toThrow();
    expect(validateGeneratedCopy({
      productTitle: "Ordinary book",
      shortCardDescription: "A must-have hidden gem.",
      fullDescription: null,
      conditionParagraph: null,
      seoTitle: null,
      metaDescription: null,
      imageAltText: null
    })).toEqual(["must-have", "hidden gem"]);
  });

  it("accepts low-confidence output only when review flags are present", () => {
    const field = { value: null, confidence: 0.2, evidence: "unknown", requiresReview: true };
    const parsed = aiExtractionSchema.parse({
      category: field,
      title: field,
      creator: field,
      publisher: field,
      isbn: field,
      barcode: field,
      platform: field,
      region: field,
      format: field,
      edition: field,
      visibleDefects: field,
      conditionObservations: field,
      includedComponents: field,
      missingComponents: field,
      serialNumber: field,
      additionalImageRequests: ["front cover"],
      generatedCopy: {
        productTitle: null,
        shortCardDescription: null,
        fullDescription: null,
        conditionParagraph: null,
        seoTitle: null,
        metaDescription: null,
        imageAltText: null
      }
    });
    expect(parsed.title.requiresReview).toBe(true);
  });
});
