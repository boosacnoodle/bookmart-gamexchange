/**
 * The shelves in a room become its navigation. Selecting a shelf is a lit
 * brass plate, not a dropdown.
 */
export function ShelfRail({
  shelves,
  active,
  onSelect,
  allLabel = "Everything",
  counts,
}: {
  shelves: string[];
  active: string;
  onSelect: (shelf: string) => void;
  allLabel?: string;
  counts?: Record<string, number>;
}) {
  const options = [allLabel, ...shelves];

  return (
    <nav aria-label="Shelves" className="mt-8 flex flex-wrap gap-2">
      {options.map((shelf) => {
        const isActive = active === shelf;
        return (
          <button
            key={shelf}
            type="button"
            aria-current={isActive ? "true" : undefined}
            onClick={() => onSelect(shelf)}
            className={`shop-meta rounded-sm px-4 py-2.5 transition-[color,box-shadow,background-color] duration-200 ease-[var(--ease-brass)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass ${
              isActive
                ? "bg-timber/85 text-lamplight"
                : "bg-timber-deep/60 text-brass/70 hover:text-lamplight"
            }`}
            style={{
              boxShadow: isActive
                ? "var(--shadow-plate), inset 0 0 0 1px color-mix(in oklab, var(--brass) 40%, transparent)"
                : "var(--shadow-plate)",
            }}
          >
            {shelf}
            {counts && counts[shelf] !== undefined ? (
              <span className="ml-2 text-foreground/40">{counts[shelf]}</span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
