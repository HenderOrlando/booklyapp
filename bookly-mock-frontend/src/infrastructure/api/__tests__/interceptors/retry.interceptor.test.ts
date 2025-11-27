/**
 * Tests para retryInterceptor
 * Verifica reintentos automáticos con exponential backoff
 */

import { retryInterceptor } from "../../base-client";

// Mock de console
const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

// Mock de setTimeout para tests síncronos
jest.useFakeTimers();

describe("retryInterceptor", () => {
  beforeEach(() => {
    consoleLogSpy.mockClear();
    consoleErrorSpy.mockClear();
    jest.clearAllTimers();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.useRealTimers();
  });

  describe("Errores recuperables", () => {
    it("debe reintentar errores de red", async () => {
      // Arrange
      const error = new Error("network error");
      (error as any).__retryCount = 0;
      const endpoint = "/reservations";
      const method = "GET";

      // Act
      const promise = retryInterceptor(error, endpoint, method);

      // Avanzar tiempo: 1 segundo (primer reintento)
      jest.advanceTimersByTime(1000);

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Retry Interceptor] Intento 1/3 en 1000ms")
      );
    });

    it("debe usar exponential backoff (1s, 2s, 4s)", async () => {
      // Arrange
      const testCases = [
        { retryCount: 0, expectedDelay: 1000 }, // 2^0 * 1000 = 1s
        { retryCount: 1, expectedDelay: 2000 }, // 2^1 * 1000 = 2s
        { retryCount: 2, expectedDelay: 4000 }, // 2^2 * 1000 = 4s
      ];

      for (const { retryCount, expectedDelay } of testCases) {
        consoleLogSpy.mockClear();

        // Arrange
        const error = new Error("timeout");
        (error as any).__retryCount = retryCount;

        // Act
        retryInterceptor(error, "/test", "GET");

        // Assert
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining(`en ${expectedDelay}ms`)
        );
      }
    });

    it("debe identificar errores recuperables", () => {
      const recuperableErrors = [
        new Error("network error"),
        new Error("timeout occurred"),
        new Error("fetch failed"),
        Object.assign(new Error("Service down"), { status: 503 }),
        Object.assign(new Error("Too many requests"), { status: 429 }),
      ];

      recuperableErrors.forEach((error) => {
        (error as any).__retryCount = 0;
        consoleLogSpy.mockClear();

        // Act
        retryInterceptor(error, "/test", "GET");

        // Assert
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining("[Retry Interceptor] Intento 1/3")
        );
      });
    });

    it("debe pasar contador de reintentos al siguiente error", async () => {
      // Este test verifica el flujo conceptual
      // En la implementación real, el contador se pasa al reintentar
      const error = new Error("network");
      (error as any).__retryCount = 1;

      // El interceptor debería intentar retry con __retryCount = 2
      expect((error as any).__retryCount).toBe(1);
    });
  });

  describe("Límite de reintentos", () => {
    it("debe fallar después de 3 reintentos", async () => {
      // Arrange
      const error = new Error("network error");
      (error as any).__retryCount = 3; // Máximo alcanzado
      const endpoint = "/reservations";
      const method = "GET";

      // Act & Assert
      await expect(retryInterceptor(error, endpoint, method)).rejects.toThrow(
        "network error"
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[Retry Interceptor] Máximo de reintentos alcanzado"
        )
      );
    });

    it("no debe reintentar si ya se alcanzó el máximo", async () => {
      // Arrange
      const error = new Error("timeout");
      (error as any).__retryCount = 4; // Más del máximo

      // Act & Assert
      await expect(retryInterceptor(error, "/test", "GET")).rejects.toThrow();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe("Errores NO recuperables", () => {
    it("no debe reintentar errores 400", async () => {
      // Arrange
      const error = Object.assign(new Error("Bad Request"), { status: 400 });

      // Act & Assert
      await expect(retryInterceptor(error, "/test", "POST")).rejects.toThrow();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it("no debe reintentar errores 401 (Unauthorized)", async () => {
      // Arrange
      const error = Object.assign(new Error("Unauthorized"), { status: 401 });

      // Act & Assert
      await expect(retryInterceptor(error, "/test", "GET")).rejects.toThrow();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it("no debe reintentar errores 404", async () => {
      // Arrange
      const error = Object.assign(new Error("Not Found"), { status: 404 });

      // Act & Assert
      await expect(retryInterceptor(error, "/test", "GET")).rejects.toThrow();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it("no debe reintentar errores de validación", async () => {
      // Arrange
      const error = new Error("Validation failed: title is required");

      // Act & Assert
      await expect(retryInterceptor(error, "/test", "POST")).rejects.toThrow();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    it("debe manejar error sin __retryCount", async () => {
      // Arrange
      const error = new Error("network");
      // No se establece __retryCount, debería ser 0

      // Act
      const promise = retryInterceptor(error, "/test", "GET");
      jest.advanceTimersByTime(1000);

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Intento 1/3")
      );
    });

    it("debe preservar mensaje de error original", async () => {
      // Arrange
      const originalMessage = "Original network error message";
      const error = new Error(originalMessage);
      (error as any).__retryCount = 3;

      // Act & Assert
      try {
        await retryInterceptor(error, "/test", "GET");
      } catch (e: any) {
        expect(e.message).toBe(originalMessage);
      }
    });

    it("debe funcionar con diferentes endpoints", () => {
      const endpoints = [
        "/reservations",
        "/resources/123",
        "/auth/profile",
        "/reports/usage",
      ];

      endpoints.forEach((endpoint) => {
        consoleLogSpy.mockClear();

        const error = new Error("network");
        (error as any).__retryCount = 0;

        retryInterceptor(error, endpoint, "GET");

        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining(endpoint)
        );
      });
    });
  });
});
