import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

/**
 * One search across the whole building. Results are grouped by room, because
 * that is how a customer would be told where to look.
 */
export function SearchField({
  initial = "",
  placeholder = "Books, games, records, oddities…",
  className = "",
}: {
  initial?: string;
  placeholder?: string;
  className?: string;
}) {
  const navigate = useNavigate();
  const [value, setValue] = useState(initial);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        if (!q) return;
        navigate({ to: "/search", search: { q } });
      }}
      className={`min-w-0 ${className}`}
    >
      <label
        className="flex items-center gap-3 rounded-sm bg-timber-deep/80 px-4 py-3 transition-shadow duration-200 ease-[var(--ease-brass)] focus-within:shadow-[var(--shadow-plate),0_0_0_1px_var(--brass)]"
        style={{ boxShadow: "var(--shadow-plate)" }}
      >
        <Search className="h-4 w-4 shrink-0 text-brass/70" aria-hidden="true" />
        <span className="sr-only">Search the shop</span>
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />
      </label>
    </form>
  );
}