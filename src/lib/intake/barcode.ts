export type BarcodeType = "ISBN_10" | "ISBN_13" | "EAN_8" | "EAN_13" | "UPC_A" | "UPC_E" | "INTERNAL_QR" | "UNKNOWN";

export type ParsedBarcode = {
  raw: string;
  normalized: string;
  type: BarcodeType;
  valid: boolean;
  error?: string;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function isbn10Valid(value: string) {
  if (!/^\d{9}[\dX]$/.test(value)) return false;
  const sum = value.split("").reduce((total, char, index) => total + (char === "X" ? 10 : Number(char)) * (10 - index), 0);
  return sum % 11 === 0;
}

function gtinCheck(value: string) {
  if (!/^\d+$/.test(value)) return false;
  const body = value.slice(0, -1).split("").reverse();
  const check = Number(value.at(-1));
  const sum = body.reduce((total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
}

export function parseBarcode(input: string): ParsedBarcode {
  const raw = input.trim();
  if (/^BMGX-[A-Z0-9-]+$/i.test(raw) || /^bookmart:inventory:/i.test(raw)) {
    return { raw, normalized: raw.toUpperCase(), type: "INTERNAL_QR", valid: true };
  }
  const isbn10 = raw.toUpperCase().replace(/[^0-9X]/g, "");
  if (isbn10.length === 10 && /X?$/.test(isbn10)) return { raw, normalized: isbn10, type: "ISBN_10", valid: isbn10Valid(isbn10), error: isbn10Valid(isbn10) ? undefined : "Invalid ISBN-10 check digit." };
  const digits = onlyDigits(raw);
  if (digits.length === 10) return { raw, normalized: digits, type: "ISBN_10", valid: isbn10Valid(digits), error: isbn10Valid(digits) ? undefined : "Invalid ISBN-10 check digit." };
  if (digits.length === 13 && (digits.startsWith("978") || digits.startsWith("979"))) return { raw, normalized: digits, type: "ISBN_13", valid: gtinCheck(digits), error: gtinCheck(digits) ? undefined : "Invalid ISBN-13 check digit." };
  if (digits.length === 8) return { raw, normalized: digits, type: "EAN_8", valid: gtinCheck(digits), error: gtinCheck(digits) ? undefined : "Invalid EAN-8 check digit." };
  if (digits.length === 12) return { raw, normalized: digits, type: "UPC_A", valid: gtinCheck(digits), error: gtinCheck(digits) ? undefined : "Invalid UPC-A check digit." };
  if (digits.length === 6) return { raw, normalized: digits, type: "UPC_E", valid: true };
  if (digits.length === 13) return { raw, normalized: digits, type: "EAN_13", valid: gtinCheck(digits), error: gtinCheck(digits) ? undefined : "Invalid EAN-13 check digit." };
  return { raw, normalized: raw, type: "UNKNOWN", valid: false, error: "Unsupported or malformed barcode." };
}
