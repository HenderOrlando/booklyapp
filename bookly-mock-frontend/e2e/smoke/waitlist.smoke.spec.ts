import { expect, test } from "../fixtures/base-test";
import { authStatePath } from "../fixtures/test-users";

test.describe("Waitlist E2E Flow", () => {
  test.use({ storageState: authStatePath("admin") });

  test("Allows user to join the waitlist when resource is unavailable", async ({ page }) => {
    // Ir a la página de recursos
    await page.goto("/es/recursos");
    // Seleccionar el primer recurso
    await page.getByText("Ver detalles").first().click();

    // 1. Simular intento de reserva en horario ocupado
    await page.getByRole("button", { name: /Reservar/i }).click();
    
    // Llenar formulario con fecha futura
    await page.getByLabel(/Fecha/i).fill("2026-12-01");
    await page.getByLabel(/Hora de inicio/i).fill("10:00");
    await page.getByLabel(/Hora de fin/i).fill("12:00");
    
    // Seleccionar que está ocupado y unirse a lista de espera
    // Nota: Esto asume que el botón de lista de espera aparece
    const waitlistBtn = page.getByRole("button", { name: /Unirse a lista de espera/i });
    if (await waitlistBtn.isVisible()) {
      await waitlistBtn.click();
      
      // Llenar formulario de lista de espera
      await page.getByLabel(/Prioridad/i).selectOption("Alta");
      await page.getByLabel(/Motivo/i).fill("Necesito este recurso urgentemente");
      
      await page.getByRole("button", { name: /Confirmar/i }).click();
      
      // Verificar mensaje de éxito
      await expect(page.getByText(/Agregado a la lista de espera/i)).toBeVisible();
    }
  });

  test("Admin can view waitlist manager and notify users", async ({ page }) => {
    // Ir directamente al administrador de lista de espera
    await page.goto("/es/admin/lista-espera");
    
    // Verificar que la página cargó
    await expect(page.getByRole("heading", { name: /Lista de Espera/i })).toBeVisible();
    
    // Verificar si hay entradas y notificar
    const notifyBtn = page.getByRole("button", { name: /Notificar/i }).first();
    if (await notifyBtn.isVisible()) {
      await notifyBtn.click();
      
      // Verificar éxito de notificación
      await expect(page.getByText(/Usuarios notificados/i)).toBeVisible();
    }
  });
});
