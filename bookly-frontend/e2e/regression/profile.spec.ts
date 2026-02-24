import { expect, test } from "@playwright/test";
import { authStatePath } from "../fixtures/test-users";
import { gotoWithLocale, waitForPageReady } from "../helpers/navigation.helper";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test.describe("Profile regression", () => {
  test.describe.configure({ mode: "serial" });
  test.use({ storageState: authStatePath("admin") });

  test("updates personal profile information", async ({ page }) => {
    const timestamp = Date.now();
    const nextFirstName = `Perfil${timestamp}`;
    const nextLastName = "QA";
    const nextPhone = "+57 300 999 0000";
    const nextDocumentType = "CE";
    const nextDocumentNumber = `90${String(timestamp).slice(-8)}`;

    await gotoWithLocale(page, "/profile");
    await waitForPageReady(page);

    await page.getByTestId("profile-edit-button").click();

    await page.getByTestId("profile-first-name-input").fill(nextFirstName);
    await page.getByTestId("profile-last-name-input").fill(nextLastName);
    await page.getByTestId("profile-phone-input").fill(nextPhone);
    await page
      .getByTestId("profile-document-type-select")
      .selectOption(nextDocumentType);
    await page
      .getByTestId("profile-document-number-input")
      .fill(nextDocumentNumber);

    await page.getByTestId("profile-save-button").click();

    await expect(page.getByTestId("profile-success-alert")).toBeVisible({
      timeout: 10000,
    });

    await expect(
      page
        .locator("main")
        .getByText(`${nextFirstName} ${nextLastName}`)
        .first(),
    ).toBeVisible();

    await expect(
      page.getByText(`${nextDocumentType}: ${nextDocumentNumber}`),
    ).toBeVisible();
  });

  test("shows mismatch validation when changing password", async ({ page }) => {
    await gotoWithLocale(page, "/profile");
    await waitForPageReady(page);

    await page.getByTestId("profile-change-password-button").click();

    await page.getByTestId("profile-current-password-input").fill("old123456");
    await page.getByTestId("profile-new-password-input").fill("new123456");
    await page.getByTestId("profile-confirm-password-input").fill("diff123456");

    await page.getByTestId("profile-password-submit-button").click();

    await expect(page.getByTestId("password-error-alert")).toContainText(
      /las contraseñas no coinciden|passwords do not match/i,
    );
  });

  test("uploads profile photo", async ({ page }) => {
    const fileName = `avatar-e2e-${Date.now()}.png`;

    await gotoWithLocale(page, "/profile");
    await waitForPageReady(page);

    await page.getByTestId("profile-photo-input").setInputFiles({
      name: fileName,
      mimeType: "image/png",
      buffer: Buffer.from("profile-photo-e2e"),
    });

    await expect(page.getByTestId("photo-success-alert")).toBeVisible({
      timeout: 10000,
    });

    await expect(page.getByTestId("profile-avatar-image")).toHaveCSS(
      "background-image",
      new RegExp(escapeRegExp(encodeURIComponent(fileName))),
    );
  });

  test("updates user preferences", async ({ page }) => {
    await gotoWithLocale(page, "/profile");
    await waitForPageReady(page);

    await page.getByTestId("preferences-language-select").selectOption("en");
    await page.getByTestId("preferences-theme-select").selectOption("dark");
    await page
      .getByTestId("preferences-timezone-input")
      .fill("America/New_York");

    await page.getByTestId("preferences-push-toggle").click();
    await page.getByTestId("preferences-sms-toggle").click();
    await page.getByTestId("preferences-save-button").click();

    await expect(page.getByTestId("preferences-success-alert")).toBeVisible({
      timeout: 10000,
    });

    await expect(page.getByTestId("preferences-language-select")).toHaveValue(
      "en",
    );
    await expect(page.getByTestId("preferences-theme-select")).toHaveValue(
      "dark",
    );
    await expect(page.getByTestId("preferences-timezone-input")).toHaveValue(
      "America/New_York",
    );
    await expect(page.getByTestId("preferences-push-toggle")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(page.getByTestId("preferences-sms-toggle")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
