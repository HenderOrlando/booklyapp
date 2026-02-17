import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E Test Configuration for Bookly Frontend
 *
 * Runs against the dev server (mock mode) by default.
 * Use PLAYWRIGHT_BASE_URL env var to test against other environments.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4200",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:4200",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
