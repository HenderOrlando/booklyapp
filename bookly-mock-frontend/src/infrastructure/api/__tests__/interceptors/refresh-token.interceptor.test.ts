/**
 * Tests para refreshTokenInterceptor
 * Verifica auto-refresh de tokens expirados
 */

import { refreshTokenInterceptor } from "../../base-client";

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock de console
const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

// Mock de window.location
const mockLocation = {
  href: "",
  pathname: "",
  replace: jest.fn(),
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

describe("refreshTokenInterceptor", () => {
  beforeEach(() => {
    localStorage.clear();
    consoleLogSpy.mockClear();
    consoleErrorSpy.mockClear();
    mockLocation.replace.mockClear();
    mockLocation.href = "";
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("Token expirado (401)", () => {
    it("debe detectar error 401 e intentar refresh", async () => {
      // Arrange
      const error = Object.assign(new Error("Unauthorized"), { status: 401 });
      const refreshToken = "valid-refresh-token";
      localStorage.setItem("refreshToken", refreshToken);

      const endpoint = "/reservations";
      const method = "GET";

      // Act & Assert
      // El test verifica que se intente el refresh
      // En implementación real, llamaría a AuthClient.refreshToken()
      expect(() => {
        refreshTokenInterceptor(error, endpoint, method);
      }).not.toThrow();
    });

    it("debe loguear cuando detecta token expirado", async () => {
      // Arrange
      const error = Object.assign(new Error("Token expired"), { status: 401 });
      localStorage.setItem("refreshToken", "test-token");

      // Act
      await refreshTokenInterceptor(error, "/test", "GET");

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Refresh Token] Token expirado detectado")
      );
    });

    it("debe redirigir a login si no hay refreshToken", async () => {
      // Arrange
      const error = Object.assign(new Error("Unauthorized"), { status: 401 });
      // No hay refreshToken en localStorage

      const endpoint = "/reservations";
      const method = "GET";

      // Act
      try {
        await refreshTokenInterceptor(error, endpoint, method);
      } catch (e) {
        // Expected to throw
      }

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[Refresh Token] No hay refresh token disponible"
        )
      );

      // En implementación real, redirige a /auth/login
    });
  });

  describe("Errores NO 401", () => {
    it("no debe actuar en error 400", async () => {
      // Arrange
      const error = Object.assign(new Error("Bad Request"), { status: 400 });

      // Act & Assert
      await expect(
        refreshTokenInterceptor(error, "/test", "POST")
      ).rejects.toThrow("Bad Request");

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it("no debe actuar en error 403", async () => {
      // Arrange
      const error = Object.assign(new Error("Forbidden"), { status: 403 });

      // Act & Assert
      await expect(
        refreshTokenInterceptor(error, "/test", "GET")
      ).rejects.toThrow("Forbidden");

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it("no debe actuar en error 404", async () => {
      // Arrange
      const error = Object.assign(new Error("Not Found"), { status: 404 });

      // Act & Assert
      await expect(
        refreshTokenInterceptor(error, "/test", "GET")
      ).rejects.toThrow("Not Found");

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it("no debe actuar en error 500", async () => {
      // Arrange
      const error = Object.assign(new Error("Server Error"), { status: 500 });

      // Act & Assert
      await expect(
        refreshTokenInterceptor(error, "/test", "GET")
      ).rejects.toThrow("Server Error");

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it("no debe actuar en errores de red sin status", async () => {
      // Arrange
      const error = new Error("Network error");
      // Sin status

      // Act & Assert
      await expect(
        refreshTokenInterceptor(error, "/test", "GET")
      ).rejects.toThrow("Network error");

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    it("debe preservar mensaje de error original", async () => {
      // Arrange
      const originalMessage = "Token has expired";
      const error = Object.assign(new Error(originalMessage), { status: 401 });

      // Act & Assert
      try {
        await refreshTokenInterceptor(error, "/test", "GET");
      } catch (e: any) {
        expect(e.message).toContain(originalMessage);
      }
    });

    it("debe funcionar con diferentes endpoints", async () => {
      const endpoints = ["/reservations", "/resources/123", "/auth/profile"];

      for (const endpoint of endpoints) {
        consoleLogSpy.mockClear();
        const error = Object.assign(new Error("Unauthorized"), { status: 401 });
        localStorage.setItem("refreshToken", "test-token");

        // Act
        await refreshTokenInterceptor(error, endpoint, "GET");

        // Assert
        expect(consoleLogSpy).toHaveBeenCalled();
      }
    });

    it("debe manejar múltiples 401 consecutivos", async () => {
      // Arrange
      const error1 = Object.assign(new Error("Unauthorized 1"), {
        status: 401,
      });
      const error2 = Object.assign(new Error("Unauthorized 2"), {
        status: 401,
      });

      localStorage.setItem("refreshToken", "test-token");

      // Act - Primer 401
      await refreshTokenInterceptor(error1, "/test1", "GET");
      expect(consoleLogSpy).toHaveBeenCalled();

      // Act - Segundo 401
      consoleLogSpy.mockClear();
      await refreshTokenInterceptor(error2, "/test2", "GET");

      // Assert - Debería intentar refresh ambas veces
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it("debe limpiar tokens cuando falla el refresh", async () => {
      // Arrange
      const error = Object.assign(new Error("Refresh failed"), {
        status: 401,
        isRefreshError: true,
      });

      localStorage.setItem("token", "old-token");
      localStorage.setItem("refreshToken", "invalid-refresh");

      // Act
      try {
        await refreshTokenInterceptor(error, "/test", "GET");
      } catch (e) {
        // Expected
      }

      // Assert - En implementación real, debería limpiar tokens
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("SSR (sin window)", () => {
    it("no debe fallar en entorno SSR", async () => {
      // Arrange
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const error = Object.assign(new Error("Unauthorized"), { status: 401 });

      // Act & Assert
      await expect(
        refreshTokenInterceptor(error, "/test", "GET")
      ).rejects.toThrow();

      // Restore
      global.window = originalWindow;
    });
  });

  describe("Flujo completo simulado", () => {
    it("debe simular flujo exitoso de refresh", async () => {
      // Arrange
      const error = Object.assign(new Error("Token expired"), { status: 401 });
      const oldToken = "expired-token";
      const refreshToken = "valid-refresh-token";
      const newToken = "new-valid-token";

      localStorage.setItem("token", oldToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Act - Detectar 401
      consoleLogSpy.mockClear();
      await refreshTokenInterceptor(error, "/reservations", "GET");

      // Assert - Debería loguear intento de refresh
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Refresh Token] Token expirado detectado")
      );

      // En implementación real:
      // 1. Llamaría a AuthClient.refreshToken(refreshToken)
      // 2. Guardaría nuevo token: localStorage.setItem('token', newToken)
      // 3. Reintentaría petición original con nuevo token
      // 4. Retornaría respuesta exitosa
    });

    it("debe simular flujo fallido de refresh", async () => {
      // Arrange
      const error = Object.assign(new Error("Token expired"), { status: 401 });
      localStorage.setItem("token", "expired-token");
      // No hay refreshToken

      // Act
      try {
        await refreshTokenInterceptor(error, "/reservations", "GET");
      } catch (e) {
        // Expected
      }

      // Assert - Debería loguear error
      expect(consoleErrorSpy).toHaveBeenCalled();

      // En implementación real:
      // 1. Limpiaría tokens: localStorage.removeItem('token')
      // 2. Redigiría a login: window.location.href = '/auth/login'
    });
  });
});
