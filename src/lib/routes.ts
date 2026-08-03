import type { CategoryMeta } from "./types";

export const categories: CategoryMeta[] = [
  {
    slug: "books",
    category: "BOOKS",
    title: "Books",
    navTitle: "Books",
    intro: "Paperbacks, Irish history, unusual non-fiction and staff-selected collectible editions.",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80"
  },
  {
    slug: "games",
    category: "GAMES",
    title: "Games",
    navTitle: "Games",
    intro: "Modern favourites, traded-in classics and retro titles with condition notes.",
    imageUrl: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=1200&q=80"
  },
  {
    slug: "consoles",
    category: "CONSOLES",
    title: "Consoles",
    navTitle: "Consoles",
    intro: "Boxed consoles, loose handhelds, controllers and tested accessories.",
    imageUrl: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=1200&q=80"
  },
  {
    slug: "vinyl",
    category: "VINYL",
    title: "Vinyl",
    navTitle: "Vinyl",
    intro: "Records, CDs and film finds with visible condition grading.",
    imageUrl: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?auto=format&fit=crop&w=1200&q=80"
  },
  {
    slug: "rare-collectible",
    category: "RARE_COLLECTIBLE",
    title: "Rare & Collectible",
    navTitle: "Rare",
    intro: "One-off books, signed demo items, boxed editions and unusual finds reviewed by staff.",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80"
  },
  {
    slug: "curiosities",
    category: "JEWELLERY_CURIOSITIES",
    title: "Jewellery & Curiosities",
    navTitle: "Curiosities",
    intro: "Small objects, display pieces and oddities that make the shop worth browsing in person.",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80"
  }
];

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/books", label: "Books" },
  { href: "/games", label: "Games" },
  { href: "/consoles", label: "Consoles" },
  { href: "/vinyl", label: "Vinyl" },
  { href: "/rare-collectible", label: "Rare" },
  { href: "/search", label: "Search" },
  { href: "/sell-or-trade", label: "Sell or Trade" },
  { href: "/visit-us", label: "Visit" }
];
