import type { ProductCategory } from "@prisma/client";
import type { MetadataCandidate } from "./metadata";

export type PublicDepartment =
  | "Books"
  | "Rare Books"
  | "Retro Games"
  | "Nintendo"
  | "PlayStation"
  | "Xbox"
  | "Films & Music"
  | "More";

export type DetectedItemType = "Book" | "Game" | "Console" | "Music" | "Film" | "Collectible" | "Other";

export type Classification = {
  detectedType: DetectedItemType;
  productCategory: ProductCategory;
  publicDepartment: PublicDepartment;
  categoryRoute: string;
  platform: string | null;
  reviewReason: string;
};

const nintendoPlatforms = [
  "nes",
  "snes",
  "super nintendo",
  "nintendo 64",
  "n64",
  "gamecube",
  "wii",
  "wii u",
  "switch",
  "game boy",
  "game boy color",
  "game boy advance",
  "gba",
  "nintendo ds",
  "nintendo 3ds",
  "3ds"
];

const playstationPlatforms = ["playstation", "ps1", "ps2", "ps3", "ps4", "ps5", "psp", "ps vita", "vita"];
const xboxPlatforms = ["xbox", "xbox 360", "xbox one", "xbox series x", "xbox series s"];
const historicPlatforms = [
  "sega",
  "master system",
  "mega drive",
  "genesis",
  "saturn",
  "dreamcast",
  "atari",
  "commodore",
  "amiga",
  "spectrum",
  "neo geo",
  "pc engine",
  "turbografx"
];

function normalized(value: string | null | undefined) {
  return value?.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() ?? "";
}

function platformIn(platform: string | null | undefined, values: string[]) {
  const text = normalized(platform);
  return values.some((value) => text === value || text.includes(value));
}

export function categoryRoute(category: ProductCategory, platform?: string | null) {
  if (category === "BOOKS") return "/books";
  if (category === "RARE_COLLECTIBLE") return "/rare-collectible";
  if (category === "MUSIC_FILM" || category === "VINYL") return "/music-film";
  if (category === "CONSOLES") return "/consoles";
  if (category === "GAMES") return platform ? `/search?platform=${encodeURIComponent(platform)}` : "/games";
  return "/collections";
}

export function publicDepartmentFor(category: ProductCategory, platform?: string | null): PublicDepartment {
  if (category === "BOOKS") return "Books";
  if (category === "RARE_COLLECTIBLE") return "Rare Books";
  if (category === "MUSIC_FILM" || category === "VINYL") return "Films & Music";
  if (category === "GAMES" || category === "CONSOLES") {
    if (platformIn(platform, nintendoPlatforms)) return "Nintendo";
    if (platformIn(platform, playstationPlatforms)) return "PlayStation";
    if (platformIn(platform, xboxPlatforms)) return "Xbox";
    if (platformIn(platform, historicPlatforms)) return "Retro Games";
    return category === "GAMES" ? "Retro Games" : "More";
  }
  return "More";
}

export function detectedTypeFor(category: ProductCategory): DetectedItemType {
  if (category === "BOOKS") return "Book";
  if (category === "GAMES") return "Game";
  if (category === "CONSOLES") return "Console";
  if (category === "VINYL" || category === "MUSIC_FILM") return "Music";
  if (category === "RARE_COLLECTIBLE" || category === "COLLECTIBLES") return "Collectible";
  return "Other";
}

export function classifyCandidate(
  candidate: Pick<MetadataCandidate, "category" | "platform" | "subjects" | "title" | "edition">,
  overrides: { category?: ProductCategory | null; platform?: string | null; rare?: boolean } = {}
): Classification {
  const platform = overrides.platform ?? candidate.platform;
  let category = overrides.category ?? candidate.category;
  const evidence = [candidate.title, candidate.edition, ...(candidate.subjects ?? [])].map(normalized).join(" ");

  if (category === "BOOKS" && overrides.rare) category = "RARE_COLLECTIBLE";
  if (category === "BOOKS" && !overrides.category) category = "BOOKS";
  if (category === "RARE_COLLECTIBLE" && !/(collectible|signed|first edition|antiquarian|rare)/.test(evidence) && !overrides.rare) {
    category = "BOOKS";
  }

  return {
    detectedType: detectedTypeFor(category),
    productCategory: category,
    publicDepartment: publicDepartmentFor(category, platform),
    categoryRoute: categoryRoute(category, platform),
    platform: platform || null,
    reviewReason: "Staff can override this before publication."
  };
}
