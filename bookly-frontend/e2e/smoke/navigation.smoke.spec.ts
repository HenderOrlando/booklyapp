/**
 * E2E Smoke: Navigation & Sidebar
 *
 * Coverage IDs: E2E-NAV-001..003, E2E-DASH-001
 * RF: RF-41, RF-42, RF-36
 */

import { test, expect } from "../fixtures/base-test";
import { authStatePath } from "../fixtures/test-users";
import { SidebarPage } from "../pages/sidebar.page";

test.describe("Navigation Smoke — Admin", () => {
  test.use({ storageState: authStatePath("admin") });

  // E2E-NAV-001 | Dashboard loads for admin
  test("dashboard page loads with content", async ({ page }) => {
    await page.goto("/es/dashboard");
    await expect(page).toHaveURL(/dashboard/);
    // Dashboard renders KPI cards (h3) — verify main content area with data
    await expect(page.locator("main").first()).toBeVisible({ timeout: 15000 });
    await expect(
      page.locator("h3").filter({ hasText: /reservas|recursos|ocupación|aprobación/i }).first()
    ).toBeVisible({ timeout: 15000 });
  });

  // E2E-NAV-002 | Admin sidebar shows all main links
  test("admin sidebar shows all navigation links", async ({ page }) => {
    await page.goto("/es/dashboard");
    const sidebar = new SidebarPage(page);

    await sidebar.expectLinkVisible("Recursos");
    await sidebar.expectLinkVisible("Reservas");
    await sidebar.expectLinkVisible("Calendario");
    await sidebar.expectLinkVisible("Aprobaciones");
    await sidebar.expectLinkVisible("Reportes");
  });
});

test.describe("Navigation Smoke — Estudiante", () => {
  test.use({ storageState: authStatePath("estudiante") });

  // E2E-NAV-003 | Student sidebar is restricted
  test("student sidebar hides admin-only links", async ({ page }) => {
    await page.goto("/es/dashboard");
    const sidebar = new SidebarPage(page);

    await sidebar.expectLinkHidden("Categorías");
    await sidebar.expectLinkHidden("Mantenimientos");
    await sidebar.expectLinkHidden("Reportes");
  });
});
