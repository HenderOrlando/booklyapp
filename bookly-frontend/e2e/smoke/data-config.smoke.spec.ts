import { expect, test } from "../fixtures/base-test";
import type { Page } from "@playwright/test";
import { authStatePath } from "../fixtures/test-users";

async function openDataConfigPanel(page: Page) {
  await page.getByTestId("data-config-toggle").click();
  await expect(page.getByTestId("data-config-panel")).toBeVisible();
}

test.describe("Data configuration smoke", () => {
  test.use({ storageState: authStatePath("admin") });

  test("validates MOCK / SERVER+GATEWAY / SERVER+DIRECTO matrix", async ({
    page,
  }) => {
    await page.goto("/es/dashboard");

    await openDataConfigPanel(page);
    await expect(page.getByTestId("data-config-mode-btn")).toContainText(
      "MOCK",
    );
    await expect(page.getByTestId("data-config-routing-btn")).toContainText(
      "N/A",
    );
    await expect(page.getByTestId("data-config-ws-status")).toContainText(
      "INACTIVO",
    );

    await page.getByTestId("data-config-mode-btn").click();
    await page.getByRole("button", { name: "Confirmar cambio" }).click();

    await openDataConfigPanel(page);
    await expect(page.getByTestId("data-config-mode-btn")).toContainText(
      "SERVER",
    );
    await expect(page.getByTestId("data-config-routing-btn")).toContainText(
      "GATEWAY",
    );
    await expect(page.getByTestId("data-config-ws-status")).toContainText(
      "ACTIVO",
    );

    await page.getByTestId("data-config-routing-btn").click();
    await page.getByRole("button", { name: "Confirmar cambio" }).click();

    await openDataConfigPanel(page);
    await expect(page.getByTestId("data-config-routing-btn")).toContainText(
      "DIRECTO",
    );
    await expect(page.getByTestId("data-config-ws-status")).toContainText(
      "INACTIVO",
    );

    await page.getByTestId("data-config-reset-btn").click();

    await openDataConfigPanel(page);
    await expect(page.getByTestId("data-config-mode-btn")).toContainText(
      "MOCK",
    );
    await expect(page.getByTestId("data-config-routing-btn")).toContainText(
      "N/A",
    );
    await expect(page.getByTestId("data-config-ws-status")).toContainText(
      "INACTIVO",
    );
  });
});
