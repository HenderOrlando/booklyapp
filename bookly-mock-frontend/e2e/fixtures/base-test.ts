/**
 * Base test fixture for Bookly E2E tests.
 *
 * Mocks the public config API to prevent hanging requests
 * during SSR and page transitions in E2E (no real backend).
 * All smoke specs should import { test, expect } from this file.
 */
import { test as base } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route("**/api/v1/config/public", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            themeMode: "system",
            primaryColor: "#2563eb",
            secondaryColor: "#14b8a6",
          },
        }),
      });
    });
    await use(page);
  },
});

export { expect } from "@playwright/test";
