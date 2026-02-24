/**
 * Common assertion helpers for E2E tests
 */

import { expect, type Page } from "@playwright/test";

export async function expectToastVisible(
  page: Page,
  type: "success" | "error" = "success"
): Promise<void> {
  const toast = page.locator('[data-sonner-toast]').first();
  await expect(toast).toBeVisible({ timeout: 5000 });
}

export async function expectRedirectTo(
  page: Page,
  pattern: RegExp,
  timeout: number = 10000
): Promise<void> {
  await page.waitForURL(pattern, { timeout });
  await expect(page).toHaveURL(pattern);
}

export async function expectAccessDenied(page: Page): Promise<void> {
  await expect(
    page.getByText("Acceso Denegado").or(page.getByText("No tienes permisos"))
  ).toBeVisible({ timeout: 5000 });
}
