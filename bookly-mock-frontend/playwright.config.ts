import { defineConfig, devices } from "@playwright/test";

const PLAYWRIGHT_DATA_MODE = process.env.PLAYWRIGHT_DATA_MODE || "mock";
const PLAYWRIGHT_USE_DIRECT_SERVICES =
  process.env.PLAYWRIGHT_USE_DIRECT_SERVICES || "false";
const PLAYWRIGHT_BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4201";

/**
 * Playwright E2E Test Configuration for Bookly Frontend
 *
 * Runs against the dev server (mock mode) by default.
 * Use PLAYWRIGHT_BASE_URL env var to test against other environments.
 *
 * Projects:
 *   - smoke:      P0 tests (<10 min), PR gate
 *   - regression: P1 tests (nightly, ~30 min)
 *   - visual:     P2 screenshot comparison (nightly)
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [
        ["html", { open: "never" }],
        ["json", { outputFile: "e2e-results.json" }],
        ["github"],
      ]
    : [
        ["html", { open: "never" }],
        ["json", { outputFile: "e2e-results.json" }],
        ["list"],
      ],
  use: {
    baseURL: PLAYWRIGHT_BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    locale: "es-CO",
    timezoneId: "America/Bogota",
  },
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  projects: [
    {
      name: "smoke",
      testDir: "./e2e/smoke",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "regression",
      testDir: "./e2e/regression",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "visual",
      testDir: "./e2e/visual",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npx next dev -p 4201",
    url: PLAYWRIGHT_BASE_URL,
    // Important: avoid reusing a manually started server that could be in serve mode.
    // We need deterministic E2E runs in mock mode.
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_DATA_MODE: PLAYWRIGHT_DATA_MODE,
      NEXT_PUBLIC_USE_DIRECT_SERVICES: PLAYWRIGHT_USE_DIRECT_SERVICES,
    },
  },
});
