/**
 * E2E Smoke: Reports
 *
 * Coverage IDs: E2E-RPT-001, E2E-RPT-002, E2E-RPT-007
 * RF: RF-31, RF-33
 * HU: HU-26, HU-28
 */

import { test, expect } from "../fixtures/base-test";
import { authStatePath } from "../fixtures/test-users";

test.describe("Reports Smoke", () => {
  test.use({ storageState: authStatePath("admin") });

  // E2E-RPT-001 | Reports dashboard loads
  test("displays reports dashboard page", async ({ page }) => {
    await page.goto("/es/reportes");
    await expect(
      page.locator("h1, h2").filter({ hasText: /reportes/i })
    ).toBeVisible({ timeout: 10000 });
  });

  // E2E-RPT-002 | Navigate to resource reports
  test("navigates to resources report", async ({ page }) => {
    await page.goto("/es/reportes/recursos");
    await expect(page).toHaveURL(/reportes\/recursos/);
  });

  // E2E-RPT-007 | Export CSV button present
  test("has export functionality available", async ({ page }) => {
    await page.goto("/es/reportes");
    await page.waitForLoadState("networkidle");

    const exportBtn = page.locator("button, a").filter({ hasText: /exportar|csv|descargar/i }).first();
    const isVisible = await exportBtn.isVisible().catch(() => false);

    // Export may not be on the main dashboard — check sub-reports too
    if (!isVisible) {
      await page.goto("/es/reportes/recursos");
      await page.waitForLoadState("networkidle");
      const subExportBtn = page.locator("button, a").filter({ hasText: /exportar|csv|descargar/i }).first();
      await expect(subExportBtn).toBeVisible({ timeout: 5000 });
    }
  });
});
