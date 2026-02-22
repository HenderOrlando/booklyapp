import { test, expect } from '@playwright/test';

test.describe('Gestión de Características', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/es/login');
    await page.fill('[data-testid="email-input"]', 'admin@bookly.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Ir a la página de características
    await page.goto('/es/caracteristicas');
  });

  test('debe listar las características existentes', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Características');
    const rows = page.locator('table tr');
    await expect(rows.count()).toBeGreaterThan(1);
  });

  test('debe crear una nueva característica', async ({ page }) => {
    await page.click('[data-testid="create-characteristic-button"]');
    
    const name = `Test Char ${Date.now()}`;
    await page.fill('[data-testid="characteristic-name-input"]', name);
    // El código se genera automáticamente
    await page.fill('[data-testid="characteristic-description-input"]', 'Descripción de prueba');
    
    await page.click('[data-testid="save-characteristic-button"]');
    
    // Verificar que aparezca en la lista
    await page.fill('input[placeholder*="Buscar"]', name);
    await expect(page.locator('table')).toContainText(name);
  });

  test('debe editar una característica existente', async ({ page }) => {
    // Editar la primera de la lista
    await page.click('table button:has-text("Editar")');
    
    const newDescription = 'Descripción editada ' + Date.now();
    await page.fill('[data-testid="characteristic-description-input"]', newDescription);
    
    await page.click('[data-testid="save-characteristic-button"]');
    
    // Verificar cambio
    await expect(page.locator('table')).toContainText(newDescription);
  });
});
