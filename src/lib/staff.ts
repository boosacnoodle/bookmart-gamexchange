/**
 * The back office, kept on the shop phone.
 *
 * A prototype store: the signed-in shopkeeper and the items being added live
 * in localStorage so the whole flow can be walked through on a real Android
 * handset before any of it is wired to the till system.
 */
import { useEffect, useState } from "react";

import type { RoomId } from "@/data/rooms";

const SESSION_KEY = "bookmart.staff.session";
const DRAFTS_KEY = "bookmart.staff.drafts";
const PUBLISHED_KEY = "bookmart.staff.published";
const EVENT = "bookmart:staff";

export type ItemKind = "book" | "game" | "music-film" | "rare";

export type StaffItem = {
  id: string;
  kind: ItemKind;
  /** What is printed on the back, if it had one. */
  barcode?: string;
  photos: number;
  title: string;
  maker: string;
  year?: string;
  extra?: string;
  room: RoomId;
  shelf: string;
  condition: string;
  price: string;
  note?: string;
  /** When it was last touched, so the dashboard can order the lists. */
  updated: string;
};

export const ITEM_KINDS: { id: ItemKind; label: string; hint: string; room: RoomId }[] = [
  { id: "book", label: "A book", hint: "Paperback, hardback, anything off the shelves", room: "library" },
  { id: "game", label: "A game or console", hint: "Nintendo, PlayStation, Xbox, retro", room: "arcade" },
  { id: "music-film", label: "Music or a film", hint: "Vinyl, CDs, DVD, Blu-ray", room: "sound-vision" },
  { id: "rare", label: "Something rare or odd", hint: "Collectibles, cards, curiosities", room: "curiosity" },
];

export const CONDITIONS = ["Excellent", "Very good", "Good", "Well read", "Boxed"];

export const SHELVES: Record<RoomId, string[]> = {
  library: ["Fiction", "Non-fiction", "Children's", "Irish writing"],
  arcade: ["Nintendo", "PlayStation", "Xbox", "Retro"],
  "sound-vision": ["Vinyl", "CDs", "DVD & Blu-ray", "Soundtracks"],
  curiosity: ["Figures", "Trading cards", "Ephemera", "Unclassified"],
};

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private browsing: the phone simply forgets */
  }
  window.dispatchEvent(new Event(EVENT));
}

/* ---- who is behind the counter ------------------------------------- */

export function signIn(name: string) {
  safeWrite(SESSION_KEY, { name, since: new Date().toISOString() });
}

export function signOut() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** null while hydrating, so the server and the phone always agree. */
export function useStaff(): { name: string } | null | undefined {
  const [staff, setStaff] = useState<{ name: string } | null | undefined>(undefined);
  useEffect(() => {
    const sync = () => setStaff(safeRead<{ name: string } | null>(SESSION_KEY, null));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return staff;
}

/* ---- items being added --------------------------------------------- */

function readItems(key: string) {
  const items = safeRead<StaffItem[]>(key, []);
  return Array.isArray(items) ? items : [];
}

export function startItem(kind: ItemKind): StaffItem {
  const preset = ITEM_KINDS.find((k) => k.id === kind)!;
  const item: StaffItem = {
    id: `new-${Date.now()}`,
    kind,
    photos: 0,
    title: "",
    maker: "",
    room: preset.room,
    shelf: SHELVES[preset.room][0]!,
    condition: "Very good",
    price: "",
    updated: new Date().toISOString(),
  };
  safeWrite(DRAFTS_KEY, [item, ...readItems(DRAFTS_KEY)]);
  return item;
}

export function saveItem(id: string, patch: Partial<StaffItem>) {
  safeWrite(
    DRAFTS_KEY,
    readItems(DRAFTS_KEY).map((item) =>
      item.id === id ? { ...item, ...patch, updated: new Date().toISOString() } : item,
    ),
  );
}

export function discardItem(id: string) {
  safeWrite(
    DRAFTS_KEY,
    readItems(DRAFTS_KEY).filter((item) => item.id !== id),
  );
}

export function publishItem(id: string) {
  const drafts = readItems(DRAFTS_KEY);
  const item = drafts.find((d) => d.id === id);
  if (!item) return;
  safeWrite(
    PUBLISHED_KEY,
    [{ ...item, updated: new Date().toISOString() }, ...readItems(PUBLISHED_KEY)].slice(0, 40),
  );
  safeWrite(
    DRAFTS_KEY,
    drafts.filter((d) => d.id !== id),
  );
}

function useItems(key: string): StaffItem[] {
  const [items, setItems] = useState<StaffItem[]>([]);
  useEffect(() => {
    const sync = () => setItems(readItems(key));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [key]);
  return items;
}

export function useDrafts() {
  return useItems(DRAFTS_KEY);
}

export function usePublished() {
  return useItems(PUBLISHED_KEY);
}

/** The item currently on the counter: the most recently touched unfinished one. */
export function useCurrentItem(): StaffItem | undefined {
  return useDrafts()[0];
}

/** Photographs stay in memory for the life of the page — a prototype detail. */
const PHOTOS = new Map<string, string[]>();

export function addPhotos(id: string, urls: string[]) {
  PHOTOS.set(id, [...(PHOTOS.get(id) ?? []), ...urls]);
  saveItem(id, { photos: PHOTOS.get(id)!.length });
}

export function itemPhotos(id: string) {
  return PHOTOS.get(id) ?? [];
}

export function removePhoto(id: string, url: string) {
  PHOTOS.set(id, (PHOTOS.get(id) ?? []).filter((u) => u !== url));
  saveItem(id, { photos: PHOTOS.get(id)!.length });
}

export function whenTouched(iso: string) {
  const then = new Date(iso).getTime();
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return new Date(iso).toLocaleDateString("en-IE", { day: "numeric", month: "long" });
}

export function itemName(item: StaffItem) {
  return item.title.trim() || "Item with no name yet";
}
