import { test, expect } from "@playwright/test";

/**
 * E2E Tests: Admin Pages
 * Tests navigation to admin pages and basic rendering.
 */

test.describe("Admin Pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/es/login");
    await page.fill("input[type='email'], input[name='email']", "admin@ufps.edu.co");
    await page.fill("input[type='password']", "Admin123!");
    await page.click("button[type='submit']");
    await page.waitForURL(/dashboard/, { timeout: 10000 });
  });

  test("should display audit page with CSV export", async ({ page }) => {
    await page.goto("/es/admin/auditoria");
    await expect(page.locator("text=/auditoría/i")).toBeVisible();
    await expect(page.locator("text=/exportar csv/i")).toBeVisible();
  });

  test("should display roles page", async ({ page }) => {
    await page.goto("/es/admin/roles");
    await expect(page.locator("h1, h2").filter({ hasText: /roles/i })).toBeVisible();
  });

  test("should display approval flows page", async ({ page }) => {
    await page.goto("/es/admin/flujos-aprobacion");
    await expect(page.locator("text=/flujos de aprobación/i")).toBeVisible();
  });

  test("should display integrations page", async ({ page }) => {
    await page.goto("/es/admin/integraciones");
    await expect(page.locator("text=/integraciones/i")).toBeVisible();
  });

  test("should display evaluations page", async ({ page }) => {
    await page.goto("/es/admin/evaluaciones");
    await expect(page.locator("text=/evaluaciones/i")).toBeVisible();
  });
});
