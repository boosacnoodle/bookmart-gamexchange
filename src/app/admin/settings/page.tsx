import { saveSetting } from "@/app/management-actions";
import { db } from "@/lib/db";
import { emailRuntimeStatus, stripeRuntimeStatus } from "@/lib/payments/config";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await db.siteSetting.findMany({ orderBy: [{ group: "asc" }, { label: "asc" }] });
  const stripeStatus = stripeRuntimeStatus();
  const emailStatus = emailRuntimeStatus();
  const lastWebhook = await db.stripeWebhookEvent.findFirst({ orderBy: { processedAt: "desc" } });
  const recentPaymentFailures = await db.order.count({ where: { paymentStatus: "FAILED" } });
  const recentEmailFailures = await db.emailEvent.count({ where: { status: "FAILED" } });
  const recentIntakeErrors = await db.intakeSession.findMany({
    where: { OR: [{ status: "NO_MATCH" }, { errorMessage: { not: null } }] },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: { barcode: true, barcodeType: true, status: true, errorMessage: true, updatedAt: true }
  });
  const providerPriority = process.env.METADATA_PROVIDER_PRIORITY ?? (process.env.NODE_ENV === "production" ? "openlibrary" : "openlibrary,demo");
  return (
    <>
      <div className="management-head"><h1>Business settings</h1></div>
      <div className="management-card">
        <strong>Feature status</strong>
        <p>Barcode intake: {process.env.BARCODE_INTAKE_ENABLED === "false" ? "disabled" : "enabled"} / OCR fallback: {process.env.OCR_FALLBACK_ENABLED === "true" ? "enabled" : "disabled"} / AI photo identification: {process.env.AI_PHOTO_IDENTIFICATION_ENABLED === "true" && process.env.OPENAI_API_KEY ? "configured" : "not configured"}</p>
        <p>Stripe: {stripeStatus.mode} / webhook {stripeStatus.webhookConfigured ? "configured" : "missing"} / Email: {emailStatus.configured ? "enabled" : "disabled"}</p>
        <p>Last webhook: {lastWebhook ? `${lastWebhook.type} at ${lastWebhook.processedAt.toISOString()}` : "none"} / Payment failures: {recentPaymentFailures} / Email failures: {recentEmailFailures}</p>
        <p>API keys are never displayed in the browser.</p>
      </div>
      <div className="management-card">
        <strong>Staff intake status</strong>
        <p>Barcode intake enabled: {process.env.BARCODE_INTAKE_ENABLED === "false" ? "No" : "Yes"}</p>
        <p>Metadata providers: {providerPriority}. Open Library is used for ISBN book metadata. Demo metadata is local/test only unless explicitly configured outside production.</p>
        <p>Camera requirements: HTTPS is required on real phones. Localhost can be used for development. Android Chrome and iPhone Safari can fall back to manual barcode entry if camera permission is denied.</p>
        <p>OCR disabled: {process.env.OCR_FALLBACK_ENABLED === "true" ? "No" : "Yes"} / AI photo identification disabled: {process.env.AI_PHOTO_IDENTIFICATION_ENABLED === "true" && process.env.OPENAI_API_KEY ? "No" : "Yes"}</p>
        <p>Recent intake errors: {recentIntakeErrors.length ? "" : "none"}</p>
        {recentIntakeErrors.map((item) => (
          <p className="product-meta" key={`${item.barcode}-${item.updatedAt.toISOString()}`}>
            {item.updatedAt.toISOString()} / {item.barcodeType ?? "unknown"} / {item.barcode ?? "no barcode"} / {item.errorMessage ?? item.status}
          </p>
        ))}
      </div>
      <div className="data-table">
        {settings.map((setting) => (
          <form action={saveSetting} className="data-row" key={setting.key}>
            <input type="hidden" name="key" value={setting.key} />
            <div><strong>{setting.group}: {setting.label}</strong><input name="value" defaultValue={setting.value} /></div>
            <button className="button button-secondary" type="submit">Save</button>
          </form>
        ))}
      </div>
    </>
  );
}
