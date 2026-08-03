import "server-only";

export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function stripeRuntimeStatus() {
  const testAdapter = process.env.STRIPE_TEST_ADAPTER === "true";
  const enabled = process.env.STRIPE_ENABLED === "true";
  const hasSecret = Boolean(process.env.STRIPE_SECRET_KEY);
  const hasWebhook = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
  return {
    enabled,
    testAdapter,
    configured: testAdapter || (enabled && hasSecret),
    webhookConfigured: testAdapter || hasWebhook,
    mode: testAdapter ? "test-adapter" : enabled && hasSecret ? "stripe" : "disabled"
  };
}

export function emailRuntimeStatus() {
  const enabled = process.env.EMAIL_ENABLED === "true";
  const provider = process.env.EMAIL_PROVIDER || "disabled";
  const hasFrom = Boolean(process.env.EMAIL_FROM_ADDRESS);
  const hasResend = provider === "resend" ? Boolean(process.env.RESEND_API_KEY) : false;
  return {
    enabled,
    provider,
    configured: enabled && hasFrom && (provider !== "resend" || hasResend)
  };
}
