import { ResourceType } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { BadRequestException, Injectable } from "@nestjs/common";

/**
 * Esquema de atributos por tipo de recurso
 */
interface AttributeSchema {
  type: string;
  required?: boolean;
  properties?: Record<string, AttributeSchema>;
  items?: AttributeSchema;
  enum?: string[];
  min?: number;
  max?: number;
}

/**
 * Attribute Validation Service
 * Servicio para validar atributos JSON de recursos según esquemas definidos
 */
@Injectable()
export class AttributeValidationService {
  private readonly logger = createLogger("AttributeValidationService");

  /**
   * Esquemas de validación por tipo de recurso
   */
  private readonly schemas: Record<
    ResourceType,
    Record<string, AttributeSchema>
  > = {
    [ResourceType.CLASSROOM]: {
      capacity: { type: "number", required: true, min: 1 },
      equipment: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "projector",
            "whiteboard",
            "screen",
            "air_conditioning",
            "sound_system",
            "microphone",
            "computer",
          ],
        },
      },
      hasProjector: { type: "boolean" },
      hasWhiteboard: { type: "boolean" },
      hasAirConditioning: { type: "boolean" },
      boardType: { type: "string", enum: ["traditional", "digital", "both"] },
    },
    [ResourceType.LABORATORY]: {
      capacity: { type: "number", required: true, min: 1 },
      labType: {
        type: "string",
        required: true,
        enum: ["computer", "chemistry", "physics", "biology", "electronics"],
      },
      equipment: {
        type: "array",
        items: { type: "string" },
      },
      workstations: { type: "number", min: 1 },
      hasSpecialVentilation: { type: "boolean" },
      hasEmergencyShower: { type: "boolean" },
      chemicalsAllowed: { type: "boolean" },
    },
    [ResourceType.AUDITORIUM]: {
      capacity: { type: "number", required: true, min: 50 },
      equipment: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "sound_system",
            "projector",
            "screen",
            "stage",
            "lighting",
            "microphones",
            "recording_equipment",
          ],
        },
      },
      hasStage: { type: "boolean" },
      hasSoundSystem: { type: "boolean", required: true },
      hasLighting: { type: "boolean" },
      seatingType: { type: "string", enum: ["fixed", "movable", "mixed"] },
      acousticTreatment: { type: "boolean" },
    },
    [ResourceType.MULTIMEDIA_EQUIPMENT]: {
      equipmentType: {
        type: "string",
        required: true,
        enum: [
          "projector",
          "screen",
          "camera",
          "microphone",
          "speaker",
          "laptop",
          "tablet",
          "recording_device",
        ],
      },
      brand: { type: "string" },
      model: { type: "string" },
      serialNumber: { type: "string" },
      acquisitionDate: { type: "string" },
      warrantyExpiration: { type: "string" },
      isPortable: { type: "boolean", required: true },
      requiresSetup: { type: "boolean" },
    },
    [ResourceType.SPORTS_FACILITY]: {
      capacity: { type: "number", required: true, min: 1 },
      sportType: {
        type: "string",
        required: true,
        enum: [
          "soccer",
          "basketball",
          "volleyball",
          "tennis",
          "athletics",
          "swimming",
          "gym",
        ],
      },
      surfaceType: {
        type: "string",
        enum: ["grass", "synthetic", "concrete", "wood", "clay", "tartan"],
      },
      isIndoor: { type: "boolean", required: true },
      hasLocker: { type: "boolean" },
      hasShowers: { type: "boolean" },
      lighting: { type: "string", enum: ["natural", "artificial", "both"] },
    },
    [ResourceType.MEETING_ROOM]: {
      capacity: { type: "number", required: true, min: 2, max: 50 },
      equipment: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "projector",
            "screen",
            "whiteboard",
            "conference_phone",
            "video_conference",
            "air_conditioning",
          ],
        },
      },
      hasVideoConference: { type: "boolean" },
      hasWhiteboard: { type: "boolean" },
      tableConfiguration: {
        type: "string",
        enum: ["u_shape", "boardroom", "classroom", "theater", "custom"],
      },
      isPrivate: { type: "boolean" },
    },
  };

  /**
   * Validar atributos de un recurso
   */
  validateAttributes(
    resourceType: ResourceType,
    attributes: Record<string, any>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!attributes || typeof attributes !== "object") {
      return {
        valid: true,
        errors: [],
      };
    }

    const schema = this.schemas[resourceType];
    if (!schema) {
      this.logger.warn(`No schema defined for resource type: ${resourceType}`);
      return { valid: true, errors: [] };
    }

    // Validar campos requeridos
    for (const [field, fieldSchema] of Object.entries(schema)) {
      if (fieldSchema.required && !(field in attributes)) {
        errors.push(`Required attribute '${field}' is missing`);
      }
    }

    // Validar cada atributo proporcionado
    for (const [field, value] of Object.entries(attributes)) {
      const fieldSchema = schema[field];

      if (!fieldSchema) {
        this.logger.debug(
          `Unknown attribute '${field}' for type ${resourceType}`
        );
        continue;
      }

      const fieldErrors = this.validateField(field, value, fieldSchema);
      errors.push(...fieldErrors);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validar un campo individual
   */
  private validateField(
    fieldName: string,
    value: any,
    schema: AttributeSchema
  ): string[] {
    const errors: string[] = [];

    // Validar tipo
    if (schema.type === "string" && typeof value !== "string") {
      errors.push(`Attribute '${fieldName}' must be a string`);
    } else if (schema.type === "number" && typeof value !== "number") {
      errors.push(`Attribute '${fieldName}' must be a number`);
    } else if (schema.type === "boolean" && typeof value !== "boolean") {
      errors.push(`Attribute '${fieldName}' must be a boolean`);
    } else if (schema.type === "array" && !Array.isArray(value)) {
      errors.push(`Attribute '${fieldName}' must be an array`);
    }

    // Validar enum
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(
        `Attribute '${fieldName}' must be one of: ${schema.enum.join(", ")}`
      );
    }

    // Validar min/max para números
    if (schema.type === "number" && typeof value === "number") {
      if (schema.min !== undefined && value < schema.min) {
        errors.push(`Attribute '${fieldName}' must be at least ${schema.min}`);
      }
      if (schema.max !== undefined && value > schema.max) {
        errors.push(`Attribute '${fieldName}' must be at most ${schema.max}`);
      }
    }

    // Validar items de array
    if (schema.type === "array" && Array.isArray(value) && schema.items) {
      value.forEach((item, index) => {
        const itemErrors = this.validateField(
          `${fieldName}[${index}]`,
          item,
          schema.items!
        );
        errors.push(...itemErrors);
      });
    }

    return errors;
  }

  /**
   * Validar y lanzar excepción si hay errores
   */
  validateOrThrow(
    resourceType: ResourceType,
    attributes: Record<string, any>
  ): void {
    const { valid, errors } = this.validateAttributes(resourceType, attributes);

    if (!valid) {
      const errorMessage = `Attribute validation failed for ${resourceType}: ${errors.join(", ")}`;
      this.logger.error(errorMessage);

      throw new BadRequestException({
        message: "Invalid attributes",
        errors,
      });
    }

    this.logger.debug("Attributes validated successfully", {
      resourceType,
      attributeCount: Object.keys(attributes || {}).length,
    });
  }

  /**
   * Obtener esquema para un tipo de recurso
   */
  getSchema(resourceType: ResourceType): Record<string, AttributeSchema> {
    return this.schemas[resourceType] || {};
  }

  /**
   * Obtener lista de atributos requeridos
   */
  getRequiredAttributes(resourceType: ResourceType): string[] {
    const schema = this.schemas[resourceType];
    if (!schema) return [];

    return Object.entries(schema)
      .filter(([_, fieldSchema]) => fieldSchema.required)
      .map(([field]) => field);
  }
}
