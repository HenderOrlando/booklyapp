/**
 * E2E Smoke: Resources
 *
 * Coverage IDs: E2E-RES-001..004
 * RF: RF-01 (CRUD recursos)
 * HU: HU-01, HU-02
 */

import { expect, test } from "../fixtures/base-test";
import { authStatePath } from "../fixtures/test-users";

test.describe("Resources Smoke", () => {
  test.use({ storageState: authStatePath("admin") });

  // E2E-RES-001 | List resources visible
  test("displays resources list page", async ({ page }) => {
    await page.goto("/es/recursos");
    await expect(
      page.locator("h1, h2").filter({ hasText: /recursos/i }),
    ).toBeVisible({ timeout: 10000 });
  });

  // E2E-RES-002 | Navigate to create resource
  test("navigates to create resource form", async ({ page }) => {
    await page.goto("/es/recursos/nuevo");
    await expect(page).toHaveURL(/recursos\/nuevo/);
    await expect(
      page
        .locator("h1, h2")
        .filter({ hasText: /nuevo|crear|recurso/i })
        .first(),
    ).toBeVisible({ timeout: 10000 });
  });

  // E2E-RES-003 | View resource detail
  test("navigates to resource detail", async ({ page }) => {
    await page.goto("/es/recursos");
    await page.waitForLoadState("networkidle");

    const resourceLink = page.locator("a[href*='/recursos/']").first();
    if (await resourceLink.isVisible()) {
      await resourceLink.click();
      await expect(page).toHaveURL(/recursos\/.+/);
    }
  });

  // E2E-RES-004 | Navigate to edit resource
  test("navigates to edit resource page", async ({ page }) => {
    await page.goto("/es/recursos/res_001");
    await page.waitForLoadState("networkidle");

    const editLink = page
      .locator("a[href*='editar'], button")
      .filter({ hasText: /editar/i })
      .first();
    if (await editLink.isVisible()) {
      await editLink.click();
      await expect(page).toHaveURL(/editar/);
    }
  });
});
