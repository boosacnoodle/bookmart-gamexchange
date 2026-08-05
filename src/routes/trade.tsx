import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { ShopBar } from "@/components/shop/ShopBar";
import { TradeCounter } from "@/components/shop/TradeCounter";

const TITLE = "The Trade Counter — sell or trade in Dublin | Bookmart & GameXchange";
const DESCRIPTION =
  "Bring in books, games, consoles, vinyl or films. List what you have, tell us how you would like paying, and we will price it honestly at the counter.";

const KINDS = ["Books", "Games", "Consoles", "Vinyl & CDs", "Films", "Collectables"] as const;

type Line = { id: number; kind: string; detail: string; quantity: string };

export const Route = createFileRoute("/trade")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TradePage,
});

let nextId = 1;

function TradePage() {
  const [lines, setLines] = useState<Line[]>([
    { id: 0, kind: KINDS[0], detail: "", quantity: "1" },
  ]);
  const [payment, setPayment] = useState<"Cash" | "Shop credit">("Shop credit");
  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const [when, setWhen] = useState("");
  const [submitted, setSubmitted] = useState<null | { reference: string; items: number }>(null);

  const update = (id: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, ...patch } : line)));

  const filled = lines.filter((line) => line.detail.trim().length > 0);
  const canSubmit = filled.length > 0 && contact.trim().length > 3 && name.trim().length > 1;

  return (
    <div className="min-h-screen bg-ink">
      <ShopBar />
      <main className="animate-walk-in">
        <section className="mx-auto max-w-[1800px] px-6 pt-28 pb-6 sm:px-8">
          <p className="pixel-label text-brass/70">We buy &amp; trade</p>
          <h1 className="sign-plate mt-2.5 text-[clamp(1.8rem,4vw,2.7rem)] leading-[1.12] text-lamplight">
            At the Trade Counter
          </h1>
          <p className="measure mt-4 text-[0.95rem] leading-[1.7] text-foreground/75">
            Tell us roughly what you are bringing in and how you would like paying. We will look at
            everything in person, say honestly what it is worth, and pay in cash or credit against
            anything in the shop.
          </p>
        </section>

        {submitted ? (
          <section className="mx-auto max-w-[1800px] px-6 pb-16 sm:px-8">
            <div
              className="rounded-sm bg-timber-deep/70 p-7 sm:p-9"
              style={{ boxShadow: "var(--shadow-case)" }}
            >
              <p className="pixel-label text-brass/70">Bell rung</p>
              <h2 className="sign-plate mt-3 text-[1.5rem] leading-[1.2] text-lamplight">
                We have your list
              </h2>
              <p className="measure mt-4 text-[0.9rem] leading-[1.7] text-foreground/75">
                {submitted.items} {submitted.items === 1 ? "line" : "lines"} noted under reference{" "}
                <span className="text-brass">{submitted.reference}</span>. Bring the items and that
                reference to 73 Talbot Street and we will have someone on the counter for you.
              </p>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                <button
                  type="button"
                  onClick={() => setSubmitted(null)}
                  className="shop-meta text-brass/70 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight"
                >
                  Add something else &rarr;
                </button>
                <Link
                  to="/"
                  className="shop-meta text-brass/70 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight"
                >
                  Back to the shop &rarr;
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="mx-auto max-w-[1800px] px-6 pb-16 sm:px-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!canSubmit) return;
                setSubmitted({
                  reference: `BM-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
                  items: filled.length,
                });
              }}
              className="rounded-sm bg-timber-deep/60 p-6 sm:p-8"
              style={{ boxShadow: "var(--shadow-plate)" }}
            >
              <h2 className="sign-plate text-[1.2rem] leading-[1.2] text-lamplight/90">
                What are you bringing in?
              </h2>

              <ul className="mt-6 space-y-4">
                {lines.map((line) => (
                  <li key={line.id} className="grid gap-3 sm:grid-cols-[10rem_1fr_5rem_auto]">
                    <label className="min-w-0">
                      <span className="sr-only">Type</span>
                      <select
                        value={line.kind}
                        onChange={(e) => update(line.id, { kind: e.target.value })}
                        className="w-full rounded-sm bg-ink/60 px-3 py-3 text-sm text-foreground focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-brass/60"
                      >
                        {KINDS.map((kind) => (
                          <option key={kind} value={kind}>
                            {kind}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="min-w-0">
                      <span className="sr-only">Details</span>
                      <input
                        value={line.detail}
                        onChange={(e) => update(line.id, { detail: e.target.value })}
                        placeholder="Titles, platform, condition — whatever you know"
                        className="w-full rounded-sm bg-ink/60 px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-brass/60"
                      />
                    </label>
                    <label className="min-w-0">
                      <span className="sr-only">How many</span>
                      <input
                        inputMode="numeric"
                        value={line.quantity}
                        onChange={(e) => update(line.id, { quantity: e.target.value })}
                        className="w-full rounded-sm bg-ink/60 px-3 py-3 text-sm text-foreground focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-brass/60"
                      />
                    </label>
                    <button
                      type="button"
                      aria-label="Remove line"
                      onClick={() => setLines((prev) => prev.filter((l) => l.id !== line.id))}
                      disabled={lines.length === 1}
                      className="self-center rounded-sm p-2.5 text-brass/60 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() =>
                  setLines((prev) => [
                    ...prev,
                    { id: nextId++, kind: KINDS[0], detail: "", quantity: "1" },
                  ])
                }
                className="shop-meta mt-5 inline-flex items-center gap-2 text-brass/70 transition-colors duration-200 ease-[var(--ease-brass)] hover:text-lamplight"
              >
                <Plus className="h-3.5 w-3.5" />
                Another lot
              </button>

              <div className="mt-9 grid gap-6 md:grid-cols-2">
                <fieldset>
                  <legend className="pixel-label text-brass/65">How would you like paying?</legend>
                  <div className="mt-3 flex gap-2">
                    {(["Shop credit", "Cash"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={payment === option}
                        onClick={() => setPayment(option)}
                        className={`shop-meta rounded-sm px-4 py-2.5 transition-colors duration-200 ease-[var(--ease-brass)] ${
                          payment === option
                            ? "bg-timber/85 text-lamplight"
                            : "bg-ink/60 text-brass/70 hover:text-lamplight"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-[0.8rem] leading-[1.6] text-muted-foreground/85">
                    Credit is worth more than cash on almost everything.
                  </p>
                </fieldset>

                <div className="grid gap-3">
                  <label className="min-w-0">
                    <span className="pixel-label text-brass/65">Your name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2 w-full rounded-sm bg-ink/60 px-3 py-3 text-sm text-foreground focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-brass/60"
                    />
                  </label>
                  <label className="min-w-0">
                    <span className="pixel-label text-brass/65">Email or phone</span>
                    <input
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="mt-2 w-full rounded-sm bg-ink/60 px-3 py-3 text-sm text-foreground focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-brass/60"
                    />
                  </label>
                  <label className="min-w-0">
                    <span className="pixel-label text-brass/65">When are you calling in?</span>
                    <input
                      value={when}
                      onChange={(e) => setWhen(e.target.value)}
                      placeholder="Saturday afternoon, sometime this week…"
                      className="mt-2 w-full rounded-sm bg-ink/60 px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-brass/60"
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="group mt-9 inline-flex items-center gap-3 rounded-sm bg-timber/80 px-7 py-4 text-sm tracking-[0.16em] text-lamplight uppercase transition-[box-shadow,transform,background-color,opacity] duration-200 ease-[var(--ease-brass)] hover:bg-timber active:translate-y-px disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
                style={{ boxShadow: "var(--shadow-counter)" }}
              >
                <Bell className="h-4 w-4 text-brass transition-transform duration-200 ease-[var(--ease-brass)] group-hover:rotate-[9deg]" />
                Ring the bell
              </button>
              {!canSubmit ? (
                <p className="mt-4 text-[0.8rem] leading-[1.6] text-muted-foreground/80">
                  Add at least one lot, your name and a way to reach you.
                </p>
              ) : null}
            </form>
          </section>
        )}

        <TradeCounter />
      </main>
    </div>
  );
}