export type ProductCategory =
  | "BOOKS"
  | "GAMES"
  | "CONSOLES"
  | "VINYL"
  | "RARE_COLLECTIBLE"
  | "MUSIC_FILM"
  | "JEWELLERY_CURIOSITIES"
  | "ACCESSORIES"
  | "COLLECTIBLES"
  | "MISCELLANEOUS";

export type InventoryState = "PUBLISHED" | "RESERVED" | "SOLD";

export type ConditionGrade =
  | "NEW_SEALED"
  | "LIKE_NEW"
  | "VERY_GOOD"
  | "GOOD"
  | "ACCEPTABLE"
  | "FOR_PARTS_UNTESTED"
  | "STAFF_REVIEWED_COLLECTIBLE";

export type Product = {
  id: string;
  title: string;
  slug: string;
  category: ProductCategory;
  subcategory: string;
  creator?: string;
  publisher?: string;
  platform?: string;
  format?: string;
  isbn?: string;
  ean?: string;
  sku: string;
  priceMinor: number;
  shortDescription: string;
  description: string;
  conditionGrade: ConditionGrade;
  conditionReport: string;
  included: string[];
  missing: string[];
  testedStatus?: string;
  shelfLocation: string;
  quantity: number;
  inventoryState: InventoryState;
  isFeatured: boolean;
  isStaffPick: boolean;
  isRare: boolean;
  imageUrl: string;
  gallery: string[];
};

export type CuratedShelf = {
  id: string;
  title: string;
  slug: string;
  introduction: string;
  coverImageUrl: string;
  curatorName?: string;
  homepageVisible: boolean;
  displayOrder: number;
  productSlugs: string[];
  productNotes: Record<string, string>;
};

export type CategoryMeta = {
  slug: string;
  category: ProductCategory;
  title: string;
  navTitle: string;
  intro: string;
  imageUrl: string;
};
