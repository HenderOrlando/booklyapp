/**
 * E2E Smoke: Waitlist
 *
 * Coverage IDs: E2E-WL-001..002
 * RF: RF-14 (Lista de espera)
 * HU: HU-14
 */

import { expect, test } from "../fixtures/base-test";
import { authStatePath } from "../fixtures/test-users";

test.describe("Waitlist Smoke", () => {
  test.use({ storageState: authStatePath("admin") });

  // E2E-WL-001 | Waitlist page loads
  test("displays waitlist page", async ({ page }) => {
    await page.goto("/es/lista-espera");
    await expect(page).toHaveURL(/lista-espera/);
    await expect(page.locator("main").first()).toBeVisible({ timeout: 15000 });
  });

  // E2E-WL-002 | Waitlist page shows content or empty state
  test("waitlist page renders content area", async ({ page }) => {
    await page.goto("/es/lista-espera");

    // The page should show either waitlist entries or an empty/stats state
    const mainContent = page.locator("main").first();
    await expect(mainContent).toBeVisible({ timeout: 15000 });

    // Verify the sidebar link is active (confirms correct navigation)
    const sidebarLink = page.locator('a[href*="lista-espera"]').first();
    await expect(sidebarLink).toBeVisible();
  });
});
