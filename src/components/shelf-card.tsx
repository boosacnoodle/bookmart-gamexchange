import Image from "next/image";
import Link from "next/link";
import type { CuratedShelf } from "@/lib/types";

export function ShelfCard({ shelf }: { shelf: CuratedShelf }) {
  return (
    <Link href={`/collections/${shelf.slug}`} className="shelf-card">
      <Image src={shelf.coverImageUrl} alt="" width={720} height={520} />
      <div>
        <span>{shelf.curatorName ?? "Staff shelf"}</span>
        <h3>{shelf.title}</h3>
        <p>{shelf.introduction}</p>
      </div>
    </Link>
  );
}
