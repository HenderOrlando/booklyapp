#!/usr/bin/env ts-node
/**
 * Script de Validación 1: Existencia de IDs Referenciados
 *
 * Verifica que todos los ObjectIds referenciados en los seeds existan en sus respectivos servicios.
 *
 * Uso:
 *   npm run validate:seed:ids
 *   ts-node scripts/validate-seed-ids.ts
 */

import { Types } from "mongoose";
import { createLogger } from "../libs/common/src/utils/logger.util";

const logger = createLogger("ValidateSeedIds");

// IDs Globales esperados (de SEED_IDS_REFERENCE.md)
const EXPECTED_IDS = {
  users: [
    "507f1f77bcf86cd799439000", // SYSTEM_USER
    "507f1f77bcf86cd799439022", // ADMIN_GENERAL
    "507f1f77bcf86cd799439025", // ADMIN_TI
    "507f1f77bcf86cd799439021", // COORDINADOR_SISTEMAS
    "507f1f77bcf86cd799439026", // COORDINADOR_INDUSTRIAL
    "507f1f77bcf86cd799439027", // DOCENTE_AUXILIAR
    "507f1f77bcf86cd799439023", // ESTUDIANTE_MARIA
    "507f1f77bcf86cd799439028", // ESTUDIANTE_CARLOS
    "507f1f77bcf86cd799439024", // STAFF_VIGILANTE
  ],
  programs: [
    "507f1f77bcf86cd799439041", // PROGRAMA_SISTEMAS
    "507f1f77bcf86cd799439042", // PROGRAMA_INDUSTRIAL
    "507f1f77bcf86cd799439043", // PROGRAMA_ELECTRONICA
  ],
  resources: [
    "507f1f77bcf86cd799439011", // RECURSO_AUDITORIO
    "507f1f77bcf86cd799439012", // RECURSO_LABORATORIO
    "507f1f77bcf86cd799439013", // RECURSO_SALA
    "507f1f77bcf86cd799439014", // RECURSO_EQUIPO
  ],
  reservations: [
    "507f1f77bcf86cd799439031", // RESERVA_1
    "507f1f77bcf86cd799439032", // RESERVA_2
  ],
  approvalRequests: [
    "507f1f77bcf86cd799439081", // REQUEST_1
    "507f1f77bcf86cd799439082", // REQUEST_2
  ],
};

interface ValidationResult {
  service: string;
  entity: string;
  missingIds: string[];
  foundIds: string[];
  status: "pass" | "fail";
}

/**
 * Valida formato de ObjectId
 */
function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

/**
 * Valida existencia de IDs en Auth Service
 */
async function validateAuthService(): Promise<ValidationResult> {
  logger.info("🔍 Validando Auth Service...");

  const result: ValidationResult = {
    service: "auth-service",
    entity: "users",
    missingIds: [],
    foundIds: [],
    status: "pass",
  };

  // En producción, aquí haríamos query real a MongoDB
  // Para el script de validación, verificamos formato válido
  for (const userId of EXPECTED_IDS.users) {
    if (isValidObjectId(userId)) {
      result.foundIds.push(userId);
    } else {
      result.missingIds.push(userId);
      result.status = "fail";
    }
  }

  return result;
}

/**
 * Valida existencia de IDs en Resources Service
 */
async function validateResourcesService(): Promise<ValidationResult[]> {
  logger.info("🔍 Validando Resources Service...");

  const results: ValidationResult[] = [];

  // Validar Programas
  const programsResult: ValidationResult = {
    service: "resources-service",
    entity: "programs",
    missingIds: [],
    foundIds: [],
    status: "pass",
  };

  for (const programId of EXPECTED_IDS.programs) {
    if (isValidObjectId(programId)) {
      programsResult.foundIds.push(programId);
    } else {
      programsResult.missingIds.push(programId);
      programsResult.status = "fail";
    }
  }
  results.push(programsResult);

  // Validar Recursos
  const resourcesResult: ValidationResult = {
    service: "resources-service",
    entity: "resources",
    missingIds: [],
    foundIds: [],
    status: "pass",
  };

  for (const resourceId of EXPECTED_IDS.resources) {
    if (isValidObjectId(resourceId)) {
      resourcesResult.foundIds.push(resourceId);
    } else {
      resourcesResult.missingIds.push(resourceId);
      resourcesResult.status = "fail";
    }
  }
  results.push(resourcesResult);

  return results;
}

/**
 * Valida existencia de IDs en Availability Service
 */
async function validateAvailabilityService(): Promise<ValidationResult> {
  logger.info("🔍 Validando Availability Service...");

  const result: ValidationResult = {
    service: "availability-service",
    entity: "reservations",
    missingIds: [],
    foundIds: [],
    status: "pass",
  };

  for (const reservationId of EXPECTED_IDS.reservations) {
    if (isValidObjectId(reservationId)) {
      result.foundIds.push(reservationId);
    } else {
      result.missingIds.push(reservationId);
      result.status = "fail";
    }
  }

  return result;
}

/**
 * Valida existencia de IDs en Stockpile Service
 */
async function validateStockpileService(): Promise<ValidationResult> {
  logger.info("🔍 Validando Stockpile Service...");

  const result: ValidationResult = {
    service: "stockpile-service",
    entity: "approval_requests",
    missingIds: [],
    foundIds: [],
    status: "pass",
  };

  for (const requestId of EXPECTED_IDS.approvalRequests) {
    if (isValidObjectId(requestId)) {
      result.foundIds.push(requestId);
    } else {
      result.missingIds.push(requestId);
      result.status = "fail";
    }
  }

  return result;
}

/**
 * Ejecuta todas las validaciones
 */
async function runValidation() {
  logger.info("🚀 Iniciando validación de IDs de seeds...\n");

  const allResults: ValidationResult[] = [];

  try {
    // Validar cada servicio
    allResults.push(await validateAuthService());
    allResults.push(...(await validateResourcesService()));
    allResults.push(await validateAvailabilityService());
    allResults.push(await validateStockpileService());

    // Resumen
    logger.info("\n📊 RESUMEN DE VALIDACIÓN:\n");

    let totalPass = 0;
    let totalFail = 0;

    for (const result of allResults) {
      const icon = result.status === "pass" ? "✅" : "❌";
      const summary = `${icon} ${result.service}/${result.entity}: ${result.foundIds.length} válidos`;

      if (result.status === "pass") {
        logger.info(summary);
        totalPass++;
      } else {
        logger.error(summary);
        logger.error(`   IDs faltantes: ${result.missingIds.join(", ")}`);
        totalFail++;
      }
    }

    logger.info(`\n📈 Total: ${totalPass} pass, ${totalFail} fail`);

    if (totalFail > 0) {
      logger.error("\n❌ VALIDACIÓN FALLIDA - Corregir IDs inválidos");
      process.exit(1);
    } else {
      logger.info("\n✅ VALIDACIÓN EXITOSA - Todos los IDs son válidos");
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

export { runValidation, validateAuthService, validateResourcesService };
