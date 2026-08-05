import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * Big, calm parts. Everything here is at least 56px tall so it can be hit
 * with a thumb while holding a book in the other hand.
 */

export function BigButton({
  children,
  onClick,
  disabled,
  tone = "brass",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "brass" | "quiet";
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`sign-plate flex min-h-[3.5rem] w-full items-center justify-center rounded-sm px-6 text-[1.05rem] transition-[opacity,box-shadow] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass disabled:opacity-40 ${
        tone === "brass" ? "bg-timber/90 text-lamplight" : "text-brass/75"
      }`}
      style={{
        boxShadow:
          tone === "brass"
            ? "var(--shadow-plate), inset 0 0 0 1px color-mix(in oklab, var(--brass) 40%, transparent)"
            : "inset 0 0 0 1px color-mix(in oklab, var(--brass) 20%, transparent)",
      }}
    >
      {children}
    </button>
  );
}

export function BigLink({
  to,
  children,
  tone = "brass",
}: {
  to: string;
  children: ReactNode;
  tone?: "brass" | "quiet";
}) {
  return (
    <Link
      to={to}
      className={`sign-plate flex min-h-[3.5rem] w-full items-center justify-center rounded-sm px-6 text-center text-[1.05rem] transition-[opacity,box-shadow] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass ${
        tone === "brass" ? "bg-timber/90 text-lamplight" : "text-brass/75"
      }`}
      style={{
        boxShadow:
          tone === "brass"
            ? "var(--shadow-plate), inset 0 0 0 1px color-mix(in oklab, var(--brass) 40%, transparent)"
            : "inset 0 0 0 1px color-mix(in oklab, var(--brass) 20%, transparent)",
      }}
    >
      {children}
    </Link>
  );
}

export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: { to: string; label: string };
  children: ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="flex items-end justify-between gap-3">
        <h2 className="shop-meta text-brass/55">{title}</h2>
        {action ? (
          <Link
            to={action.to}
            className="shop-meta min-h-11 pt-3 text-brass/70 transition-colors hover:text-lamplight"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

/** One line on a list: a name, a plain sentence under it, and a right chevron. */
export function Row({
  to,
  onClick,
  title,
  detail,
  meta,
  flag,
}: {
  to?: string;
  onClick?: () => void;
  title: string;
  detail?: string;
  meta?: string;
  flag?: boolean | undefined;
}) {
  const inner = (
    <span className="flex min-h-[3.5rem] w-full items-center gap-3 px-4 py-3 text-left">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.98rem] leading-tight text-lamplight/90">
          {title}
        </span>
        {detail ? (
          <span className="mt-1 block truncate text-[0.84rem] leading-tight text-foreground/55">
            {detail}
          </span>
        ) : null}
      </span>
      {meta ? (
        <span
          className={`shop-meta shrink-0 ${flag ? "text-lamplight/80" : "text-foreground/40"}`}
        >
          {meta}
        </span>
      ) : null}
      <span aria-hidden="true" className="shrink-0 text-brass/45">
        ›
      </span>
    </span>
  );

  const style = {
    boxShadow: `inset 0 0 0 1px color-mix(in oklab, var(--brass) ${flag ? 30 : 14}%, transparent)`,
  };
  const base =
    "block w-full rounded-sm bg-timber-deep/45 transition-colors hover:bg-timber-deep/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass/60";

  if (to) {
    return (
      <Link to={to} className={base} style={style}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={base} style={style}>
      {inner}
    </button>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-sm px-4 py-5 text-[0.88rem] leading-[1.6] text-foreground/45"
      style={{ boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--brass) 10%, transparent)" }}
    >
      {children}
    </p>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="shop-meta block text-brass/55">{label}</span>
      {hint ? (
        <span className="mt-1 block text-[0.82rem] leading-[1.5] text-foreground/45">{hint}</span>
      ) : null}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

export const inputClass =
  "block min-h-[3.25rem] w-full rounded-sm bg-timber-deep/55 px-4 text-[1rem] text-lamplight placeholder:text-foreground/35 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-brass/70";

export const inputShadow = {
  boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--brass) 20%, transparent)",
};

/** Big tappable choices instead of a dropdown: faster with one thumb. */
export function ChoiceRow({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const on = option === value;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(option)}
            className={`min-h-[3rem] rounded-sm px-4 text-[0.95rem] transition-colors ${
              on ? "bg-timber/90 text-lamplight" : "text-foreground/60 hover:text-lamplight"
            }`}
            style={{
              boxShadow: `inset 0 0 0 1px color-mix(in oklab, var(--brass) ${on ? 45 : 16}%, transparent)`,
            }}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}