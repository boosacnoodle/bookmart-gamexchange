import { createFileRoute } from "@tanstack/react-router";

import { Empty } from "@/components/staff/StaffKit";
import { StaffShell } from "@/components/staff/StaffShell";
import { getBackofficeStatus } from "@/lib/backoffice.server";

export const Route = createFileRoute("/staff/settings")({
  loader: () => getBackofficeStatus(),
  head: () => ({
    meta: [
      { title: "Setup status — Bookmart back office" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StaffSettings,
});

function StaffSettings() {
  const status = Route.useLoaderData();
  return (
    <StaffShell
      step="Setup"
      title="What is connected"
      intro="A plain status check. Secret keys and passwords are never shown here."
      back={{ to: "/staff/today", label: "Today" }}
    >
      <div className="space-y-2">
        <Status
          label="Barcode intake"
          good={status.barcodeEnabled}
          detail="Phone camera and manual entry"
        />
        <Status
          label="Book lookup"
          good={status.metadata.available}
          detail={status.metadata.priority.join(" → ")}
        />
        <Status
          label="Photo identification"
          good={status.aiPhotoEnabled}
          detail={
            status.aiPhotoEnabled
              ? "Gemini (free) enabled; staff must still confirm every field"
              : "Disabled until a Google AI Studio key is configured"
          }
        />
        <Status label="OCR" good={status.ocrEnabled} detail="Disabled" />
        <Status
          label="Payments"
          good={status.stripe.configured && status.stripe.webhookConfigured}
          detail={
            status.stripe.mode === "test-adapter"
              ? "Local test checkout"
              : status.stripe.configured
                ? "Stripe configured"
                : "Stripe details still required"
          }
        />
        <Status
          label="Order email"
          good={status.email.configured}
          detail={
            status.email.configured
              ? `${status.email.provider} configured`
              : "Email provider details still required"
          }
        />
      </div>
      <p className="mt-5 rounded-sm border border-brass/10 p-4 text-sm leading-6 text-foreground/55">
        {status.cameraRequirement}
      </p>
      <section className="mt-8">
        <h2 className="shop-meta text-brass/55">Recent intake errors</h2>
        <div className="mt-3 space-y-2">
          {status.recentErrors.length === 0 ? (
            <Empty>No recent intake errors.</Empty>
          ) : (
            status.recentErrors.map((item) => (
              <div key={item.id} className="rounded-sm bg-timber-deep/45 p-4">
                <p className="text-sm text-lamplight/85">{item.message}</p>
                <p className="shop-meta mt-2 text-foreground/35">
                  {item.barcode || "No barcode"} ·{" "}
                  {new Date(item.updatedAt).toLocaleString("en-IE")}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </StaffShell>
  );
}

function Status({ label, good, detail }: { label: string; good: boolean; detail: string }) {
  return (
    <div
      className="flex min-h-16 items-center gap-4 rounded-sm bg-timber-deep/45 px-4 py-3"
      style={{ boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--brass) 14%, transparent)" }}
    >
      <span
        aria-hidden="true"
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${good ? "bg-emerald-400" : "bg-brass/45"}`}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-lamplight/90">{label}</span>
        <span className="mt-1 block text-sm leading-5 text-foreground/50">{detail}</span>
      </span>
      <span className="shop-meta text-brass/55">{good ? "Ready" : "Needs setup"}</span>
    </div>
  );
}
