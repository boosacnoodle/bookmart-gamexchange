import { z } from "zod";

export const extractedFieldSchema = z.object({
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).nullable(),
  confidence: z.number().min(0).max(1),
  evidence: z.string().min(1),
  requiresReview: z.boolean()
});

export const aiCopySchema = z.object({
  productTitle: z.string().nullable(),
  shortCardDescription: z.string().nullable(),
  fullDescription: z.string().nullable(),
  conditionParagraph: z.string().nullable(),
  seoTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  imageAltText: z.string().nullable()
});

export const aiExtractionSchema = z.object({
  category: extractedFieldSchema,
  title: extractedFieldSchema,
  creator: extractedFieldSchema,
  publisher: extractedFieldSchema,
  isbn: extractedFieldSchema,
  barcode: extractedFieldSchema,
  platform: extractedFieldSchema,
  region: extractedFieldSchema,
  format: extractedFieldSchema,
  edition: extractedFieldSchema,
  visibleDefects: extractedFieldSchema,
  conditionObservations: extractedFieldSchema,
  includedComponents: extractedFieldSchema,
  missingComponents: extractedFieldSchema,
  serialNumber: extractedFieldSchema,
  additionalImageRequests: z.array(z.string()),
  generatedCopy: aiCopySchema
});

export type AiExtractionResult = z.infer<typeof aiExtractionSchema>;

export const forbiddenCopyPhrases = ["must-have", "hidden gem", "ultra rare", "incredible", "investment opportunity"];

export function validateGeneratedCopy(copy: z.infer<typeof aiCopySchema>) {
  const combined = Object.values(copy).filter(Boolean).join(" ").toLowerCase();
  return forbiddenCopyPhrases.filter((phrase) => combined.includes(phrase));
}
