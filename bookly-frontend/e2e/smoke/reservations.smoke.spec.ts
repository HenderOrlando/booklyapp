/**
 * E2E Smoke: Reservations & Calendar
 *
 * Coverage IDs: E2E-AVL-001..003, E2E-AVL-007
 * RF: RF-07, RF-10
 * HU: HU-09, HU-11
 */

import { expect, test } from "../fixtures/base-test";
import { authStatePath } from "../fixtures/test-users";

test.describe("Reservations Smoke", () => {
  test.use({ storageState: authStatePath("admin") });

  // E2E-AVL-001 | List reservations visible
  test("displays reservations list page", async ({ page }) => {
    await page.goto("/es/reservas");
    await expect(
      page.locator("h1, h2").filter({ hasText: /reservas/i }),
    ).toBeVisible({ timeout: 10000 });
  });

  // E2E-AVL-002 | Navigate to create reservation
  test("navigates to new reservation form", async ({ page }) => {
    await page.goto("/es/reservas/nueva");
    await expect(page).toHaveURL(/reservas\/nueva/);
  });

  // E2E-AVL-003 | View reservation detail
  test("navigates to reservation detail", async ({ page }) => {
    // Navigate directly to a known mock reservation (click-through tested in regression)
    await page.goto("/es/reservas/rsv_001");
    await expect(page).toHaveURL(/reservas\/rsv_001/);
    await page.waitForLoadState("networkidle");

    // Verify detail content renders
    await expect(
      page
        .locator("main")
        .getByText(/clase de algoritmos/i)
        .first(),
    ).toBeVisible({ timeout: 10000 });
  });

  // E2E-AVL-007 | Calendar view loads
  test("displays calendar page", async ({ page }) => {
    await page.goto("/es/calendario");
    await expect(page).toHaveURL(/calendario/);
    await expect(
      page
        .locator("h1, h2")
        .filter({ hasText: /calendario/i })
        .first(),
    ).toBeVisible({ timeout: 10000 });
  });
});
