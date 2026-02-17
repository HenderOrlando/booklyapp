/**
 * Page Object: Login Page
 */

import { expect, type Locator, type Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId("login-email-input");
    this.passwordInput = page.getByTestId("login-password-input");
    this.submitButton = page.getByTestId("login-submit-btn");
    this.errorMessage = page.getByTestId("login-error-message");
    this.registerLink = page.locator("a[href*='register']");
    this.forgotPasswordLink = page.locator("a[href*='forgot-password']");
  }

  async goto() {
    await this.page.goto("/es/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectLoaded() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async expectError() {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
  }

  async expectNoError() {
    await expect(this.errorMessage).not.toBeVisible();
  }

  async expectDashboardRedirect() {
    await this.page.waitForURL(/dashboard/, { timeout: 15000 });
    await expect(this.page).toHaveURL(/dashboard/);
  }
}
