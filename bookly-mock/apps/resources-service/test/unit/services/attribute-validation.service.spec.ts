import { ResourceType } from "@libs/common/enums";
import { BadRequestException } from "@nestjs/common";
import { AttributeValidationService } from "../../../src/application/services/attribute-validation.service";

describe("AttributeValidationService", () => {
  let service: AttributeValidationService;

  beforeEach(() => {
    service = new AttributeValidationService();
  });

  // --- RF-03: Definir Atributos Clave del Recurso ---

  describe("validate", () => {
    it("Given valid CLASSROOM attributes, When validate is called, Then it should return isValid=true", () => {
      const result = service.validate(ResourceType.CLASSROOM, {
        capacity: 30,
        hasProjector: true,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("Given CLASSROOM without required capacity, When validate is called, Then it should return errors", () => {
      const result = service.validate(ResourceType.CLASSROOM, {
        hasProjector: true,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("Given invalid type for an attribute, When validate is called, Then it should return error", () => {
      const result = service.validate(ResourceType.CLASSROOM, {
        capacity: "not-a-number",
      });

      expect(result.isValid).toBe(false);
    });

    it("Given AUDITORIUM with capacity below minimum, When validate is called, Then it should return error", () => {
      const result = service.validate(ResourceType.AUDITORIUM, {
        capacity: 10,
      });

      expect(result.isValid).toBe(false);
    });
  });

  describe("validateOrThrow", () => {
    it("Given invalid attributes, When validateOrThrow is called, Then it should throw BadRequestException", () => {
      expect(() =>
        service.validateOrThrow(ResourceType.CLASSROOM, {})
      ).toThrow(BadRequestException);
    });

    it("Given valid attributes, When validateOrThrow is called, Then it should not throw", () => {
      expect(() =>
        service.validateOrThrow(ResourceType.CLASSROOM, { capacity: 30 })
      ).not.toThrow();
    });
  });
});
