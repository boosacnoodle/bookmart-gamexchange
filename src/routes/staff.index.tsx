import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { BigButton, Field, inputClass, inputShadow } from "@/components/staff/StaffKit";
import { StaffShell } from "@/components/staff/StaffShell";
import { signIn, useStaff } from "@/lib/staff";

export const Route = createFileRoute("/staff/")({
  head: () => ({
    meta: [
      { title: "Staff sign in — Bookmart & GameXchange" },
      { name: "description", content: "Sign in to the Bookmart & GameXchange back office." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Staff sign in — Bookmart & GameXchange" },
      { property: "og:description", content: "Back office for the shop." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StaffSignIn,
});

function StaffSignIn() {
  const staff = useStaff();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [problem, setProblem] = useState("");

  useEffect(() => {
    if (staff) navigate({ to: "/staff/today", replace: true });
  }, [staff, navigate]);

  return (
    <StaffShell
      title="Sign in behind the counter"
      intro="Only shop staff use this part. Your name goes on anything you add, so we know who priced it."
    >
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim().length < 2) {
            setProblem("Put your name in first.");
            return;
          }
          if (pin.trim().length < 4) {
            setProblem("The shop code is four numbers.");
            return;
          }
          setProblem("");
          signIn(name.trim());
          navigate({ to: "/staff/today" });
        }}
      >
        <Field label="Your name">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            placeholder="Deirdre"
            className={inputClass}
            style={inputShadow}
          />
        </Field>

        <Field label="Shop code" hint="The four numbers taped inside the till drawer.">
          <input
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            autoComplete="off"
            placeholder="••••"
            className={`${inputClass} tracking-[0.4em]`}
            style={inputShadow}
          />
        </Field>

        <p aria-live="polite" className="min-h-[1.2em] text-[0.86rem] text-lamplight/70">
          {problem}
        </p>

        <BigButton type="submit">Sign in</BigButton>

        <p className="text-[0.82rem] leading-[1.6] text-foreground/40">
          Forgotten the code? Ask whoever opened up this morning.
        </p>
      </form>
    </StaffShell>
  );
}