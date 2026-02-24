/**
 * Tests para timingInterceptor
 * Verifica medición de performance de peticiones
 */

import type { ApiResponse } from "@/types/api/response";
import {
  timingRequestInterceptor,
  timingResponseInterceptor,
} from "../../base-client";

type TimingTestPayload = Record<string, unknown>;

// Mock de console
const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

// Mock de Date.now()
let mockNow = 1000;
const originalDateNow = Date.now;

describe("timingInterceptor", () => {
  let mockGtag: jest.Mock;
  let originalWindow: Window & typeof globalThis;

  beforeEach(() => {
    consoleLogSpy.mockClear();
    mockGtag = jest.fn();
    originalWindow = global.window;
    mockNow = 1000;

    // Mock window con gtag
    Object.defineProperty(global.window, "gtag", {
      configurable: true,
      writable: true,
      value: mockGtag,
    });

    // Mock Date.now
    Date.now = jest.fn(() => mockNow);
  });

  afterEach(() => {
    Date.now = originalDateNow;
    global.window = originalWindow;
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  describe("timingRequestInterceptor", () => {
    it("debe guardar timestamp al iniciar request", () => {
      // Arrange
      const endpoint = "/reservations";
      const method = "GET";
      const data = undefined;

      // Act
      const result = timingRequestInterceptor(endpoint, method, data);

      // Assert
      expect(result).toEqual({
        endpoint,
        method,
        data,
      });
    });

    it("debe funcionar con data", async () => {
      // Arrange
      const data = { title: "Test" };

      // Act
      const result = await timingRequestInterceptor("/test", "POST", data);

      // Assert
      expect(result.data).toEqual(data);
    });

    it("debe funcionar con diferentes endpoints", async () => {
      const endpoints = ["/reservations", "/resources", "/auth/profile"];

      for (const endpoint of endpoints) {
        // Act
        const result = await timingRequestInterceptor(
          endpoint,
          "GET",
          undefined,
        );

        // Assert
        expect(result.endpoint).toBe(endpoint);
      }
    });
  });

  describe("timingResponseInterceptor", () => {
    it("debe calcular y loguear duración correctamente", async () => {
      // Arrange
      const endpoint = "/reservations";
      const method = "GET";

      // Simular request
      mockNow = 1000;
      timingRequestInterceptor(endpoint, method, undefined);

      // Simular response 145ms después
      mockNow = 1145;

      const response: ApiResponse<TimingTestPayload> = {
        success: true,
        data: {},
        message: "Success",
      };

      // Act
      const result = await timingResponseInterceptor(
        response,
        endpoint,
        method,
      );

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Timing] GET:/reservations → 145ms"),
      );

      expect(result).toBe(response);
    });

    it("debe enviar timing a gtag cuando está disponible", () => {
      // Arrange
      const endpoint = "/resources";
      const method = "POST";

      mockNow = 2000;
      timingRequestInterceptor(endpoint, method, undefined);

      mockNow = 2250; // 250ms después

      const response: ApiResponse<TimingTestPayload> = {
        success: true,
        data: {},
        message: "Success",
      };

      // Act
      timingResponseInterceptor(response, endpoint, method);

      // Assert
      expect(mockGtag).toHaveBeenCalledWith("event", "timing_complete", {
        name: "api_response_time",
        value: 250,
        event_category: "API",
        event_label: "POST:/resources",
      });
    });

    it("debe manejar múltiples peticiones concurrentes", () => {
      // Arrange
      const requests = [
        { endpoint: "/reservations", method: "GET", startTime: 1000 },
        { endpoint: "/resources", method: "GET", startTime: 1100 },
        { endpoint: "/auth/profile", method: "GET", startTime: 1200 },
      ];

      // Iniciar todas las peticiones
      requests.forEach(({ endpoint, method, startTime }) => {
        mockNow = startTime;
        timingRequestInterceptor(endpoint, method, undefined);
      });

      // Completar en diferente orden
      consoleLogSpy.mockClear();

      // Completar segunda petición primero
      mockNow = 1250; // 150ms
      const response: ApiResponse<TimingTestPayload> = {
        success: true,
        data: {},
        message: "Success",
      };
      timingResponseInterceptor(response, "/resources", "GET");
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("GET:/resources → 150ms"),
      );

      // Completar primera petición
      consoleLogSpy.mockClear();
      mockNow = 1300; // 300ms
      timingResponseInterceptor(response, "/reservations", "GET");
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("GET:/reservations → 300ms"),
      );

      // Completar tercera petición
      consoleLogSpy.mockClear();
      mockNow = 1350; // 150ms
      timingResponseInterceptor(response, "/auth/profile", "GET");
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("GET:/auth/profile → 150ms"),
      );
    });

    it("no debe loguear si no hay startTime", () => {
      // Arrange
      const response: ApiResponse<TimingTestPayload> = {
        success: true,
        data: {},
        message: "Success",
      };

      // No se llamó a timingRequestInterceptor antes

      // Act
      timingResponseInterceptor(response, "/unknown", "GET");

      // Assert
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it("debe preservar response original", async () => {
      // Arrange
      const endpoint = "/test";
      const method = "GET";

      mockNow = 1000;
      timingRequestInterceptor(endpoint, method, undefined);
      mockNow = 1100;

      const response: ApiResponse<TimingTestPayload> = {
        success: true,
        data: { id: "123", value: "test" },
        message: "Success",
      };

      // Act
      const result = await timingResponseInterceptor(
        response,
        endpoint,
        method,
      );

      // Assert
      expect(result).toBe(response);
      expect(result.data).toEqual({ id: "123", value: "test" });
    });
  });

  describe("Sin gtag disponible", () => {
    beforeEach(() => {
      Object.defineProperty(global.window, "gtag", {
        configurable: true,
        writable: true,
        value: undefined,
      });
    });

    it("debe loguear pero no enviar a gtag", () => {
      // Arrange
      const endpoint = "/test";
      const method = "GET";

      mockNow = 1000;
      timingRequestInterceptor(endpoint, method, undefined);
      mockNow = 1200;

      const response: ApiResponse<TimingTestPayload> = {
        success: true,
        data: {},
        message: "Success",
      };

      // Act
      timingResponseInterceptor(response, endpoint, method);

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Timing] GET:/test → 200ms"),
      );
      // gtag no debe ser llamado porque es undefined
    });
  });

  describe("SSR (sin window)", () => {
    beforeEach(() => {
      // @ts-expect-error SSR test: remove window to simulate server runtime
      delete global.window;
    });

    afterEach(() => {
      global.window = originalWindow;
    });

    it("no debe fallar en entorno SSR", () => {
      // Arrange
      const endpoint = "/test";
      const method = "GET";

      mockNow = 1000;
      timingRequestInterceptor(endpoint, method, undefined);
      mockNow = 1100;

      const response: ApiResponse<TimingTestPayload> = {
        success: true,
        data: {},
        message: "Success",
      };

      // Act & Assert
      expect(() => {
        timingResponseInterceptor(response, endpoint, method);
      }).not.toThrow();

      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    it("debe manejar duración 0ms", () => {
      // Arrange
      const endpoint = "/test";
      const method = "GET";

      mockNow = 1000;
      timingRequestInterceptor(endpoint, method, undefined);
      // Sin cambiar mockNow - 0ms

      const response: ApiResponse<TimingTestPayload> = {
        success: true,
        data: {},
        message: "Success",
      };

      // Act
      timingResponseInterceptor(response, endpoint, method);

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("→ 0ms"),
      );
    });

    it("debe manejar duraciones largas", () => {
      // Arrange
      const endpoint = "/slow-endpoint";
      const method = "GET";

      mockNow = 1000;
      timingRequestInterceptor(endpoint, method, undefined);
      mockNow = 11000; // 10 segundos

      const response: ApiResponse<TimingTestPayload> = {
        success: true,
        data: {},
        message: "Success",
      };

      // Act
      timingResponseInterceptor(response, endpoint, method);

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("→ 10000ms"),
      );
    });

    it("debe limpiar timingMap después de medir", () => {
      // Arrange
      const endpoint = "/test";
      const method = "GET";

      mockNow = 1000;
      timingRequestInterceptor(endpoint, method, undefined);
      mockNow = 1100;

      const response: ApiResponse<TimingTestPayload> = {
        success: true,
        data: {},
        message: "Success",
      };

      // Act - Primera vez
      timingResponseInterceptor(response, endpoint, method);
      expect(consoleLogSpy).toHaveBeenCalled();

      // Act - Segunda vez sin nuevo request
      consoleLogSpy.mockClear();
      timingResponseInterceptor(response, endpoint, method);

      // Assert - No debe loguear porque ya se limpió
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });
});
