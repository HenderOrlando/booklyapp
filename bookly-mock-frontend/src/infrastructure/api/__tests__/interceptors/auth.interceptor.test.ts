/**
 * Tests para authInterceptor
 * Verifica que el token JWT se agregue correctamente a las peticiones
 */

import { authInterceptor } from "../../base-client";

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

describe("authInterceptor", () => {
  beforeEach(() => {
    localStorage.clear();
    consoleLogSpy.mockClear();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it("debe continuar con request válido cuando existe token", async () => {
    // Arrange
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test";
    localStorage.setItem("token", token);

    const endpoint = "/reservations";
    const method = "GET";
    const data = undefined;

    // Act
    const result = await authInterceptor(endpoint, method, data);

    // Assert
    expect(result).toEqual({ endpoint, method, data });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "[Auth Interceptor] Token agregado a GET /reservations",
      ),
    );
  });

  it("debe continuar sin token cuando no hay sesión", async () => {
    // Arrange
    const endpoint = "/reservations";
    const method = "GET";
    const data = undefined;

    // Act
    const result = await authInterceptor(endpoint, method, data);

    // Assert
    expect(result).toEqual({
      endpoint,
      method,
      data,
    });

    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it("debe funcionar con diferentes métodos HTTP", async () => {
    // Arrange
    const token = "test-token";
    localStorage.setItem("token", token);

    const methods = ["GET", "POST", "PATCH", "DELETE", "PUT"];

    for (const method of methods) {
      // Act
      const result = await authInterceptor("/test", method, undefined);

      // Assert
      expect(result).toEqual({
        endpoint: "/test",
        method,
        data: undefined,
      });
    }
  });

  it("debe preservar data cuando se pasa", async () => {
    // Arrange
    const token = "test-token";
    localStorage.setItem("token", token);

    const endpoint = "/reservations";
    const method = "POST";
    const data = { title: "Test", resourceId: "res_001" };

    // Act
    const result = await authInterceptor(endpoint, method, data);

    // Assert
    expect(result.data).toEqual(data);
  });

  it("debe manejar tokens largos correctamente", async () => {
    // Arrange
    const longToken = "a".repeat(500); // Token muy largo
    localStorage.setItem("token", longToken);

    const endpoint = "/test";
    const method = "GET";

    // Act
    const result = await authInterceptor(endpoint, method, undefined);

    // Assert
    expect(result).toEqual({ endpoint, method, data: undefined });
  });

  it("debe loguear correctamente el método y endpoint", async () => {
    // Arrange
    const token = "test-token";
    localStorage.setItem("token", token);

    const testCases = [
      { endpoint: "/reservations", method: "GET" },
      { endpoint: "/resources/123", method: "PATCH" },
      { endpoint: "/auth/login", method: "POST" },
    ];

    for (const { endpoint, method } of testCases) {
      consoleLogSpy.mockClear();

      // Act
      await authInterceptor(endpoint, method, undefined);

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `[Auth Interceptor] Token agregado a ${method} ${endpoint}`,
        ),
      );
    }
  });

  it("debe funcionar en entorno SSR (sin window)", async () => {
    // Arrange
    const originalWindow = global.window;
    // @ts-expect-error SSR test: remove window to simulate server runtime
    delete global.window;

    const endpoint = "/test";
    const method = "GET";

    // Act
    const result = await authInterceptor(endpoint, method, undefined);

    // Assert
    expect(result).toEqual({
      endpoint,
      method,
      data: undefined,
    });

    // Restore
    global.window = originalWindow;
  });
});
