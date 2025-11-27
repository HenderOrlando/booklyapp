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

  it("debe agregar token JWT cuando existe en localStorage", () => {
    // Arrange
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test";
    localStorage.setItem("token", token);

    const endpoint = "/reservations";
    const method = "GET";
    const data = undefined;

    // Act
    const result = authInterceptor(endpoint, method, data);

    // Assert
    expect(result).toEqual({
      endpoint,
      method,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "[Auth Interceptor] Token agregado a GET /reservations"
      )
    );
  });

  it("debe continuar sin headers cuando no hay token", () => {
    // Arrange
    const endpoint = "/reservations";
    const method = "GET";
    const data = undefined;

    // Act
    const result = authInterceptor(endpoint, method, data);

    // Assert
    expect(result).toEqual({
      endpoint,
      method,
      data,
    });

    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it("debe funcionar con diferentes métodos HTTP", () => {
    // Arrange
    const token = "test-token";
    localStorage.setItem("token", token);

    const methods = ["GET", "POST", "PATCH", "DELETE", "PUT"];

    methods.forEach((method) => {
      // Act
      const result = authInterceptor("/test", method, undefined);

      // Assert
      expect(result.headers?.Authorization).toBe(`Bearer ${token}`);
    });
  });

  it("debe preservar data cuando se pasa", () => {
    // Arrange
    const token = "test-token";
    localStorage.setItem("token", token);

    const endpoint = "/reservations";
    const method = "POST";
    const data = { title: "Test", resourceId: "res_001" };

    // Act
    const result = authInterceptor(endpoint, method, data);

    // Assert
    expect(result.data).toEqual(data);
    expect(result.headers?.Authorization).toBe(`Bearer ${token}`);
  });

  it("debe manejar tokens largos correctamente", () => {
    // Arrange
    const longToken = "a".repeat(500); // Token muy largo
    localStorage.setItem("token", longToken);

    const endpoint = "/test";
    const method = "GET";

    // Act
    const result = authInterceptor(endpoint, method, undefined);

    // Assert
    expect(result.headers?.Authorization).toBe(`Bearer ${longToken}`);
  });

  it("debe loguear correctamente el método y endpoint", () => {
    // Arrange
    const token = "test-token";
    localStorage.setItem("token", token);

    const testCases = [
      { endpoint: "/reservations", method: "GET" },
      { endpoint: "/resources/123", method: "PATCH" },
      { endpoint: "/auth/login", method: "POST" },
    ];

    testCases.forEach(({ endpoint, method }) => {
      consoleLogSpy.mockClear();

      // Act
      authInterceptor(endpoint, method, undefined);

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `[Auth Interceptor] Token agregado a ${method} ${endpoint}`
        )
      );
    });
  });

  it("debe funcionar en entorno SSR (sin window)", () => {
    // Arrange
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    const endpoint = "/test";
    const method = "GET";

    // Act
    const result = authInterceptor(endpoint, method, undefined);

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
