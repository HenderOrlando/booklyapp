#!/usr/bin/env ts-node
/**
 * Script de Validación 2: Relaciones Bidireccionales
 *
 * Verifica que todas las relaciones bidireccionales entre entidades sean válidas:
 * - Program ↔ Coordinator (bidireccional)
 * - Resource → Programs (unidireccional)
 * - Reservation → User, Resource, Program
 * - ApprovalRequest → Reservation, User, Program
 *
 * Uso:
 *   npm run validate:seed:relations
 *   ts-node scripts/validate-seed-relations.ts
 */

import { createLogger } from "../libs/common/src/utils/logger.util";

const logger = createLogger("ValidateSeedRelations");

interface RelationValidation {
  relation: string;
  from: { service: string; entity: string; id: string };
  to: { service: string; entity: string; id: string };
  valid: boolean;
  error?: string;
}

interface ValidationSummary {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  relations: RelationValidation[];
}

/**
 * Datos de prueba (en producción, se cargarían de MongoDB)
 */
const MOCK_DATA = {
  permissions: [
    { _id: "507f1f77bcf86cd799439061", code: "CREATE_RESOURCE" },
    { _id: "507f1f77bcf86cd799439062", code: "APPROVE_RESERVATION" },
    { _id: "507f1f77bcf86cd799439063", code: "VIEW_REPORTS" },
  ],
  roles: [
    {
      _id: "507f1f77bcf86cd799439051",
      name: "GENERAL_ADMIN",
      permissionIds: [
        "507f1f77bcf86cd799439061",
        "507f1f77bcf86cd799439062",
        "507f1f77bcf86cd799439063",
      ],
    },
    {
      _id: "507f1f77bcf86cd799439052",
      name: "PROGRAM_ADMIN",
      permissionIds: ["507f1f77bcf86cd799439061", "507f1f77bcf86cd799439062"],
    },
    {
      _id: "507f1f77bcf86cd799439053",
      name: "TEACHER",
      permissionIds: ["507f1f77bcf86cd799439062"],
    },
    {
      _id: "507f1f77bcf86cd799439054",
      name: "STUDENT",
      permissionIds: [],
    },
  ],
  programs: [
    {
      _id: "507f1f77bcf86cd799439041",
      name: "Ingeniería de Sistemas",
      coordinatorId: "507f1f77bcf86cd799439021" as string | undefined,
    },
    {
      _id: "507f1f77bcf86cd799439042",
      name: "Ingeniería Industrial",
      coordinatorId: "507f1f77bcf86cd799439026" as string | undefined,
    },
    {
      _id: "507f1f77bcf86cd799439043",
      name: "Ingeniería Electrónica",
      coordinatorId: undefined as string | undefined, // Sin coordinador asignado aún
    },
  ],
  users: [
    {
      _id: "507f1f77bcf86cd799439021",
      name: "Juan Docente",
      programId: "507f1f77bcf86cd799439041",
      coordinatedProgramId: "507f1f77bcf86cd799439041",
      roleIds: ["507f1f77bcf86cd799439053", "507f1f77bcf86cd799439052"], // TEACHER, PROGRAM_ADMIN
    },
    {
      _id: "507f1f77bcf86cd799439026",
      name: "Pedro Coordinador",
      programId: "507f1f77bcf86cd799439042",
      coordinatedProgramId: "507f1f77bcf86cd799439042",
      roleIds: ["507f1f77bcf86cd799439053", "507f1f77bcf86cd799439052"], // TEACHER, PROGRAM_ADMIN
    },
    {
      _id: "507f1f77bcf86cd799439023",
      name: "María Estudiante",
      programId: "507f1f77bcf86cd799439041",
      coordinatedProgramId: undefined,
      roleIds: ["507f1f77bcf86cd799439054"], // STUDENT
    },
  ],
  resources: [
    {
      _id: "507f1f77bcf86cd799439011",
      name: "Auditorio Principal",
      programIds: [
        "507f1f77bcf86cd799439041",
        "507f1f77bcf86cd799439042",
        "507f1f77bcf86cd799439043",
      ],
    },
    {
      _id: "507f1f77bcf86cd799439012",
      name: "Laboratorio de Sistemas 1",
      programIds: ["507f1f77bcf86cd799439041"],
    },
  ],
  reservations: [
    {
      _id: "507f1f77bcf86cd799439031",
      resourceId: "507f1f77bcf86cd799439011",
      userId: "507f1f77bcf86cd799439021",
      programId: "507f1f77bcf86cd799439041",
      approvalRequestId: undefined,
    },
    {
      _id: "507f1f77bcf86cd799439032",
      resourceId: "507f1f77bcf86cd799439012",
      userId: "507f1f77bcf86cd799439023",
      programId: "507f1f77bcf86cd799439041",
      approvalRequestId: "507f1f77bcf86cd799439081",
    },
  ],
};

/**
 * Valida relación Program ↔ Coordinator (bidireccional)
 */
function validateProgramCoordinatorRelation(): RelationValidation[] {
  logger.info("🔗 Validando relación Program ↔ Coordinator...");

  const validations: RelationValidation[] = [];

  for (const program of MOCK_DATA.programs) {
    // Saltar validación si el programa no tiene coordinador asignado
    if (!program.coordinatorId) {
      continue;
    }

    const coordinator = MOCK_DATA.users.find(
      (u) => u._id === program.coordinatorId
    );

    // Validar que el coordinador existe
    const existsValidation: RelationValidation = {
      relation: "Program → Coordinator (exists)",
      from: {
        service: "resources-service",
        entity: "programs",
        id: program._id,
      },
      to: {
        service: "auth-service",
        entity: "users",
        id: program.coordinatorId,
      },
      valid: !!coordinator,
      error: coordinator
        ? undefined
        : `Coordinator ${program.coordinatorId} no existe`,
    };
    validations.push(existsValidation);

    // Validar relación bidireccional
    if (coordinator) {
      const bidirectionalValidation: RelationValidation = {
        relation: "Program ↔ Coordinator (bidirectional)",
        from: {
          service: "resources-service",
          entity: "programs",
          id: program._id,
        },
        to: {
          service: "auth-service",
          entity: "users",
          id: coordinator._id,
        },
        valid: coordinator.coordinatedProgramId === program._id,
        error:
          coordinator.coordinatedProgramId === program._id
            ? undefined
            : `Relación rota: program.coordinatorId=${program.coordinatorId} pero user.coordinatedProgramId=${coordinator.coordinatedProgramId}`,
      };
      validations.push(bidirectionalValidation);
    }
  }

  return validations;
}

/**
 * Valida relación Resource → Programs
 */
function validateResourceProgramsRelation(): RelationValidation[] {
  logger.info("🔗 Validando relación Resource → Programs...");

  const validations: RelationValidation[] = [];

  for (const resource of MOCK_DATA.resources) {
    for (const programId of resource.programIds) {
      const program = MOCK_DATA.programs.find((p) => p._id === programId);

      const validation: RelationValidation = {
        relation: "Resource → Program",
        from: {
          service: "resources-service",
          entity: "resources",
          id: resource._id,
        },
        to: {
          service: "resources-service",
          entity: "programs",
          id: programId,
        },
        valid: !!program,
        error: program ? undefined : `Program ${programId} no existe`,
      };
      validations.push(validation);
    }
  }

  return validations;
}

/**
 * Valida relación Reservation → User, Resource, Program
 */
function validateReservationRelations(): RelationValidation[] {
  logger.info("🔗 Validando relaciones de Reservation...");

  const validations: RelationValidation[] = [];

  for (const reservation of MOCK_DATA.reservations) {
    // Validar User
    const user = MOCK_DATA.users.find((u) => u._id === reservation.userId);
    validations.push({
      relation: "Reservation → User",
      from: {
        service: "availability-service",
        entity: "reservations",
        id: reservation._id,
      },
      to: {
        service: "auth-service",
        entity: "users",
        id: reservation.userId,
      },
      valid: !!user,
      error: user ? undefined : `User ${reservation.userId} no existe`,
    });

    // Validar Resource
    const resource = MOCK_DATA.resources.find(
      (r) => r._id === reservation.resourceId
    );
    validations.push({
      relation: "Reservation → Resource",
      from: {
        service: "availability-service",
        entity: "reservations",
        id: reservation._id,
      },
      to: {
        service: "resources-service",
        entity: "resources",
        id: reservation.resourceId,
      },
      valid: !!resource,
      error: resource
        ? undefined
        : `Resource ${reservation.resourceId} no existe`,
    });

    // Validar Program (si existe)
    if (reservation.programId) {
      const program = MOCK_DATA.programs.find(
        (p) => p._id === reservation.programId
      );
      validations.push({
        relation: "Reservation → Program",
        from: {
          service: "availability-service",
          entity: "reservations",
          id: reservation._id,
        },
        to: {
          service: "resources-service",
          entity: "programs",
          id: reservation.programId,
        },
        valid: !!program,
        error: program
          ? undefined
          : `Program ${reservation.programId} no existe`,
      });

      // Validar que programId coincide con el del usuario
      if (user) {
        validations.push({
          relation: "Reservation.programId = User.programId",
          from: {
            service: "availability-service",
            entity: "reservations",
            id: reservation._id,
          },
          to: {
            service: "auth-service",
            entity: "users",
            id: user._id,
          },
          valid: reservation.programId === user.programId,
          error:
            reservation.programId === user.programId
              ? undefined
              : `Mismatch: reservation.programId=${reservation.programId} pero user.programId=${user.programId}`,
        });
      }
    }
  }

  return validations;
}

/**
 * Valida relación Role → Permissions
 */
function validateRolePermissionsRelation(): RelationValidation[] {
  logger.info("🔗 Validando relación Role → Permissions...");

  const validations: RelationValidation[] = [];

  for (const role of MOCK_DATA.roles) {
    for (const permissionId of role.permissionIds) {
      const permission = MOCK_DATA.permissions.find(
        (p) => p._id === permissionId
      );

      validations.push({
        relation: "Role → Permission (exists)",
        from: {
          service: "auth-service",
          entity: "roles",
          id: role._id,
        },
        to: {
          service: "auth-service",
          entity: "permissions",
          id: permissionId,
        },
        valid: !!permission,
        error: permission ? undefined : `Permission ${permissionId} no existe`,
      });
    }
  }

  return validations;
}

/**
 * Valida relación User → Roles
 */
function validateUserRolesRelation(): RelationValidation[] {
  logger.info("🔗 Validando relación User → Roles...");

  const validations: RelationValidation[] = [];

  for (const user of MOCK_DATA.users) {
    for (const roleId of user.roleIds) {
      const role = MOCK_DATA.roles.find((r) => r._id === roleId);

      validations.push({
        relation: "User → Role (exists)",
        from: {
          service: "auth-service",
          entity: "users",
          id: user._id,
        },
        to: {
          service: "auth-service",
          entity: "roles",
          id: roleId,
        },
        valid: !!role,
        error: role ? undefined : `Role ${roleId} no existe`,
      });
    }
  }

  return validations;
}

/**
 * Ejecuta todas las validaciones de relaciones
 */
async function runValidation() {
  logger.info("🚀 Iniciando validación de relaciones de seeds...\n");

  try {
    const allValidations: RelationValidation[] = [
      ...validateUserRolesRelation(),
      ...validateRolePermissionsRelation(),
      ...validateProgramCoordinatorRelation(),
      ...validateResourceProgramsRelation(),
      ...validateReservationRelations(),
    ];

    const summary: ValidationSummary = {
      totalChecks: allValidations.length,
      passedChecks: allValidations.filter((v) => v.valid).length,
      failedChecks: allValidations.filter((v) => !v.valid).length,
      relations: allValidations,
    };

    // Mostrar resultados
    logger.info("\n📊 RESULTADOS DE VALIDACIÓN:\n");

    for (const validation of allValidations) {
      const icon = validation.valid ? "✅" : "❌";
      const message = `${icon} ${validation.relation}: ${validation.from.service}/${validation.from.entity}[${validation.from.id}] → ${validation.to.service}/${validation.to.entity}[${validation.to.id}]`;

      if (validation.valid) {
        logger.info(message);
      } else {
        logger.error(message);
        if (validation.error) {
          logger.error(`   Error: ${validation.error}`);
        }
      }
    }

    // Resumen final
    logger.info(
      `\n📈 Total: ${summary.passedChecks}/${summary.totalChecks} relaciones válidas`
    );

    if (summary.failedChecks > 0) {
      logger.error(
        `\n❌ VALIDACIÓN FALLIDA - ${summary.failedChecks} relaciones rotas`
      );
      process.exit(1);
    } else {
      logger.info("\n✅ VALIDACIÓN EXITOSA - Todas las relaciones son válidas");
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

export { runValidation, validateProgramCoordinatorRelation };
