import { expect, test } from "@playwright/test";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/staff");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Your name").fill(process.env.E2E_OWNER_NAME!);
  await page.getByLabel("Shop code").fill(process.env.E2E_OWNER_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/staff\/today/);
}

test("storefront navigation and contact actions work", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveTitle(/Bookmart/i);
  await expect(page.getByRole("link", { name: "Admin login" })).toBeVisible();

  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);

  await page.getByRole("link", { name: /Games:/ }).click();
  await expect(page).toHaveURL(/\/arcade/);
  await expect(page.getByRole("heading", { name: "Games" })).toBeVisible();

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("link", { name: "Admin login" }).click();
  await expect(page).toHaveURL(/\/staff/);
  await expect(page.getByRole("heading", { name: /Sign in behind the counter/i })).toBeVisible();
});

test("search returns the approved catalogue experience", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const search = page.getByRole("searchbox");
  await search.fill("book");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/search/);
  await expect(page.getByText(/Search/i).first()).toBeVisible();
});

test("staff authentication reaches the intake dashboard", async ({ page }) => {
  test.skip(
    !process.env.E2E_OWNER_NAME || !process.env.E2E_OWNER_PASSWORD,
    "Owner test credentials are not configured.",
  );
  await signIn(page);
  await expect(page.getByRole("link", { name: /Scan and list item/i })).toBeVisible();
});

test("owner can publish, find, label and sell one live item", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  test.skip(testInfo.project.name !== "desktop", "Creates one deterministic acceptance listing.");
  test.skip(
    !process.env.E2E_OWNER_NAME || !process.env.E2E_OWNER_PASSWORD,
    "Owner test credentials are not configured.",
  );

  const title = `Acceptance Book ${Date.now()}`;
  await signIn(page);
  await page.goto("/staff/add");
  await page.getByRole("button", { name: /A book/i }).click();
  await expect(page).toHaveURL(/\/staff\/add\/scan/);
  await page.getByRole("button", { name: /No barcode — take photos/i }).click();
  await expect(page).toHaveURL(/\/staff\/add\/photos/);
  await page.getByRole("button", { name: "Skip photos for now" }).click();
  await expect(page).toHaveURL(/\/staff\/add\/details/);
  await page.getByLabel("What is it called?").fill(title);
  await page.getByLabel("Who made it?").fill("Bookmart Acceptance Test");
  await page.getByLabel("What year?").fill("2026");
  await page.getByLabel("Anything else worth saying?").fill("Test paperback");
  await page.getByRole("button", { name: /Yes, that’s right/i }).click();
  await expect(page).toHaveURL(/\/staff\/add\/confirm/);
  await page.getByLabel("How much?").fill("9.50");
  await page.getByRole("button", { name: "Non-fiction", exact: true }).click();
  await page.getByRole("button", { name: "Fiction", exact: true }).click();
  await page.getByRole("button", { name: "Publish item" }).click();

  await expect(page).toHaveURL(/\/staff\/add\/done/);
  await expect(page.getByText(title)).toBeVisible();
  const livePath = await page.getByRole("link", { name: "View live listing" }).getAttribute("href");
  expect(livePath).toMatch(/^\/library\//);
  await page.getByRole("link", { name: "View live listing" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByRole("button", { name: "Place on the counter" })).toBeEnabled();

  await page.goto(`/search?q=${encodeURIComponent(title)}`);
  await expect(page.getByRole("link", { name: title, exact: true })).toBeVisible();
  await page.goto("/library");
  await expect(page.getByRole("link", { name: title, exact: true })).toBeVisible();
  await page.goto("/staff/stock");
  await expect(page.getByText(title).first()).toBeVisible();
  await page.goto("/staff/add/done");
  await page.getByRole("link", { name: /View \/ print QR label/i }).click();
  await expect(page.getByRole("img", { name: /QR code/i })).toBeVisible();

  await page.goto(livePath!);
  await page.getByRole("button", { name: "Place on the counter" }).click();
  await page.goto("/basket");
  await expect(page.getByText(title).first()).toBeVisible();
  await page.getByRole("link", { name: "Secure checkout" }).click();
  await page.getByLabel("Your name").fill("Acceptance Customer");
  await page.getByLabel("Email").fill("acceptance@example.test");
  await page.getByRole("button", { name: "Continue to secure payment" }).click();
  await expect(page).toHaveURL(/\/order-confirmation/);
  await expect(page.getByText(/Payment confirmed/i)).toBeVisible();
  await expect(page.getByText(title).first()).toBeVisible();
});
