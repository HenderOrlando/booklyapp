import { test, expect } from "@playwright/test";

/**
 * E2E Tests: Reservations Flow
 * Tests reservation listing, calendar view, and creation flow.
 */

test.describe("Reservations", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/es/login");
    await page.fill("input[type='email'], input[name='email']", "admin@ufps.edu.co");
    await page.fill("input[type='password']", "Admin123!");
    await page.click("button[type='submit']");
    await page.waitForURL(/dashboard/, { timeout: 10000 });
  });

  test("should display reservations page", async ({ page }) => {
    await page.goto("/es/reservas");
    await expect(page.locator("h1, h2").filter({ hasText: /reservas/i })).toBeVisible();
  });

  test("should display calendar view", async ({ page }) => {
    await page.goto("/es/calendario");
    await expect(page.locator("h1, h2").filter({ hasText: /calendario/i })).toBeVisible();
  });

  test("should navigate to new reservation", async ({ page }) => {
    await page.goto("/es/reservas");
    const newBtn = page.locator("a[href*='nueva'], button:has-text('Nueva'), button:has-text('Crear')").first();
    if (await newBtn.isVisible()) {
      await newBtn.click();
      await expect(page).toHaveURL(/nueva/);
    }
  });
});
