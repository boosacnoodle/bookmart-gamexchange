import { expect, test } from "@playwright/test";

test("homepage navigation reaches core public pages", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1#home-title")).toContainText("Bookmart & Game Exchange");
  await page.getByRole("link", { name: "Books", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Books" })).toBeVisible();
  await page.goto("/");
  await page.getByLabel("Search products").fill("rare books");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByRole("heading", { name: /Search the shop/i })).toBeVisible();
});

test("immersive storefront controls are real links and form controls", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("dialog", { name: "Shop menu" })).toBeVisible();
  await page.getByRole("button", { name: "Close menu" }).click();
  await expect(page.getByRole("dialog", { name: "Shop menu" })).toBeHidden();

  await page.getByLabel("Search products").fill("dublin");
  await page.getByLabel("Search products").press("Enter");
  await expect(page).toHaveURL(/\/search\?q=dublin/);
  await expect(page.getByRole("heading", { name: /Search the shop/i })).toBeVisible();

  await page.goto("/");
  const departmentChecks: Array<[RegExp, RegExp]> = [
    [/^Books$/i, /\/books$/],
    [/^Rare Books$/i, /\/rare-(and-)?collectible$/],
    [/^Retro Games$/i, /\/video-games$/],
    [/^Nintendo$/i, /\/search\?platform=nintendo/],
    [/^PlayStation$/i, /\/search\?platform=playstation/],
    [/^Xbox$/i, /\/search\?platform=xbox/],
    [/^Films & Music$/i, /\/music(-and)?-film$/],
    [/^More$/i, /\/collections$/]
  ];

  for (const [name, url] of departmentChecks) {
    await page.goto("/");
    await page.getByRole("link", { name }).first().click();
    await expect(page).toHaveURL(url);
  }

  await page.goto("/");
  await page.getByRole("link", { name: "Account" }).click();
  await expect(page).toHaveURL(/\/account\/login/);
  await page.goto("/");
  await page.getByRole("link", { name: "Basket" }).click();
  await expect(page).toHaveURL(/\/basket/);
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("link", { name: "Sell / Trade" }).click();
  await expect(page).toHaveURL(/\/sell-or-trade/);
  await page.goto("/");
  await page.getByRole("link", { name: /Visit Our Shop/i }).last().click();
  await expect(page).toHaveURL(/\/visit-us/);
});

test("storefront reduced motion and mobile layout remain accessible", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 568 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
  await expect(page.locator("h1#home-title")).toContainText("Bookmart & Game Exchange");
  await expect(page.getByRole("link", { name: "Books", exact: true })).toBeVisible();
  await context.close();
});

test("storefront remains responsive in mobile landscape and desktop", async ({ browser }) => {
  for (const viewport of [
    { width: 844, height: 390 },
    { width: 1440, height: 900 }
  ]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(page.locator("h1#home-title")).toContainText("Bookmart & Game Exchange");
    await expect(page.getByRole("search")).toBeVisible();
    await expect(page.getByRole("link", { name: "Xbox", exact: true })).toBeVisible();
    await context.close();
  }
});

test("product page can add an item to basket", async ({ page }) => {
  await page.goto("/products/dublin-docklands-history-annotated-paperback");
  await page.getByRole("button", { name: /Add to basket/i }).click();
  await expect(page.getByText(/Added to basket/i)).toBeVisible();
  await page.goto("/basket");
  await expect(page.getByText(/Dublin Docklands History/i)).toBeVisible();
});

test("staff login opens the protected staff dashboard", async ({ page }) => {
  await page.goto("/staff");
  await expect(page).toHaveURL(/\/account\/login/);
  await page.getByLabel("Email").fill("staff@bookmart.demo");
  await page.getByLabel("Password").fill("Staff123!");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("heading", { name: "Staff dashboard" })).toBeVisible();
  await page.getByRole("link", { name: "Inventory" }).click();
  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();
});

test("admin login opens admin settings and audit pages", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/account\/login/);
  await page.getByLabel("Email").fill("admin@bookmart.demo");
  await page.getByLabel("Password").fill("Admin123!");
  await Promise.all([
    page.waitForURL(/\/admin$/),
    page.getByRole("button", { name: "Login" }).click()
  ]);
  await expect(page.getByRole("heading", { name: "Admin dashboard" })).toBeVisible();
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Business settings" })).toBeVisible();
  await page.getByRole("link", { name: "Audit logs" }).click();
  await expect(page.getByRole("heading", { name: "Audit logs" })).toBeVisible();
});

test("customer cannot access staff intake but staff can", async ({ page }) => {
  await page.goto("/staff/intake");
  await expect(page).toHaveURL(/\/account\/login/);
  await page.getByLabel("Email").fill("customer@bookmart.demo");
  await page.getByLabel("Password").fill("Customer123!");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/account$/);
  await page.goto("/staff/intake");
  await expect(page).toHaveURL(/\/account\/unauthorized/);

  await page.goto("/account/login");
  await page.getByLabel("Email").fill("staff@bookmart.demo");
  await page.getByLabel("Password").fill("Staff123!");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/staff$/);
  await page.goto("/staff/intake");
  await expect(page.getByRole("heading", { name: "Rapid barcode intake" })).toBeVisible();
});

test("barcode intake publishes a public listing without OpenAI", async ({ page }) => {
  await page.goto("/account/login");
  await page.getByLabel("Email").fill("staff@bookmart.demo");
  await page.getByLabel("Password").fill("Staff123!");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/staff$/);
  await page.goto("/staff/intake");
  await expect(page.getByText(/AI photo identification is not currently configured/i)).toBeVisible();
  await page.getByLabel("Manual barcode entry").fill("071171200131");
  await page.getByRole("button", { name: /Look up metadata/i }).click();
  await expect(page.getByRole("heading", { name: "Candidate identity" })).toBeVisible();
  await page.getByRole("button", { name: /Gran Turismo 4/i }).click();
  await page.getByLabel("Selling price").fill("14.95");
  await page.getByLabel("Shelf location").fill("Games / Rapid intake");
  await page.getByLabel("Condition report").fill("Disc-only test listing with light visible handling marks.");
  await page.getByLabel("Included components").fill("Disc");
  await page.getByLabel("Missing components").fill("Original case, manual");
  await page.getByRole("button", { name: /Publish listing/i }).click();
  await expect(page.getByRole("heading", { name: /Listing published|Draft created/i })).toBeVisible();
  await expect(page.getByText(/BMGX-/)).toBeVisible();
  await page.getByRole("link", { name: "View live listing" }).click();
  await expect(page.locator("h1").filter({ hasText: "Gran Turismo 4" })).toBeVisible();
  await expect(page.locator(".price").filter({ hasText: "€14.95" })).toBeVisible();
});

test("checkout remains usable and honest when Stripe is disabled", async ({ page }) => {
  await page.goto("/products/dublin-docklands-history-annotated-paperback");
  await page.getByRole("button", { name: /Add to basket/i }).click();
  await expect(page.getByText(/Added to basket/i)).toBeVisible();
  await page.goto("/basket");
  await expect(page.getByRole("heading", { name: "Order summary" })).toBeVisible();
  await page.getByRole("link", { name: /Continue to secure checkout/i }).click();
  await expect(page.getByRole("heading", { name: "Secure checkout" })).toBeVisible();
  await expect(page.getByText(/Payment configuration is required/i)).toBeVisible();
  await page.getByLabel("Customer email").fill("guest@example.com");
  await page.getByLabel("Customer name").fill("Guest Customer");
  await page.getByRole("button", { name: /Continue to Stripe Checkout/i }).click();
  await expect(page.getByRole("status")).toContainText(/Payment configuration is required/i);
});
