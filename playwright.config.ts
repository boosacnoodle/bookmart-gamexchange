import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3137",
    trace: "on-first-retry"
  },
  webServer: {
    command: "DATABASE_URL='postgresql://bookmart@127.0.0.1:5432/bookmart_gamexchange' npm run dev -- --hostname 127.0.0.1 --port 3137",
    url: "http://127.0.0.1:3137",
    reuseExistingServer: false,
    timeout: 120_000
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"], browserName: "chromium" } }
  ]
});
