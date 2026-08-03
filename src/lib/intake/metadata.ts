import type { ProductCategory } from "@prisma/client";
import { parseBarcode, type ParsedBarcode } from "./barcode";

export type MetadataCandidate = {
  id: string;
  provider: string;
  confidence: number;
  category: ProductCategory;
  title: string;
  subtitle: string | null;
  creator: string | null;
  publisher: string | null;
  platform: string | null;
  region: string | null;
  format: string | null;
  isbn10: string | null;
  isbn13: string | null;
  ean: string | null;
  upc: string | null;
  language: string | null;
  publicationDate: string | null;
  releaseDate: string | null;
  edition: string | null;
  pageCount: number | null;
  subjects: string[];
  description: string | null;
  coverImageUrl: string | null;
  sourcePayload: unknown;
};

export type MetadataLookupResult = {
  parsed: ParsedBarcode;
  candidates: MetadataCandidate[];
  ambiguous: boolean;
  errors: string[];
};

export interface MetadataProvider {
  name: string;
  lookup(parsed: ParsedBarcode, signal?: AbortSignal): Promise<MetadataCandidate[]>;
}

const demoCandidates: Record<string, MetadataCandidate[]> = {
  "9780141187761": [
    {
      id: "demo-book-9780141187761-paperback",
      provider: "Demo Metadata Provider",
      confidence: 0.98,
      category: "BOOKS" as const,
      title: "Dubliners",
      subtitle: null,
      creator: "James Joyce",
      publisher: "Penguin Classics",
      platform: null,
      region: null,
      format: "Paperback",
      isbn10: "0141187766",
      isbn13: "9780141187761",
      ean: "9780141187761",
      upc: null,
      language: "English",
      publicationDate: "2000",
      releaseDate: null,
      edition: "Penguin Classics edition",
      pageCount: 368,
      subjects: ["Fiction", "Irish literature"],
      description: "Standard catalogue metadata for a fictional rapid-listing demo. Condition must be entered by staff.",
      coverImageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=80",
      sourcePayload: { demo: true }
    },
    {
      id: "demo-book-9780141187761-alt",
      provider: "Demo Metadata Provider",
      confidence: 0.78,
      category: "BOOKS",
      title: "Dubliners",
      subtitle: "Alternate regional printing",
      creator: "James Joyce",
      publisher: "Penguin",
      platform: null,
      region: "UK",
      format: "Paperback",
      isbn10: null,
      isbn13: "9780141187761",
      ean: "9780141187761",
      upc: null,
      language: "English",
      publicationDate: null,
      releaseDate: null,
      edition: null,
      pageCount: null,
      subjects: [],
      description: null,
      coverImageUrl: null,
      sourcePayload: { demo: true, ambiguity: true }
    }
  ],
  "071171200131": [
    {
      id: "demo-game-071171200131",
      provider: "Demo Metadata Provider",
      confidence: 0.94,
      category: "GAMES",
      title: "Gran Turismo 4",
      subtitle: null,
      creator: "Polyphony Digital",
      publisher: "Sony Computer Entertainment",
      platform: "PlayStation 2",
      region: "PAL",
      format: "DVD case",
      isbn10: null,
      isbn13: null,
      ean: null,
      upc: "071171200131",
      language: "English",
      publicationDate: null,
      releaseDate: "2005",
      edition: null,
      pageCount: null,
      subjects: ["Racing", "Video games"],
      description: "Standard catalogue metadata only. Disc, manual and case condition must be entered by staff.",
      coverImageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=900&q=80",
      sourcePayload: { demo: true }
    }
  ],
  "5099746259120": [
    {
      id: "demo-vinyl-5099746259120",
      provider: "Demo Metadata Provider",
      confidence: 0.92,
      category: "VINYL",
      title: "Kind of Blue",
      subtitle: null,
      creator: "Miles Davis",
      publisher: "Columbia",
      platform: null,
      region: "Europe",
      format: "Vinyl LP",
      isbn10: null,
      isbn13: null,
      ean: "5099746259120",
      upc: null,
      language: null,
      publicationDate: null,
      releaseDate: "Reissue date supplied by provider",
      edition: null,
      pageCount: null,
      subjects: ["Jazz", "Vinyl"],
      description: "Catalogue-level music metadata. Sleeve and record condition must be entered by staff.",
      coverImageUrl: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?auto=format&fit=crop&w=900&q=80",
      sourcePayload: { demo: true }
    }
  ]
};

export class DemoMetadataProvider implements MetadataProvider {
  name = "Demo Metadata Provider";
  async lookup(parsed: ParsedBarcode) {
    return demoCandidates[parsed.normalized] ?? [];
  }
}

export class OpenLibraryProvider implements MetadataProvider {
  name = "OpenLibrary";
  async lookup(parsed: ParsedBarcode, signal?: AbortSignal): Promise<MetadataCandidate[]> {
    if (parsed.type !== "ISBN_10" && parsed.type !== "ISBN_13") return [];
    const response = await fetch(`https://openlibrary.org/isbn/${parsed.normalized}.json`, { signal });
    if (!response.ok) return [];
    const data = await response.json() as Record<string, unknown>;
    const authors = Array.isArray(data.authors) ? data.authors : [];
    const authorNames = await Promise.all(authors.slice(0, 3).map(async (author) => {
      const key = typeof author === "object" && author && "key" in author ? String(author.key) : "";
      if (!key) return null;
      try {
        const authorResponse = await fetch(`https://openlibrary.org${key}.json`, { signal });
        if (!authorResponse.ok) return null;
        const authorData = await authorResponse.json() as Record<string, unknown>;
        return typeof authorData.name === "string" ? authorData.name : null;
      } catch {
        return null;
      }
    }));
    const languageKeys = Array.isArray(data.languages)
      ? data.languages.map((language) => typeof language === "object" && language && "key" in language ? String(language.key).split("/").pop() : null).filter(Boolean)
      : [];
    return [{
      id: `openlibrary-${parsed.normalized}`,
      provider: this.name,
      confidence: 0.9,
      category: "BOOKS",
      title: typeof data.title === "string" ? data.title : "Unknown title",
      subtitle: typeof data.subtitle === "string" ? data.subtitle : null,
      creator: authorNames.filter(Boolean).join(", ") || null,
      publisher: Array.isArray(data.publishers) ? String(data.publishers[0] ?? "") || null : null,
      platform: null,
      region: null,
      format: Array.isArray(data.physical_format) ? String(data.physical_format[0] ?? "") : typeof data.physical_format === "string" ? data.physical_format : null,
      isbn10: parsed.type === "ISBN_10" ? parsed.normalized : null,
      isbn13: parsed.type === "ISBN_13" ? parsed.normalized : null,
      ean: parsed.type === "ISBN_13" ? parsed.normalized : null,
      upc: null,
      language: languageKeys.join(", ") || null,
      publicationDate: typeof data.publish_date === "string" ? data.publish_date : null,
      releaseDate: null,
      edition: typeof data.edition_name === "string" ? data.edition_name : null,
      pageCount: typeof data.number_of_pages === "number" ? data.number_of_pages : null,
      subjects: [],
      description: typeof data.description === "string" ? data.description : null,
      coverImageUrl: `https://covers.openlibrary.org/b/isbn/${parsed.normalized}-L.jpg`,
      sourcePayload: data
    }];
  }
}

export function metadataProviders() {
  const defaultPriority = process.env.NODE_ENV === "production" ? "openlibrary" : "openlibrary,demo";
  const priority = (process.env.METADATA_PROVIDER_PRIORITY ?? defaultPriority).split(",").map((item) => item.trim());
  const available: MetadataProvider[] = [
    new OpenLibraryProvider(),
    ...(process.env.NODE_ENV === "production" ? [] : [new DemoMetadataProvider()])
  ];
  return priority.flatMap((name) => available.filter((provider) => provider.name.toLowerCase().includes(name.toLowerCase())));
}

export async function lookupMetadata(input: string): Promise<MetadataLookupResult> {
  const parsed = parseBarcode(input);
  if (!parsed.valid) return { parsed, candidates: [], ambiguous: false, errors: [parsed.error ?? "Invalid barcode."] };
  const errors: string[] = [];
  const candidates: MetadataCandidate[] = [];
  for (const provider of metadataProviders()) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    try {
      candidates.push(...await provider.lookup(parsed, controller.signal));
    } catch {
      errors.push(`${provider.name} failed or timed out.`);
    } finally {
      clearTimeout(timeout);
    }
  }
  const unique = Array.from(new Map(candidates.map((candidate) => [candidate.id, candidate])).values());
  return { parsed, candidates: unique, ambiguous: unique.length > 1 || unique.some((candidate) => candidate.confidence < 0.85), errors };
}
