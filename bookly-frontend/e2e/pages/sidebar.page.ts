/**
 * Page Object: Sidebar Navigation
 */

import { expect, type Page } from "@playwright/test";

export class SidebarPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private navItem(name: string) {
    const nav = this.page.locator("nav, aside");
    const pattern = new RegExp(name, "i");
    return nav
      .getByRole("link", { name: pattern })
      .or(nav.getByRole("button", { name: pattern }));
  }

  async expectLinkVisible(name: string) {
    await expect(this.navItem(name).first()).toBeVisible({ timeout: 5000 });
  }

  async expectLinkHidden(name: string) {
    await expect(this.navItem(name).first()).toBeHidden();
  }

  async clickLink(name: string) {
    await this.navItem(name).first().click();
  }
}
