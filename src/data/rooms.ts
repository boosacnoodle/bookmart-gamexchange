import roomLibrary from "@/assets/room-library.webp";
import roomArcade from "@/assets/room-arcade.webp";
import roomSoundVision from "@/assets/room-sound-vision.webp";
import roomCuriosity from "@/assets/room-curiosity.webp";

export type RoomId = "library" | "arcade" | "sound-vision" | "curiosity";

export type Room = {
  id: RoomId;
  name: string;
  plain: string;
  href: string;
  image: string;
  note: string;
  shelves: string[];
  /** Short tags shown on the homepage cards — three maximum. */
  tags: string[];
  /** Warm rooms brighten on attention. The Archive is handled separately. */
  glow: string;
  /** The room's own colour temperature, laid over the artwork as light. */
  grade: string;
};

export const ROOMS: Room[] = [
  {
    id: "library",
    name: "Books",
    plain: "",
    href: "/library",
    image: roomLibrary,
    note: "Timber, reading lamps, and more spines than shelf. Fiction through to the odd forgotten hardback.",
    shelves: ["Fiction", "Non-fiction", "Children's", "Irish writing"],
    tags: ["Fiction", "Non-fiction", "Irish Writing"],
    glow: "var(--lamplight)",
    grade:
      "radial-gradient(20rem 16rem at 46% 40%, color-mix(in oklab, var(--glass-green) 16%, transparent), transparent 70%), linear-gradient(to bottom, color-mix(in oklab, var(--brass) 12%, transparent), color-mix(in oklab, var(--ink) 34%, transparent))",
  },
  {
    id: "arcade",
    name: "Games",
    plain: "",
    href: "/arcade",
    image: roomArcade,
    note: "One room, four walls of shelves. The light changes depending on which shelf you are stood at.",
    shelves: ["Nintendo", "PlayStation", "Xbox", "Retro"],
    tags: ["Nintendo", "PlayStation", "Xbox"],
    glow: "oklch(0.62 0.17 150)",
    grade:
      "radial-gradient(9rem 12rem at 12% 46%, color-mix(in oklab, var(--neon-open) 17%, transparent), transparent 68%), radial-gradient(9rem 12rem at 38% 44%, color-mix(in oklab, oklch(0.6 0.13 250) 16%, transparent), transparent 68%), radial-gradient(9rem 12rem at 64% 46%, color-mix(in oklab, oklch(0.62 0.15 150) 15%, transparent), transparent 68%), radial-gradient(10rem 12rem at 90% 44%, color-mix(in oklab, oklch(0.55 0.14 300) 15%, transparent), transparent 68%)",
  },
  {
    id: "sound-vision",
    name: "Music & Film",
    plain: "",
    href: "/sound-vision",
    image: roomSoundVision,
    note: "Crates you can flick through, a turntable that works, and a wall of films nobody streams any more.",
    shelves: ["Vinyl", "CDs", "DVD & Blu-ray", "Soundtracks"],
    tags: ["Vinyl", "CDs", "DVD & Blu-ray"],
    glow: "oklch(0.68 0.15 40)",
    grade:
      "radial-gradient(16rem 14rem at 52% 52%, color-mix(in oklab, oklch(0.72 0.14 62) 20%, transparent), transparent 70%), linear-gradient(to bottom, color-mix(in oklab, var(--lamplight) 8%, transparent), transparent 60%)",
  },
  {
    id: "curiosity",
    name: "Rare & Collectible",
    plain: "",
    href: "/curiosity-cabinet",
    image: roomCuriosity,
    note: "Drawers of things that arrived with no category. Open one and see what somebody parted with.",
    shelves: ["Figures", "Trading cards", "Ephemera", "Unclassified"],
    tags: ["Rare Books", "Figures", "Curiosities"],
    glow: "oklch(0.7 0.11 88)",
    grade:
      "linear-gradient(112deg, color-mix(in oklab, var(--lamplight) 12%, transparent) 0 14%, transparent 26%), radial-gradient(14rem 13rem at 50% 46%, color-mix(in oklab, var(--brass) 14%, transparent), transparent 66%), radial-gradient(22rem 20rem at 50% 60%, transparent 40%, color-mix(in oklab, var(--ink) 46%, transparent))",
  },
];

export function getRoom(id: RoomId): Room {
  const room = ROOMS.find((r) => r.id === id);
  if (!room) throw new Error(`Unknown room: ${id}`);
  return room;
}
