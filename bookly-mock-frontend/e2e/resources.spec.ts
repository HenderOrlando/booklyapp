import { expect, test } from "@playwright/test";

/**
 * E2E Tests: Resources Management
 * Tests resource listing, creation, and detail view.
 */

test.describe("Resources", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/es/login");
    await page.fill(
      "input[type='email'], input[name='email']",
      "admin@ufps.edu.co",
    );
    await page.fill("input[type='password']", "admin123");
    await page.click("button[type='submit']");
    await page.waitForURL(/dashboard/, { timeout: 10000 });
  });

  test("should display resources list", async ({ page }) => {
    await page.goto("/es/recursos");
    await expect(
      page.locator("h1, h2").filter({ hasText: /recursos/i }),
    ).toBeVisible();
  });

  test("should navigate to resource detail", async ({ page }) => {
    await page.goto("/es/recursos");
    const firstResource = page
      .locator("[data-testid='resource-card'], table tbody tr, [class*='card']")
      .first();
    if (await firstResource.isVisible()) {
      await firstResource.click();
      await page.waitForURL(/recursos\//, { timeout: 5000 });
    }
  });

  test("should navigate to create resource page", async ({ page }) => {
    await page.goto("/es/recursos");
    const createBtn = page
      .locator(
        "a[href*='nuevo'], button:has-text('Crear'), button:has-text('Nuevo')",
      )
      .first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await expect(page).toHaveURL(/nuevo/);
    }
  });
});
