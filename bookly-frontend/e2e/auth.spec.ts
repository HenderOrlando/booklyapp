import { expect, test } from "@playwright/test";

/**
 * E2E Tests: Authentication Flow
 * Tests login, logout, and session management.
 */

test.describe("Authentication", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/es/login");
    await expect(page).toHaveURL(/login/);
    await expect(
      page.locator("input[type='email'], input[name='email']"),
    ).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
  });

  test("should show validation errors on empty submit", async ({ page }) => {
    await page.goto("/es/login");
    await page.click("button[type='submit']");
    await expect(
      page.locator("text=/requerido|required|obligatorio/i"),
    ).toBeVisible();
  });

  test("should login with valid credentials (mock mode)", async ({ page }) => {
    await page.goto("/es/login");
    await page.fill(
      "input[type='email'], input[name='email']",
      "admin@ufps.edu.co",
    );
    await page.fill("input[type='password']", "admin123");
    await page.click("button[type='submit']");
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test("should redirect unauthenticated user to login", async ({ page }) => {
    await page.goto("/es/dashboard");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/es/login");
    const registerLink = page.locator("a[href*='register']");
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/register/);
    }
  });
});
