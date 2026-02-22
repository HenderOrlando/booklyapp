import { expect, test } from "@playwright/test";
import { authStatePath } from "../fixtures/test-users";
import { gotoWithLocale, waitForPageReady } from "../helpers/navigation.helper";

function toCharacteristicTestId(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

test.describe("Resources Edit selectors regression", () => {
  test.describe.configure({ mode: "serial" });
  test.use({ storageState: authStatePath("admin") });

  const goToEditFromDetail = async (page: import("@playwright/test").Page) => {
    const editAction = page
      .locator("a[href*='editar'], button")
      .filter({ hasText: /editar/i })
      .first();

    await expect(editAction).toBeVisible({ timeout: 10000 });
    await editAction.click();
    await expect(page).toHaveURL(/\/es\/recursos\/res_001\/editar$/, {
      timeout: 10000,
    });
    await waitForPageReady(page);
  };

  test("persists single program selection after saving", async ({ page }) => {
    await gotoWithLocale(page, "/recursos/res_001/editar");
    await waitForPageReady(page);

    await page.getByRole("tab", { name: /programas/i }).click();

    await page.getByTestId("resource-program-clear-selection").click();

    const selectedCount = page.getByTestId("resource-program-selected-count");
    await expect(selectedCount).toContainText("0 programa(s)");

    const firstProgram = page.getByTestId("resource-program-checkbox-prog_001");
    const secondProgram = page.getByTestId(
      "resource-program-checkbox-prog_002",
    );

    await expect(firstProgram).not.toBeChecked();
    await expect(secondProgram).not.toBeChecked();

    await firstProgram.check();

    await expect(firstProgram).toBeChecked();
    await expect(secondProgram).not.toBeChecked();
    await expect(selectedCount).toContainText("1 programa(s)");

    await page.getByTestId("resource-edit-save-btn").click();

    await expect(
      page.getByText(/recurso actualizado exitosamente/i),
    ).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/es\/recursos\/res_001$/, {
      timeout: 10000,
    });

    await goToEditFromDetail(page);
    await page.getByRole("tab", { name: /programas/i }).click();

    await expect(
      page.getByTestId("resource-program-checkbox-prog_001"),
    ).toBeChecked();
    await expect(
      page.getByTestId("resource-program-checkbox-prog_002"),
    ).not.toBeChecked();
    await expect(
      page.getByTestId("resource-program-selected-count"),
    ).toContainText("1 programa(s)");
  });

  test("creates a new characteristic in UI and persists it only after save", async ({
    page,
  }) => {
    const newCharacteristic = `Mesa interactiva ${Date.now()}`;
    const normalizedCharacteristic = toCharacteristicTestId(newCharacteristic);

    await gotoWithLocale(page, "/recursos/res_001/editar");
    await waitForPageReady(page);

    await page.getByRole("tab", { name: /características/i }).click();

    const searchInput = page.getByTestId(
      "resource-characteristics-search-input",
    );
    await searchInput.fill(newCharacteristic);

    await page.getByTestId("resource-characteristic-create-option").click();

    await expect(
      page.getByTestId(
        `resource-characteristic-chip-new-${normalizedCharacteristic}`,
      ),
    ).toBeVisible();

    await page.getByTestId("resource-edit-save-btn").click();

    await expect(
      page.getByText(/recurso actualizado exitosamente/i),
    ).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/es\/recursos\/res_001$/, {
      timeout: 10000,
    });

    await goToEditFromDetail(page);
    await page.getByRole("tab", { name: /características/i }).click();

    await expect(
      page.getByTestId(
        `resource-characteristic-chip-${normalizedCharacteristic}`,
      ),
    ).toBeVisible();
  });
});
