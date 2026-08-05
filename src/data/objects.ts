import objectLibrary from "@/assets/object-library.jpg";
import objectArcade from "@/assets/object-arcade.jpg";
import objectSoundVision from "@/assets/object-sound-vision.jpg";
import objectCuriosity from "@/assets/object-curiosity.jpg";
import versoLibrary from "@/assets/object-library-verso.jpg";
import versoArcade from "@/assets/object-arcade-verso.jpg";
import versoSoundVision from "@/assets/object-sound-vision-verso.jpg";
import versoCuriosity from "@/assets/object-curiosity-verso.jpg";

import { getRoom, type RoomId } from "./rooms";
import { STOCK, type StockItem } from "./stock";

/**
 * The counter. One object at a time, under the lamp.
 *
 * Slugs keep every item inside its room, so the URL still reads like a place
 * in the building: /library/the-hobbit-1988-paperback.
 */

export type Availability = "available" | "reserved" | "sold";

/** Staff-written, typed at the counter. Never generated. Optional by design. */
type CounterRecord = {
  /** The Shopkeeper's Note. Absent for most items, and that is fine. */
  note?: string;
  /** Honest, handwritten condition remarks. Nothing hidden. */
  marks?: string[];
  availability?: Availability;
};

const COUNTER: Record<string, CounterRecord> = {
  "lib-001": {
    note: "Lovely early Penguin printing with honest shelf wear. One of our favourite copies to come through the shop, and the underlining is in all the right places.",
    marks: ["Slight fading on spine.", "Pencil underlining in the first hundred pages."],
  },
  "lib-002": { marks: ["Sun-faded top edge.", "Reading copy — priced as one."] },
  "lib-003": {
    note: "Read to bits by somebody who clearly loved it. We would rather sell an honest copy than a stiff one.",
    marks: ["Cover creased at the corner.", "Text block clean and tight."],
  },
  "lib-004": { marks: ["Jacket unclipped.", "Barely opened."] },
  "lib-007": {
    note: "Goes out the door nearly as fast as it comes in. If it is gone by the time you call in, we will keep an eye out for the next one.",
    marks: ["No markings.", "Spine unbroken."],
  },
  "lib-008": {
    note: "A child called Aoife owned this in 1989 and wrote her name inside the cover. We left it exactly where it was.",
    marks: ["Previous owner's inscription.", "Spine creased from real reading."],
  },
  "lib-013": {
    note: "Interesting local title that does not appear very often. Somebody pressed a fern into it years ago and we have not the heart to remove it.",
    marks: ["Pressed fern between pages 60 and 61.", "Boards clean."],
  },
  "arc-001": {
    note: "Case opened on request. Bodley Head edition, and one of the nicer copies we have had behind glass.",
    marks: ["Jacket price-clipped.", "Boards clean."],
    availability: "reserved",
  },
  "arc-002": { marks: ["Signed to the title page.", "Unclipped jacket."] },
  "arc-003": { marks: ["Foxing to endpapers.", "Boards sound."] },
  "arc-n01": {
    note: "Tested on our own console at the counter before it went out on the shelf. Cart only, but a genuine one.",
    marks: ["Label intact.", "Contacts cleaned and tested in-store."],
  },
  "arc-n03": {
    note: "Complete with manual. Tested in-store. Fantastic couch co-op game and still the best of them.",
    marks: ["One shelf-rub to the case.", "Disc unmarked."],
  },
  "arc-n04": {
    note: "New save battery fitted here at the bench, so it will hold a game again. We can wipe the old trainer if you would rather start fresh.",
    marks: ["Genuine cartridge.", "New save battery fitted in-store."],
  },
  "arc-p01": { marks: ["Both discs present.", "Manual creased but complete."] },
  "arc-p02": { marks: ["Disc professionally resurfaced.", "Plays clean throughout."] },
  "arc-r03": {
    note: "Ran for an hour on the shop telly before we would put a price on it. One pad and the original PSU.",
    marks: ["Light scuffing to the shell.", "Tested for an hour in-store."],
  },
  "sv-v01": {
    note: "Graded honestly at VG+ and played the whole way through on the turntable in the room. The ring wear is part of its life.",
    marks: ["Ring wear to sleeve.", "Vinyl graded VG+."],
  },
  "sv-v03": { marks: ["Original inner sleeve.", "Sleeve corners sharp."] },
  "sv-c03": {
    note: "Early Irish pressing, in from an attic clear-out in Drumcondra. Small thing, but the sort we like keeping in Dublin.",
    marks: ["Spine slightly sun-faded."],
  },
  "sv-d02": { marks: ["Slight edge wear to steelbook.", "Both discs present."] },
  "sv-s03": {
    note: "Came over the counter with a PlayStation trade and neither of us wanted to price it low. Obi strip still present, which is the rare part.",
    marks: ["Obi strip present.", "Four discs, all accounted for."],
  },
  "cc-f01": {
    note: "Never opened, which is remarkable for 1983. The yellowing is honest age, not damage.",
    marks: ["Bubble yellowed.", "Bubble lifted slightly at one corner."],
    availability: "reserved",
  },
  "cc-f03": {
    note: "One eye resewn by somebody who cared. Priced honestly and worth every cent of it.",
    marks: ["Eye resewn.", "Fur flattened from years of being held."],
  },
  "cc-t03": {
    note: "Four stickers short of complete, and we know exactly which four. If you have them, come and talk to us.",
    marks: ["Four stickers missing.", "Spine of album intact."],
  },
  "cc-e03": { note: "Biro on graph paper, folded into eight. We have no idea either, and that is the appeal." },
  "cc-u04": { marks: ["Glass sound.", "Base re-felted in-store."] },
};

export const OBJECT_PLATE: Record<RoomId, string> = {
  library: objectLibrary,
  arcade: objectArcade,
  "sound-vision": objectSoundVision,
  curiosity: objectCuriosity,
};

const OBJECT_VERSO: Record<RoomId, string> = {
  library: versoLibrary,
  arcade: versoArcade,
  "sound-vision": versoSoundVision,
  curiosity: versoCuriosity,
};

/**
 * The drawer card. Test/example catalogue detail typed at the counter —
 * publisher, edition, the number printed on the back. Deliberately partial:
 * second-hand stock rarely has a full record, and we only show what we know.
 */
type DrawerCard = {
  publisher?: string;
  edition?: string;
  /** Printed on the object: ISBN for books, EAN/UPC otherwise. */
  barcode?: string;
  region?: string;
  /** Discs, cartridges, pieces — whatever is physically in the box. */
  contents?: string;
};

const DRAWER: Record<string, DrawerCard> = {
  "lib-001": { publisher: "Penguin Books", edition: "Penguin paperback", barcode: "978-0-14-118268-2" },
  "lib-002": { publisher: "Panther / Granada", edition: "Reprint", barcode: "978-0-586-04409-6" },
  "lib-003": { publisher: "Viking", edition: "First UK paperback", barcode: "978-0-14-016777-7" },
  "lib-004": { publisher: "Fourth Estate", edition: "Hardback with jacket", barcode: "978-0-00-723018-1" },
  "lib-007": { publisher: "Bloomsbury", barcode: "978-0-7475-3269-9" },
  "lib-008": { publisher: "Puffin", edition: "1980s Puffin printing" },
  "lib-013": { publisher: "Dublin: Talbot Press", edition: "Local imprint" },
  "arc-001": { publisher: "The Bodley Head", edition: "Bodley Head edition" },
  "arc-002": { publisher: "Faber & Faber", edition: "Signed to title page" },
  "arc-003": { edition: "Nineteenth-century boards" },
  "arc-n01": { publisher: "Nintendo", region: "PAL", contents: "Cartridge only", barcode: "045496870034" },
  "arc-n03": { publisher: "Nintendo", region: "PAL", contents: "Disc, case and manual" },
  "arc-n04": { publisher: "Nintendo", region: "PAL", contents: "Cartridge only, new save battery" },
  "arc-p01": { publisher: "Konami", region: "PAL", contents: "Two discs and manual" },
  "arc-p02": { publisher: "Sony Computer Entertainment", region: "PAL", contents: "Disc and case" },
  "arc-r03": { publisher: "Sega", region: "PAL", contents: "Console, one pad, original PSU" },
  "sv-v01": { publisher: "Warner Bros. Records", edition: "UK pressing", contents: "LP and inner sleeve" },
  "sv-v03": { publisher: "Island Records", edition: "UK pressing", contents: "LP and original inner" },
  "sv-c03": { publisher: "Claddagh Records", edition: "Early Irish pressing" },
  "sv-d02": { edition: "Steelbook", region: "Region B", contents: "Two discs" },
  "sv-s03": { edition: "Japanese pressing with obi", region: "NTSC-J", contents: "Four discs" },
  "cc-f01": { publisher: "Kenner", edition: "1983 carded release", barcode: "076281390406" },
  "cc-f03": { edition: "Hand-repaired" },
  "cc-t03": { edition: "Part-filled album", contents: "Album, four stickers short" },
  "cc-u04": { edition: "Unattributed" },
};

/** A stable in-house reference, the kind biro'd onto the inside of a cover. */
export function catalogueRef(item: StockItem) {
  return `BM-${item.id.toUpperCase()}`;
}

/**
 * Three views of the one copy: on the counter, turned over, and the room it
 * came out of. Second-hand stock only ever has the photographs we took.
 */
export function objectGallery(item: StockItem) {
  const room = getRoom(item.room);
  return [
    {
      src: OBJECT_PLATE[item.room],
      label: "On the counter",
      caption: "Photographed in the shop. One copy only, so what you see is the copy you get.",
    },
    {
      src: OBJECT_VERSO[item.room],
      label: "Turned over",
      caption: "The back of it, under the same lamp. Marks and stickers left exactly as found.",
    },
    {
      src: room.image,
      label: "Where it lives",
      caption: `${item.shelf} in ${room.name}, which is where you will find it if you call in.`,
    },
  ];
}

/** Author, publisher, year, platform — shown only where they mean something. */
export function objectSpecs(item: StockItem) {
  const card = DRAWER[item.id];
  const book = item.room === "library" || item.archive === true;
  const specs: { label: string; value: string }[] = [];

  if (book) specs.push({ label: "Author", value: item.maker });
  if (item.room === "arcade" && !item.archive) specs.push({ label: "Platform", value: item.maker });
  if (item.room === "sound-vision") specs.push({ label: "Artist", value: item.maker });
  if (item.room === "curiosity") specs.push({ label: "Maker", value: item.maker });
  if (card?.publisher) specs.push({ label: book ? "Publisher" : "Label", value: card.publisher });
  if (item.year) specs.push({ label: "Year", value: String(item.year) });
  if (card?.edition) specs.push({ label: "Edition", value: card.edition });
  if (card?.contents) specs.push({ label: "In the box", value: card.contents });

  return specs;
}

/** The small print. Kept behind a fold so it never shouts. */
export function objectDetails(item: StockItem) {
  const card = DRAWER[item.id];
  const book = item.room === "library" || item.archive === true;
  const details: { label: string; value: string }[] = [
    { label: "Our reference", value: catalogueRef(item) },
  ];
  if (card?.barcode) details.push({ label: book ? "ISBN" : "Barcode", value: card.barcode });
  if (card?.region) details.push({ label: "Region", value: card.region });
  details.push({ label: "Category", value: `${getRoom(item.room).name} · ${item.shelf}` });
  details.push({ label: "Filed under", value: item.tags.join(", ") });
  return details;
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Title, year, and the format it came in — the way a card in a drawer reads. */
export function itemSlug(item: StockItem) {
  const format = item.tags[item.tags.length - 1] ?? "";
  return slugify([item.title, item.year ?? "", format].join(" "));
}

export function itemPath(item: StockItem) {
  return `${roomHref(item.room)}/${itemSlug(item)}`;
}

function roomHref(room: RoomId) {
  return room === "curiosity" ? "/curiosity-cabinet" : `/${room}`;
}

export function findItem(room: RoomId, slug: string): StockItem | undefined {
  return STOCK.find((item) => item.room === room && itemSlug(item) === slug);
}

export function shopkeeperNote(item: StockItem) {
  return COUNTER[item.id]?.note;
}

export function conditionMarks(item: StockItem) {
  return COUNTER[item.id]?.marks ?? [];
}

export function availability(item: StockItem): Availability {
  return COUNTER[item.id]?.availability ?? "available";
}

export function availabilityLabel(item: StockItem) {
  const state = availability(item);
  if (state === "reserved") return "Reserved";
  if (state === "sold") return "Sold";
  return "One copy available";
}

/**
 * What is sitting near it. Same shelf first, then the rest of the room —
 * the way you would actually find something else while putting one back.
 */
export function foundNearby(item: StockItem, limit = 3): StockItem[] {
  const room = STOCK.filter((other) => other.room === item.room && other.id !== item.id);
  const sameShelf = room.filter((other) => other.shelf === item.shelf);
  const rest = room.filter((other) => other.shelf !== item.shelf);
  return [...sameShelf, ...rest].slice(0, limit);
}
