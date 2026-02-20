import { expect, test } from "@playwright/test";

/**
 * E2E Tests: Users Administration
 * Tests the CRUD operations for users in the admin panel.
 */

test.describe("Users Administration", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/es/login");
    await page.fill("input[type='email'], input[name='email']", "admin@ufps.edu.co");
    await page.fill("input[type='password']", "admin123");
    await page.click("button[type='submit']");
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    
    // Navigate to users admin page
    await page.goto("/es/admin/usuarios");
    await expect(page.locator("h1")).toContainText(/usuarios/i);
  });

  test("should list users and show statistics", async ({ page }) => {
    // Verify stats cards are visible
    await expect(page.locator("text=/total de usuarios/i")).toBeVisible();
    await expect(page.locator("text=/usuarios activos/i")).toBeVisible();
    
    // Verify table is visible and has data (assuming mock data is present)
    const table = page.locator("table");
    await expect(table).toBeVisible();
    const rowCount = await table.locator("tbody tr").count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("should filter users by search term", async ({ page }) => {
    const searchInput = page.locator("input[placeholder*='buscar' i]");
    await expect(searchInput).toBeVisible();
    
    // Assuming 'Admin' user exists in mock data
    await searchInput.fill("Admin");
    const table = page.locator("table");
    await expect(table.locator("tbody tr")).toContainText(/admin/i);
  });

  test("should open and close the creation modal", async ({ page }) => {
    await page.click("button:has-text('crear usuario')");
    
    const modal = page.locator("role=dialog");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/crear nuevo usuario/i);
    
    await page.click("button:has-text('cancelar')");
    await expect(modal).not.toBeVisible();
  });

  test("should show user details and allow editing", async ({ page }) => {
    // Click on the first "view" button in the table
    // Assuming there's a button with an eye icon or "ver" text
    const viewButton = page.locator("table tbody tr").first().locator("button").nth(0);
    await viewButton.click();
    
    // Detail panel should appear
    await expect(page.locator("text=/detalles del usuario/i")).toBeVisible();
    await expect(page.locator("text=/información personal/i")).toBeVisible();
    
    // Click edit button in detail panel
    await page.click("button:has-text('editar')");
    
    // Edit modal should open
    const modal = page.locator("role=dialog");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/editar usuario/i);
  });

  test("should show confirmation dialog when deleting", async ({ page }) => {
    // Open detail panel for the first user
    const viewButton = page.locator("table tbody tr").first().locator("button").nth(0);
    await viewButton.click();
    
    // Click delete in detail panel
    await page.click("button:has-text('eliminar')");
    
    // Confirm dialog should appear
    const confirmDialog = page.locator("role=dialog").filter({ hasText: /confirmar eliminación/i });
    await expect(confirmDialog).toBeVisible();
    await expect(confirmDialog).toContainText(/¿está seguro/i);
    
    // Close dialog
    await page.click("button:has-text('cancelar')");
    await expect(confirmDialog).not.toBeVisible();
  });
});
