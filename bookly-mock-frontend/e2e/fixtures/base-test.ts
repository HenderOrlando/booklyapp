import { test as base } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    // Mock the config API to avoid the ColorBootstrapSplash loader blocking the UI for ALL tests
    await page.route("**/api/v1/config/public", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            themeMode: "light",
            primaryColor: "#000000",
            secondaryColor: "#ffffff",
          },
        }),
      });
    });

    await use(page);
  },
});

export { expect } from "@playwright/test";
