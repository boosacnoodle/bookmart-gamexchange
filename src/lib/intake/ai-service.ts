export type AiPhotoRequest = {
  /** A hint for what kind of item is in the photos (book / game / music-film / rare). */
  category: string;
  imageUrls: string[];
};

export type PhotoIdentifyResult = {
  title: string | null;
  creator: string | null;
  publisher: string | null;
  format: string | null;
  year: string | null;
  category: string | null;
  description: string | null;
};

export interface PhotoIdentificationProvider {
  name: string;
  identify(request: AiPhotoRequest): Promise<PhotoIdentifyResult>;
}

export function aiPhotoConfigured() {
  return (
    process.env.AI_PHOTO_IDENTIFICATION_ENABLED === "true" &&
    Boolean(process.env.GEMINI_API_KEY)
  );
}

const SYSTEM_PROMPT = [
  "You are a careful product cataloguer for a second-hand shop.",
  "Given photos of a single item, extract ONLY facts that are clearly visible in the images.",
  "Never invent or guess. Never claim rarity, authenticity, signatures, editions, value, or condition without direct visible evidence.",
  "Return strict JSON only — no markdown, no code fences — with exactly these keys:",
  '{"title": string|null, "creator": string|null, "publisher": string|null, "format": string|null, "year": string|null, "category": string|null, "description": string|null}',
  "- title: the item's name or title.",
  "- creator: author, artist, band, developer, or primary creator.",
  "- publisher: publisher, record label, film studio, or console maker where relevant.",
  '- format: physical format if clear (e.g. "Paperback", "Hardback", "CD", "Vinyl LP", "DVD", "Blu-ray", "Nintendo Switch cartridge", "PlayStation 2 disc").',
  "- year: 4-digit year, only if printed on the item.",
  '- category: exactly one of "BOOKS", "GAMES", "MUSIC_FILM", "RARE_COLLECTIBLE".',
  "- description: one factual sentence (title, creator, format). No rarity or condition claims.",
  "Use null for anything you cannot see.",
].join("\n");

function toInlineData(url: string): { mimeType: string; data: string } {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(url);
  if (!match) throw new Error("A photo is not a base64 image.");
  return { mimeType: match[1]!, data: match[2]! };
}

function clean(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export class DisabledPhotoIdentificationProvider implements PhotoIdentificationProvider {
  name = "Disabled AI Photo Identification";
  async identify(_request: AiPhotoRequest): Promise<PhotoIdentifyResult> {
    void _request;
    throw new Error(
      "AI photo identification is not configured. Add a Google AI Studio (Gemini) key to identify rare and unbarcoded items.",
    );
  }
}

export class GeminiPhotoIdentificationProvider implements PhotoIdentificationProvider {
  name = "Gemini Flash";
  async identify(request: AiPhotoRequest): Promise<PhotoIdentifyResult> {
    if (!aiPhotoConfigured())
      throw new Error("Gemini photo identification is disabled or missing server configuration.");
    const model = process.env.GEMINI_PHOTO_MODEL ?? "gemini-2.5-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: "user",
            parts: [
              { text: `Category hint: ${request.category}. Extract only visible facts.` },
              ...request.imageUrls.map((imageUrl) => ({ inlineData: toInlineData(imageUrl) })),
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });
    if (!response.ok) {
      throw new Error(`Gemini photo identification failed (HTTP ${response.status}).`);
    }
    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = (data.candidates?.[0]?.content?.parts ?? [])
      .map((part) => part.text ?? "")
      .join("")
      .trim();
    const raw = JSON.parse(text) as Record<string, unknown>;
    return {
      title: clean(raw.title),
      creator: clean(raw.creator),
      publisher: clean(raw.publisher),
      format: clean(raw.format),
      year: clean(raw.year),
      category: clean(raw.category),
      description: clean(raw.description),
    };
  }
}

export function photoIdentificationProvider(): PhotoIdentificationProvider {
  return aiPhotoConfigured()
    ? new GeminiPhotoIdentificationProvider()
    : new DisabledPhotoIdentificationProvider();
}
