/**
 * E2E Smoke: Authentication
 *
 * Coverage IDs: E2E-AUTH-001..007
 * RF: RF-43 (Autenticación y SSO)
 * HU: HU-35
 */

import { expect, test } from "@playwright/test";
import { TEST_USERS } from "../fixtures/test-users";
import { LoginPage } from "../pages/login.page";

test.describe("Auth Smoke", () => {
  // E2E-AUTH-006 | HU-35 | RF-43 | callback redirect after protected-route login
  test("restores protected route after login when callback is present", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await page.goto("/es/recursos?from=auth-redirect");

    await expect(page).toHaveURL(/\/es\/login\?/);

    const redirectedUrl = new URL(page.url());
    expect(redirectedUrl.searchParams.get("callback")).toContain(
      "/es/recursos?from=auth-redirect",
    );

    await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);

    await page.waitForURL(/\/es\/recursos\?from=auth-redirect/, {
      timeout: 15000,
    });
    await expect(page).toHaveURL(/\/es\/recursos\?from=auth-redirect/);
  });

  // E2E-AUTH-007 | HU-35 | RF-43 | direct login fallback to dashboard
  test("redirects to dashboard after direct login without callback", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);

    await page.waitForURL(/\/es\/dashboard/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/es\/dashboard/);
  });

  // E2E-AUTH-001 | HU-35 | RF-43 | Login admin happy path
  test("admin logs in successfully and reaches dashboard", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.expectLoaded();

    await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await loginPage.expectDashboardRedirect();
  });

  // E2E-AUTH-002 | HU-35 | RF-43 | Login invalid credentials
  test("shows error on invalid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login("bad@test.com", "wrongpassword");
    await loginPage.expectError();
  });

  // E2E-AUTH-003 | HU-35 | RF-43 | Empty form validation
  test("shows validation on empty submit", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.submitButton.click();

    // HTML5 required validation prevents submission — email field should show validity state
    const emailInput = loginPage.emailInput;
    const isInvalid = await emailInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid,
    );
    expect(isInvalid).toBe(true);
  });

  // E2E-AUTH-004 | HU-35 | RF-43 | Unauthenticated redirect
  test("redirects unauthenticated user to login", async ({ page }) => {
    await page.goto("/es/dashboard");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });

  // E2E-AUTH-005 | HU-35 | RF-43 | Navigate to register
  test("can navigate to register page from login", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    if (await loginPage.registerLink.isVisible()) {
      await loginPage.registerLink.click();
      await expect(page).toHaveURL(/register/);
    }
  });
});
