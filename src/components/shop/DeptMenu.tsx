import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { ROOMS } from "@/data/rooms";

/**
 * Mobile department menu: the waffle icon top-right opens a slide-down
 * panel listing all four rooms plus the street. Desktop never sees this —
 * the room grid on the homepage and the "Move through the building" strip
 * on each room page already do that job with a mouse.
 */
export function DeptMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label={open ? "Close department menu" : "Browse departments"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid h-11 w-11 place-items-center rounded-full text-brass/75 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brass/60"
      >
        {open ? (
          <X className="h-[1.15rem] w-[1.15rem]" />
        ) : (
          <Menu className="h-[1.15rem] w-[1.15rem]" />
        )}
      </button>

      {open ? (
        <div
          className="animate-door-in fixed inset-x-0 top-[3.25rem] z-40 border-t border-brass/15 bg-ink/97 backdrop-blur-md"
          style={{ boxShadow: "0 20px 40px -20px oklch(0 0 0 / 0.8)" }}
        >
          <nav aria-label="Departments" className="mx-auto max-w-[1800px] px-4 py-2">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="pixel-label flex min-h-12 items-center border-b border-brass/10 text-brass/60 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight"
            >
              The Street (Home)
            </Link>
            {ROOMS.map((room) => (
              <Link
                key={room.id}
                to={room.href}
                search={{ shelf: undefined }}
                onClick={() => setOpen(false)}
                className="sign-plate flex min-h-12 items-center justify-between border-b border-brass/10 text-[1.05rem] text-lamplight/90 transition-colors duration-200 ease-[var(--ease-brass)] last:border-b-0 hover:text-lamplight"
              >
                {room.name}
                <span className="shop-meta text-brass/50">Browse</span>
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
