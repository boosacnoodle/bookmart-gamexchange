import { describe, expect, it } from "vitest";

import { previewGate } from "./preview-gate.server";

const previewConfig = { mode: "preview", password: "correct-horse-battery-staple" };

function basicAuth(password: string): string {
  return `Basic ${Buffer.from(`preview:${password}`).toString("base64")}`;
}

describe("previewGate", () => {
  it("does not block the site in live mode", async () => {
    await expect(
      previewGate(new Request("https://gameexchange.ie/"), { mode: "live" }),
    ).resolves.toBeNull();
  });

  it("fails closed when preview mode has no configured password", async () => {
    const response = await previewGate(new Request("https://gameexchange.ie/"), {
      mode: "preview",
    });

    expect(response?.status).toBe(503);
  });

  it("challenges a preview visitor without the password", async () => {
    const response = await previewGate(new Request("https://gameexchange.ie/"), previewConfig);

    expect(response?.status).toBe(401);
    expect(response?.headers.get("www-authenticate")).toContain("Basic");
  });

  it("allows a preview visitor with the configured password", async () => {
    const response = await previewGate(
      new Request("https://gameexchange.ie/", {
        headers: { authorization: basicAuth(previewConfig.password) },
      }),
      previewConfig,
    );

    expect(response).toBeNull();
  });
});
