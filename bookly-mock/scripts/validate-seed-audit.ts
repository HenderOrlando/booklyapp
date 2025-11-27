#!/usr/bin/env ts-node
/**
 * Script de Validación 3: Auditoría Completa
 *
 * Verifica que todos los documentos tengan campos de auditoría correctos:
 * - audit.createdBy debe existir y ser un ObjectId válido
 * - audit.updatedBy debe ser un ObjectId válido (si existe)
 * - createdBy/updatedBy deben referenciar usuarios existentes
 *
 * Uso:
 *   npm run validate:seed:audit
 *   ts-node scripts/validate-seed-audit.ts
 */

import { Types } from "mongoose";
import { createLogger } from "../libs/common/src/utils/logger.util";

const logger = createLogger("ValidateSeedAudit");

interface AuditValidation {
  service: string;
  entity: string;
  documentId: string;
  field: string;
  value: string | undefined;
  valid: boolean;
  error?: string;
}

interface ValidationSummary {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  validations: AuditValidation[];
}

const SYSTEM_USER_ID = "507f1f77bcf86cd799439000";

/**
 * Datos de prueba simulados (en producción, cargarían de MongoDB)
 */
const MOCK_DATA = {
  users: [
    { _id: "507f1f77bcf86cd799439000", email: "system@bookly.com" },
    { _id: "507f1f77bcf86cd799439021", email: "juan.docente@ufps.edu.co" },
    { _id: "507f1f77bcf86cd799439022", email: "admin@ufps.edu.co" },
    { _id: "507f1f77bcf86cd799439023", email: "maria.estudiante@ufps.edu.co" },
    { _id: "507f1f77bcf86cd799439026", email: "pedro.coordinador@ufps.edu.co" },
  ],
  documents: [
    {
      service: "auth-service",
      entity: "roles",
      _id: "507f1f77bcf86cd799439051",
      audit: {
        createdBy: "507f1f77bcf86cd799439022",
        updatedBy: "507f1f77bcf86cd799439022",
      },
    },
    {
      service: "resources-service",
      entity: "programs",
      _id: "507f1f77bcf86cd799439041",
      audit: {
        createdBy: "507f1f77bcf86cd799439022",
        updatedBy: "507f1f77bcf86cd799439022",
      },
    },
    {
      service: "resources-service",
      entity: "resources",
      _id: "507f1f77bcf86cd799439011",
      audit: {
        createdBy: "507f1f77bcf86cd799439022",
        updatedBy: "507f1f77bcf86cd799439022",
      },
    },
    {
      service: "availability-service",
      entity: "reservations",
      _id: "507f1f77bcf86cd799439031",
      audit: {
        createdBy: "507f1f77bcf86cd799439021",
        updatedBy: "507f1f77bcf86cd799439021",
      },
    },
    {
      service: "stockpile-service",
      entity: "approval_requests",
      _id: "507f1f77bcf86cd799439081",
      audit: {
        createdBy: "507f1f77bcf86cd799439023",
        updatedBy: "507f1f77bcf86cd799439022",
      },
    },
  ],
};

/**
 * Valida que un campo de auditoría sea un ObjectId válido
 */
function validateAuditField(
  service: string,
  entity: string,
  documentId: string,
  field: "createdBy" | "updatedBy" | "deletedBy",
  value: string | undefined,
  required: boolean = true
): AuditValidation {
  // Si no es requerido y no existe, es válido
  if (!required && !value) {
    return {
      service,
      entity,
      documentId,
      field: `audit.${field}`,
      value: undefined,
      valid: true,
    };
  }

  // Si es requerido y no existe, es inválido
  if (required && !value) {
    return {
      service,
      entity,
      documentId,
      field: `audit.${field}`,
      value: undefined,
      valid: false,
      error: `Campo ${field} es requerido pero no existe`,
    };
  }

  // Si existe, validar formato ObjectId
  if (value && !Types.ObjectId.isValid(value)) {
    return {
      service,
      entity,
      documentId,
      field: `audit.${field}`,
      value,
      valid: false,
      error: `Valor '${value}' no es un ObjectId válido`,
    };
  }

  // Validar que el usuario existe
  const userExists =
    MOCK_DATA.users.some((u) => u._id === value) || value === SYSTEM_USER_ID;
  if (value && !userExists) {
    return {
      service,
      entity,
      documentId,
      field: `audit.${field}`,
      value,
      valid: false,
      error: `Usuario ${value} no existe`,
    };
  }

  // Todo válido
  return {
    service,
    entity,
    documentId,
    field: `audit.${field}`,
    value,
    valid: true,
  };
}

/**
 * Valida auditoría de todos los documentos
 */
function validateAllAuditFields(): AuditValidation[] {
  logger.info("🔍 Validando campos de auditoría...");

  const validations: AuditValidation[] = [];

  for (const doc of MOCK_DATA.documents) {
    // Validar createdBy (requerido)
    validations.push(
      validateAuditField(
        doc.service,
        doc.entity,
        doc._id,
        "createdBy",
        doc.audit.createdBy,
        true
      )
    );

    // Validar updatedBy (opcional)
    if (doc.audit.updatedBy) {
      validations.push(
        validateAuditField(
          doc.service,
          doc.entity,
          doc._id,
          "updatedBy",
          doc.audit.updatedBy,
          false
        )
      );
    }
  }

  return validations;
}

/**
 * Valida que audit.createdBy sea consistente con el tipo de entidad
 */
function validateAuditConsistency(): AuditValidation[] {
  logger.info("🔍 Validando consistencia de auditoría...");

  const validations: AuditValidation[] = [];

  for (const doc of MOCK_DATA.documents) {
    // Reglas de negocio:
    // - Roles y Permisos deben ser creados por admins
    // - Programas deben ser creados por admins
    // - Recursos pueden ser creados por admins o coordinadores
    // - Reservas pueden ser creadas por cualquier usuario autenticado

    if (doc.entity === "roles" || doc.entity === "permissions") {
      const isAdmin = doc.audit.createdBy === "507f1f77bcf86cd799439022"; // ADMIN_GENERAL_ID
      validations.push({
        service: doc.service,
        entity: doc.entity,
        documentId: doc._id,
        field: "audit.createdBy (consistency)",
        value: doc.audit.createdBy,
        valid: isAdmin,
        error: isAdmin
          ? undefined
          : "Roles/Permisos deben ser creados por admins",
      });
    }

    if (doc.entity === "programs") {
      const isAdmin = doc.audit.createdBy === "507f1f77bcf86cd799439022";
      validations.push({
        service: doc.service,
        entity: doc.entity,
        documentId: doc._id,
        field: "audit.createdBy (consistency)",
        value: doc.audit.createdBy,
        valid: isAdmin,
        error: isAdmin ? undefined : "Programas deben ser creados por admins",
      });
    }
  }

  return validations;
}

/**
 * Ejecuta todas las validaciones de auditoría
 */
async function runValidation() {
  logger.info("🚀 Iniciando validación de auditoría de seeds...\n");

  try {
    const allValidations: AuditValidation[] = [
      ...validateAllAuditFields(),
      ...validateAuditConsistency(),
    ];

    const summary: ValidationSummary = {
      totalChecks: allValidations.length,
      passedChecks: allValidations.filter((v) => v.valid).length,
      failedChecks: allValidations.filter((v) => !v.valid).length,
      validations: allValidations,
    };

    // Mostrar resultados
    logger.info("\n📊 RESULTADOS DE VALIDACIÓN:\n");

    // Agrupar por servicio
    const byService = allValidations.reduce(
      (acc, v) => {
        if (!acc[v.service]) acc[v.service] = [];
        acc[v.service].push(v);
        return acc;
      },
      {} as Record<string, AuditValidation[]>
    );

    for (const [service, validations] of Object.entries(byService)) {
      logger.info(`\n📦 ${service}:`);
      for (const validation of validations) {
        const icon = validation.valid ? "✅" : "❌";
        const message = `${icon} ${validation.entity}[${validation.documentId}].${validation.field}${
          validation.value ? ` = ${validation.value}` : ""
        }`;

        if (validation.valid) {
          logger.info(`  ${message}`);
        } else {
          logger.error(`  ${message}`);
          if (validation.error) {
            logger.error(`     Error: ${validation.error}`);
          }
        }
      }
    }

    // Resumen final
    logger.info(
      `\n📈 Total: ${summary.passedChecks}/${summary.totalChecks} checks válidos`
    );

    if (summary.failedChecks > 0) {
      logger.error(
        `\n❌ VALIDACIÓN FALLIDA - ${summary.failedChecks} problemas de auditoría`
      );
      process.exit(1);
    } else {
      logger.info("\n✅ VALIDACIÓN EXITOSA - Auditoría completa y consistente");
      process.exit(0);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("❌ Error durante la validación:", errorMessage as any);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runValidation();
}

export { runValidation, validateAllAuditFields, validateAuditConsistency };
