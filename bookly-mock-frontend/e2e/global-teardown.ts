/**
 * Global Teardown — Playwright
 *
 * Cleanup after all tests complete.
 * Currently minimal — expand for serve mode data cleanup.
 */

import type { FullConfig } from "@playwright/test";

async function globalTeardown(_config: FullConfig) {
  console.log("🧹 E2E global teardown complete");
}

export default globalTeardown;
