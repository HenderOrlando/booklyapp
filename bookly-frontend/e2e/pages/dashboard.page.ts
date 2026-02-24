/**
 * Page Object: Dashboard Page
 */

import { expect, type Page } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto("/es/dashboard");
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/dashboard/);
    await expect(
      this.page.locator("h1, h2").filter({ hasText: /dashboard|panel|inicio/i })
    ).toBeVisible({ timeout: 10000 });
  }

  async expectUserMenuVisible() {
    await expect(
      this.page.locator("[data-testid='user-menu']").or(
        this.page.locator("button").filter({ hasText: /admin|usuario/i })
      )
    ).toBeVisible({ timeout: 5000 });
  }
}
