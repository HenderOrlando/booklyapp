/**
 * E2E Smoke: Approvals (Stockpile)
 *
 * Coverage IDs: E2E-STK-001..003
 * RF: RF-20 (Validar solicitudes)
 * HU: HU-17
 */

import { test, expect } from "@playwright/test";
import { authStatePath } from "../fixtures/test-users";

test.describe("Approvals Smoke", () => {
  test.use({ storageState: authStatePath("admin") });

  // E2E-STK-001 | List pending approvals
  test("displays approvals list page", async ({ page }) => {
    await page.goto("/es/aprobaciones");
    await expect(
      page.locator("h1, h2").filter({ hasText: /aprobaciones|solicitudes/i })
    ).toBeVisible({ timeout: 10000 });
  });

  // E2E-STK-002 | Navigate to approval detail
  test("navigates to approval detail", async ({ page }) => {
    await page.goto("/es/aprobaciones");
    await page.waitForLoadState("networkidle");

    const approvalLink = page.locator("a[href*='/aprobaciones/']").first();
    if (await approvalLink.isVisible()) {
      await approvalLink.click();
      await expect(page).toHaveURL(/aprobaciones\/.+/);
    }
  });

  // E2E-STK-003 | Approval detail shows approve/reject actions
  test("approval detail shows action buttons", async ({ page }) => {
    await page.goto("/es/aprobaciones/apr_001");
    await page.waitForLoadState("networkidle");

    const approveBtn = page.locator("button").filter({ hasText: /aprobar/i });
    const rejectBtn = page.locator("button").filter({ hasText: /rechazar/i });

    const approveVisible = await approveBtn.isVisible().catch(() => false);
    const rejectVisible = await rejectBtn.isVisible().catch(() => false);

    expect(approveVisible || rejectVisible).toBe(true);
  });
});
