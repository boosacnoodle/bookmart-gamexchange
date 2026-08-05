import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { signOut, useStaff } from "@/lib/staff";

/**
 * The back office. Same lamplight as the shop, but the walls are plain and
 * everything is within one thumb's reach: this is used standing up, one-handed,
 * with a box of stock in the other arm.
 */
export function StaffShell({
  step,
  title,
  intro,
  back,
  children,
  footer,
}: {
  step?: string | undefined;
  title: string;
  intro?: string | undefined;
  /** Where the back arrow goes. Omitted on the dashboard. */
  back?: { to: string; label: string } | undefined;
  children: ReactNode;
  /** Sticky action area, thumb height. */
  footer?: ReactNode | undefined;
}) {
  const staff = useStaff();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(30rem 22rem at 50% -6%, color-mix(in oklab, var(--lamplight) 9%, transparent), transparent 70%)",
        }}
      />

      <header className="sticky top-0 z-20 border-b border-brass/12 bg-ink/92 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[820px] items-center gap-3 px-4">
          {back ? (
            <Link
              to={back.to}
              className="shop-meta -ml-2 inline-flex min-h-11 items-center gap-2 px-2 text-brass/70 transition-colors hover:text-lamplight"
            >
              <ArrowLeft className="h-4 w-4" />
              {back.label}
            </Link>
          ) : (
            <Link to="/staff/today" className="sign-plate text-[1rem] text-lamplight/90">
              Back office
            </Link>
          )}
          <span className="flex-1" />
          {staff ? (
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate({ to: "/staff", replace: true });
              }}
              className="shop-meta inline-flex min-h-11 items-center px-2 text-foreground/45 transition-colors hover:text-lamplight"
            >
              Sign out
            </button>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-[820px] px-4 pt-7 pb-40 sm:px-6">
        {step ? <p className="pixel-label text-brass/55">{step}</p> : null}
        <h1 className="sign-plate mt-2 text-[clamp(1.5rem,6vw,2rem)] leading-[1.15] text-lamplight">
          {title}
        </h1>
        {intro ? (
          <p className="measure mt-3 text-[0.95rem] leading-[1.65] text-foreground/65">{intro}</p>
        ) : null}
        <div className="mt-7">{children}</div>
      </main>

      {footer ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-brass/14 bg-ink/95 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
          <div className="mx-auto max-w-[820px] space-y-3">{footer}</div>
        </div>
      ) : null}
    </div>
  );
}
