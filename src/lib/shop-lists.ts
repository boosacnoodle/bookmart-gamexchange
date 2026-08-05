/**
 * The counter and the "keep an eye out" list. Kept on the visitor's own
 * device: no account needed to put something aside.
 */
import { useEffect, useState } from "react";

export type ListName = "basket" | "wishlist";

const KEY: Record<ListName, string> = {
  basket: "bookmart.counter",
  wishlist: "bookmart.watching",
};

const EVENT = "bookmart:lists";

function read(list: ListName): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY[list]);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function write(list: ListName, ids: string[]) {
  try {
    window.localStorage.setItem(KEY[list], JSON.stringify(ids));
  } catch {
    /* private browsing: the list simply does not persist */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function addTo(list: ListName, id: string) {
  const ids = read(list);
  if (!ids.includes(id)) write(list, [...ids, id]);
}

export function removeFrom(list: ListName, id: string) {
  write(
    list,
    read(list).filter((v) => v !== id),
  );
}

export function toggleIn(list: ListName, id: string) {
  const ids = read(list);
  write(list, ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id]);
}

export function clearList(list: ListName) {
  write(list, []);
}

/** Reads after hydration only, so the server and the client agree. */
export function useList(list: ListName): string[] {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setIds(read(list));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [list]);

  return ids;
}
