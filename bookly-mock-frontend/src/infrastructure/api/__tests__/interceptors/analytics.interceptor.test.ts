/**
 * Tests para analyticsInterceptor
 * Verifica envío de eventos a Google Analytics
 */

import type { ApiResponse } from "@/types/api/response";
import { analyticsInterceptor } from "../../base-client";

// Mock de console
const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

describe("analyticsInterceptor", () => {
  let mockGtag: jest.Mock;
  let originalWindow: any;

  beforeEach(() => {
    consoleLogSpy.mockClear();
    mockGtag = jest.fn();
    originalWindow = global.window;

    // Mock window con gtag
    global.window = {
      ...originalWindow,
      gtag: mockGtag,
    } as any;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  describe("Envío de eventos", () => {
    it("debe enviar evento a gtag cuando está disponible", () => {
      // Arrange
      const response: ApiResponse<any> = {
        success: true,
        data: { id: "1" },
        message: "Success",
      };
      const endpoint = "/reservations";
      const method = "GET";

      // Act
      const result = analyticsInterceptor(response, endpoint, method);

      // Assert
      expect(mockGtag).toHaveBeenCalledWith("event", "api_call", {
        event_category: "API",
        event_label: "GET /reservations",
        value: 1,
        success: true,
        method: "GET",
        endpoint: "/reservations",
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[Analytics] Evento enviado: GET /reservations (✓)"
        )
      );

      expect(result).toBe(response);
    });

    it("debe enviar evento con value 0 para errores", () => {
      // Arrange
      const response: ApiResponse<any> = {
        success: false,
        data: null,
        message: "Error occurred",
      };
      const endpoint = "/resources";
      const method = "POST";

      // Act
      analyticsInterceptor(response, endpoint, method);

      // Assert
      expect(mockGtag).toHaveBeenCalledWith("event", "api_call", {
        event_category: "API",
        event_label: "POST /resources",
        value: 0, // Error = 0
        success: false,
        method: "POST",
        endpoint: "/resources",
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[Analytics] Evento enviado: POST /resources (✗)"
        )
      );
    });

    it("debe funcionar con diferentes métodos HTTP", () => {
      const methods = ["GET", "POST", "PATCH", "DELETE", "PUT"];
      const response: ApiResponse<any> = {
        success: true,
        data: {},
        message: "Success",
      };

      methods.forEach((method) => {
        mockGtag.mockClear();

        // Act
        analyticsInterceptor(response, "/test", method);

        // Assert
        expect(mockGtag).toHaveBeenCalledWith(
          "event",
          "api_call",
          expect.objectContaining({
            method,
            event_label: `${method} /test`,
          })
        );
      });
    });

    it("debe enviar eventos para diferentes endpoints", () => {
      const endpoints = [
        "/reservations",
        "/resources/123",
        "/auth/profile",
        "/reports/usage",
      ];
      const response: ApiResponse<any> = {
        success: true,
        data: {},
        message: "Success",
      };

      endpoints.forEach((endpoint) => {
        mockGtag.mockClear();

        // Act
        analyticsInterceptor(response, endpoint, "GET");

        // Assert
        expect(mockGtag).toHaveBeenCalledWith(
          "event",
          "api_call",
          expect.objectContaining({
            endpoint,
            event_label: `GET ${endpoint}`,
          })
        );
      });
    });
  });

  describe("Sin gtag disponible", () => {
    beforeEach(() => {
      // Window sin gtag
      global.window = {
        ...originalWindow,
        gtag: undefined,
      } as any;
    });

    it("no debe fallar cuando gtag no existe", () => {
      // Arrange
      const response: ApiResponse<any> = {
        success: true,
        data: {},
        message: "Success",
      };

      // Act & Assert - No debe lanzar error
      expect(() => {
        analyticsInterceptor(response, "/test", "GET");
      }).not.toThrow();

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it("no debe enviar evento cuando gtag no es función", () => {
      // Arrange
      global.window = {
        ...originalWindow,
        gtag: "not a function" as any,
      } as any;

      const response: ApiResponse<any> = {
        success: true,
        data: {},
        message: "Success",
      };

      // Act
      analyticsInterceptor(response, "/test", "GET");

      // Assert
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe("SSR (sin window)", () => {
    beforeEach(() => {
      // @ts-ignore
      delete global.window;
    });

    afterEach(() => {
      global.window = originalWindow;
    });

    it("no debe fallar en entorno SSR", () => {
      // Arrange
      const response: ApiResponse<any> = {
        success: true,
        data: {},
        message: "Success",
      };

      // Act & Assert
      expect(() => {
        analyticsInterceptor(response, "/test", "GET");
      }).not.toThrow();
    });
  });

  describe("Edge cases", () => {
    it("debe preservar response original", () => {
      // Arrange
      const response: ApiResponse<any> = {
        success: true,
        data: { id: "123", name: "Test" },
        message: "Success",
      };

      // Act
      const result = analyticsInterceptor(response, "/test", "GET");

      // Assert
      expect(result).toBe(response);
      expect(result.data).toEqual({ id: "123", name: "Test" });
    });

    it("debe manejar endpoints con query params", () => {
      // Arrange
      const response: ApiResponse<any> = {
        success: true,
        data: {},
        message: "Success",
      };
      const endpoint = "/reservations?status=CONFIRMED&page=2";

      // Act
      analyticsInterceptor(response, endpoint, "GET");

      // Assert
      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "api_call",
        expect.objectContaining({
          endpoint,
          event_label: `GET ${endpoint}`,
        })
      );
    });

    it("debe manejar response con data null", () => {
      // Arrange
      const response: ApiResponse<any> = {
        success: false,
        data: null,
        message: "Not found",
      };

      // Act & Assert
      expect(() => {
        analyticsInterceptor(response, "/test", "GET");
      }).not.toThrow();

      expect(mockGtag).toHaveBeenCalled();
    });

    it("debe manejar response con data undefined", () => {
      // Arrange
      const response: ApiResponse<any> = {
        success: true,
        data: undefined,
        message: "Success",
      };

      // Act & Assert
      expect(() => {
        analyticsInterceptor(response, "/test", "GET");
      }).not.toThrow();
    });
  });
});
