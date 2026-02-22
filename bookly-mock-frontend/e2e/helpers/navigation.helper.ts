/**
 * Navigation helpers for E2E tests
 */

import type { Page } from "@playwright/test";

export async function gotoWithLocale(
  page: Page,
  path: string,
  locale: string = "es"
): Promise<void> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  await page.goto(`/${locale}${normalizedPath}`, { waitUntil: "domcontentloaded" });
}

export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
}
