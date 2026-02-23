import { expect, test } from "@playwright/test";

test.describe("Login UI smoke", () => {
  test("login submit button is visible and clickable in light mode", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("theme", "light");
      window.localStorage.removeItem("bookly_data_mode_override");
      window.localStorage.removeItem("bookly_use_direct_services");
    });

    await page.goto("/es/login");

    const submitButton = page.getByTestId("login-submit-btn");
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();

    await submitButton.click();

    await expect(submitButton).toBeVisible();
  });

  test("theme toggle switches light -> dark -> light on login", async ({
    page,
  }) => {
    await page.goto("/es/login");
    await page.evaluate(() => {
      window.localStorage.setItem("theme", "light");
    });
    await page.reload();

    const html = page.locator("html");
    const toggle = page.getByTestId("login-theme-toggle");

    await expect(html).not.toHaveClass(/dark/);

    await toggle.click();
    await expect(html).toHaveClass(/dark/);
    await expect
      .poll(async () =>
        page.evaluate(() => window.localStorage.getItem("theme")),
      )
      .toBe("dark");

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.getByTestId("login-theme-toggle").click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await expect
      .poll(async () =>
        page.evaluate(() => window.localStorage.getItem("theme")),
      )
      .toBe("light");

    await page.reload();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });

  test("mock credentials are visible only in MOCK mode", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("bookly_data_mode_override", "mock");
      window.localStorage.setItem("bookly_use_direct_services", "false");
    });

    await page.goto("/es/login");

    await expect(page.getByTestId("login-mock-credentials")).toBeVisible();
    await expect(page.getByTestId("login-server-credentials-hint")).toHaveCount(
      0,
    );
  });

  test("mock credentials are hidden in SERVER mode", async ({ page }) => {
    await page.route("**/api/v1/config/public", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            themeMode: "light",
            primaryColor: "#000000",
            secondaryColor: "#ffffff",
          },
        }),
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem("bookly_data_mode_override", "serve");
      window.localStorage.setItem("bookly_use_direct_services", "false");
    });

    await page.goto("/es/login");

    await expect(page.getByTestId("login-mock-credentials")).toHaveCount(0);
    await expect(
      page.getByTestId("login-server-credentials-hint"),
    ).toBeVisible();
  });
});
