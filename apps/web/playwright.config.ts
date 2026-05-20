import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,      // sequential — tests share DB state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL:     process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace:       "on-first-retry",
    screenshot:  "only-on-failure",
    // Speed up interactions — lower timeouts for local dev
    actionTimeout:     10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    {
      name:  "chromium",
      use:   { ...devices["Desktop Chrome"] },
    },
  ],

  // Start the dev server automatically when running E2E locally
  webServer: {
    command: "npm run dev",
    url:     "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
