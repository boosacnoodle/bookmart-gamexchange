import type { ConditionGrade, ProductCategory } from "@prisma/client";

export function formatMoney(minor: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(minor / 100);
}

export function conditionLabel(grade: ConditionGrade) {
  const labels: Record<ConditionGrade, string> = {
    NEW_SEALED: "New / sealed",
    LIKE_NEW: "Like new",
    VERY_GOOD: "Very good",
    GOOD: "Good",
    ACCEPTABLE: "Acceptable",
    FOR_PARTS_UNTESTED: "For parts / untested",
    STAFF_REVIEWED_COLLECTIBLE: "Staff-reviewed collectible",
  };
  return labels[grade];
}

export function categoryLabel(category: ProductCategory) {
  const labels: Record<ProductCategory, string> = {
    BOOKS: "Books",
    GAMES: "Games",
    CONSOLES: "Consoles",
    VINYL: "Vinyl",
    RARE_COLLECTIBLE: "Rare & Collectible",
    MUSIC_FILM: "Music & Film",
    JEWELLERY_CURIOSITIES: "Curiosities",
    ACCESSORIES: "Accessories",
    COLLECTIBLES: "Collectibles",
    MISCELLANEOUS: "Miscellaneous",
  };
  return labels[category];
}
