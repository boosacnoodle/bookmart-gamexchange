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

/**
 * Server-side AI photo identification.
 *
 * SECURITY: This module runs ONLY on the server (imported exclusively from
 * `*.server.ts` modules). API keys are read from server env vars and are
 * NEVER sent to the browser. The public website can never extract them.
 *
 * Provider selection: set AI_PHOTO_IDENTIFICATION_PROVIDER=openai to use
 * OpenAI (requires OPENAI_API_KEY), otherwise Gemini is used (requires
 * GEMINI_API_KEY). Both are gated by AI_PHOTO_IDENTIFICATION_ENABLED=true.
 */
export function aiPhotoConfigured() {
  if (process.env.AI_PHOTO_IDENTIFICATION_ENABLED !== "true") return false;
  const provider = process.env.AI_PHOTO_IDENTIFICATION_PROVIDER ?? "gemini";
  if (provider === "openai") return Boolean(process.env.OPENAI_API_KEY);
  return Boolean(process.env.GEMINI_API_KEY);
}

export function aiPhotoProviderName(): string {
  if (!aiPhotoConfigured()) return "Disabled AI Photo Identification";
  const provider = process.env.AI_PHOTO_IDENTIFICATION_PROVIDER ?? "gemini";
  return provider === "openai" ? "OpenAI Vision" : "Gemini Flash";
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
      "AI photo identification is not configured. Add an OpenAI or Google AI Studio (Gemini) key to identify rare and unbarcoded items.",
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

export class OpenAIPhotoIdentificationProvider implements PhotoIdentificationProvider {
  name = "OpenAI Vision";
  async identify(request: AiPhotoRequest): Promise<PhotoIdentifyResult> {
    if (!aiPhotoConfigured())
      throw new Error("OpenAI photo identification is disabled or missing server configuration.");
    const model = process.env.OPENAI_PHOTO_MODEL ?? "gpt-4o-mini";
    const endpoint = "https://api.openai.com/v1/chat/completions";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: `Category hint: ${request.category}. Extract only visible facts.` },
              ...request.imageUrls.map((imageUrl) => ({
                type: "image_url",
                image_url: { url: imageUrl },
              })),
            ],
          },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });
    if (!response.ok) {
      throw new Error(`OpenAI photo identification failed (HTTP ${response.status}).`);
    }
    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = (data.choices?.[0]?.message?.content ?? "").trim();
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
  if (!aiPhotoConfigured()) return new DisabledPhotoIdentificationProvider();
  const provider = process.env.AI_PHOTO_IDENTIFICATION_PROVIDER ?? "gemini";
  return provider === "openai"
    ? new OpenAIPhotoIdentificationProvider()
    : new GeminiPhotoIdentificationProvider();
}
