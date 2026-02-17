import { expect, test } from "@playwright/test";

/**
 * E2E Tests: Reports Pages
 * Tests navigation to report pages and basic rendering.
 */

test.describe("Reports Pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/es/login");
    await page.fill(
      "input[type='email'], input[name='email']",
      "admin@ufps.edu.co",
    );
    await page.fill("input[type='password']", "admin123");
    await page.click("button[type='submit']");
    await page.waitForURL(/dashboard/, { timeout: 10000 });
  });

  test("should display reports dashboard", async ({ page }) => {
    await page.goto("/es/reportes");
    await expect(
      page.locator("h1, h2").filter({ hasText: /reportes/i }),
    ).toBeVisible();
  });

  test("should display unsatisfied demand report", async ({ page }) => {
    await page.goto("/es/reportes/demanda-insatisfecha");
    await expect(page.locator("text=/demanda insatisfecha/i")).toBeVisible();
  });

  test("should display compliance report", async ({ page }) => {
    await page.goto("/es/reportes/cumplimiento");
    await expect(page.locator("text=/cumplimiento/i")).toBeVisible();
  });

  test("should display conflicts report", async ({ page }) => {
    await page.goto("/es/reportes/conflictos");
    await expect(page.locator("text=/conflictos/i")).toBeVisible();
  });
});
