import { describe, expect, it } from "vitest";

import { parseBarcode } from "./barcode";

describe("parseBarcode", () => {
  it.each([
    ["0306406152", "ISBN_10"],
    ["9780141187761", "ISBN_13"],
    ["96385074", "EAN_8"],
    ["4006381333931", "EAN_13"],
    ["012345678905", "UPC_A"],
    ["123456", "UPC_E"],
    ["BMGX-BOOK-0001", "INTERNAL_QR"],
    ["bookmart:inventory:abc123", "INTERNAL_QR"],
  ])("recognises %s as %s", (value, type) => {
    const parsed = parseBarcode(value);
    expect(parsed.valid).toBe(true);
    expect(parsed.type).toBe(type);
  });

  it("normalises formatted ISBNs", () => {
    expect(parseBarcode("0-306-40615-2")).toMatchObject({
      normalized: "0306406152",
      type: "ISBN_10",
      valid: true,
    });
  });

  it("rejects invalid check digits and unsupported values", () => {
    expect(parseBarcode("9780141187762")).toMatchObject({ valid: false, type: "ISBN_13" });
    expect(parseBarcode("not-a-barcode")).toMatchObject({ valid: false, type: "UNKNOWN" });
  });
});
