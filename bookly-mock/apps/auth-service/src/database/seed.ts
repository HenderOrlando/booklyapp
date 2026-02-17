import { createLogger } from "@libs/common";
import { ReferenceDataRepository } from "@libs/database";
import { NestFactory } from "@nestjs/core";
import { getModelToken } from "@nestjs/mongoose";
import * as bcrypt from "bcryptjs";
import { Model } from "mongoose";
import { AuthModule } from "../auth.module";
import { Permission } from "../infrastructure/schemas/permission.schema";
import { Role } from "../infrastructure/schemas/role.schema";
import { User } from "../infrastructure/schemas/user.schema";
import { ALL_PERMISSIONS } from "./permissions.seed-data";
import { AUTH_REFERENCE_DATA } from "./reference-data.seed-data";
import { ALL_ROLES } from "./roles.seed-data";

const logger = createLogger("AuthSeed");

/**
 * Seed de permisos
 */
async function seedPermissions(
  permissionModel: Model<Permission>,
): Promise<Map<string, string>> {
  logger.info("🔑 Sembrando permisos...");

  const permissionMap = new Map<string, string>();

  for (const permData of ALL_PERMISSIONS) {
    const permission = await permissionModel.findOneAndUpdate(
      { code: permData.code },
      {
        ...permData,
        audit: {
          createdBy: "system",
          updatedBy: "system",
        },
      },
      { upsert: true, new: true },
    );

    permissionMap.set(permission.code, permission._id.toString());
  }

  logger.info(
    `✅ ${ALL_PERMISSIONS.length} permisos procesados (creados/actualizados)`,
  );
  return permissionMap;
}

/**
 * Seed de roles
 */
async function seedRoles(
  roleModel: Model<Role>,
  permissionMap: Map<string, string>,
): Promise<Map<string, string>> {
  logger.info("👥 Sembrando roles...");

  const roleMap = new Map<string, string>();

  for (const roleData of ALL_ROLES) {
    // Obtener IDs de permisos
    let permissionIds: string[] = [];

    if (roleData.permissionCodes.includes("*")) {
      // Admin tiene todos los permisos
      permissionIds = Array.from(permissionMap.values());
    } else {
      // Mapear códigos de permisos a IDs
      permissionIds = roleData.permissionCodes
        .map((code) => permissionMap.get(code))
        .filter((id): id is string => id !== undefined);
    }

    const role = await roleModel.findOneAndUpdate(
      { name: roleData.name },
      {
        displayName: roleData.displayName,
        description: roleData.description,
        permissions: roleData.permissionCodes, // Códigos de permisos
        permissionIds: permissionIds, // ObjectIds de permisos
        isActive: roleData.isActive,
        isDefault: roleData.isDefault,
        audit: {
          createdBy: "system",
          updatedBy: "system",
        },
      },
      { upsert: true, new: true },
    );

    roleMap.set(roleData.name, role._id.toString());
  }

  logger.info(`✅ ${ALL_ROLES.length} roles procesados (creados/actualizados)`);
  return roleMap;
}

/**
 * Seed de usuarios
 */
async function seedUsers(
  userModel: Model<User>,
  roleMap: Map<string, string>,
  defaultPasswordHash: string,
) {
  logger.info("👤 Sembrando usuarios...");

  // IDs fijos para consistencia cross-service (según SEED_IDS_REFERENCE.md)
  const PROGRAMA_SISTEMAS_ID = "507f1f77bcf86cd799439041";
  const PROGRAMA_INDUSTRIAL_ID = "507f1f77bcf86cd799439042";

  const users = [
    {
      email: "admin@ufps.edu.co",
      password: defaultPasswordHash,
      firstName: "Admin",
      lastName: "Principal",
      documentType: "CC",
      documentNumber: "1000000001",
      phone: "+573001234567",
      roles: ["GENERAL_ADMIN"],
      programId: undefined, // Admin general no pertenece a programa específico
      coordinatedProgramId: undefined, // No coordina ningún programa
      isActive: true,
      isEmailVerified: true,
    },
    {
      email: "admin.ti@ufps.edu.co",
      password: defaultPasswordHash,
      firstName: "Admin",
      lastName: "TI",
      documentType: "CC",
      documentNumber: "1000000002",
      phone: "+573001234568",
      roles: ["GENERAL_ADMIN"],
      programId: undefined, // Admin TI no pertenece a programa específico
      coordinatedProgramId: undefined,
      isActive: true,
      isEmailVerified: true,
    },
    {
      email: "juan.docente@ufps.edu.co",
      password: defaultPasswordHash,
      firstName: "Juan",
      lastName: "Docente",
      documentType: "CC",
      documentNumber: "1000000003",
      phone: "+573001234569",
      roles: ["TEACHER", "PROGRAM_ADMIN"], // Es docente Y coordinador
      programId: PROGRAMA_SISTEMAS_ID, // Pertenece a Sistemas
      coordinatedProgramId: PROGRAMA_SISTEMAS_ID, // Coordina Sistemas
      isActive: true,
      isEmailVerified: true,
    },
    {
      email: "maria.estudiante@ufps.edu.co",
      password: defaultPasswordHash,
      firstName: "María",
      lastName: "Estudiante",
      documentType: "TI",
      documentNumber: "1000000004",
      phone: "+573001234570",
      roles: ["STUDENT"],
      programId: PROGRAMA_SISTEMAS_ID, // Pertenece a Sistemas
      coordinatedProgramId: undefined, // No coordina
      isActive: true,
      isEmailVerified: true,
    },
    {
      email: "vigilante@ufps.edu.co",
      password: defaultPasswordHash,
      firstName: "Jorge",
      lastName: "Vigilante",
      documentType: "CC",
      documentNumber: "1000000005",
      phone: "+573001234571",
      roles: ["SECURITY"],
      programId: undefined, // Personal no pertenece a programa
      coordinatedProgramId: undefined,
      isActive: true,
      isEmailVerified: true,
    },
    {
      email: "staff@ufps.edu.co",
      password: defaultPasswordHash,
      firstName: "Ana",
      lastName: "Staff",
      documentType: "CC",
      documentNumber: "1000000006",
      phone: "+573001234572",
      roles: ["ADMINISTRATIVE_STAFF"],
      programId: undefined, // Personal no pertenece a programa
      coordinatedProgramId: undefined,
      isActive: true,
      isEmailVerified: true,
    },
    {
      email: "pedro.coordinador@ufps.edu.co",
      password: defaultPasswordHash,
      firstName: "Pedro",
      lastName: "Coordinador",
      documentType: "CC",
      documentNumber: "1000000007",
      phone: "+573001234573",
      roles: ["TEACHER", "PROGRAM_ADMIN"],
      programId: PROGRAMA_INDUSTRIAL_ID, // Pertenece a Industrial
      coordinatedProgramId: PROGRAMA_INDUSTRIAL_ID, // Coordina Industrial
      isActive: true,
      isEmailVerified: true,
    },
    {
      email: "auxiliar@ufps.edu.co",
      password: defaultPasswordHash,
      firstName: "Carlos",
      lastName: "Auxiliar",
      documentType: "CC",
      documentNumber: "1000000008",
      phone: "+573001234574",
      roles: ["TEACHER"],
      programId: PROGRAMA_SISTEMAS_ID, // Pertenece a Sistemas
      coordinatedProgramId: undefined, // No coordina (es docente auxiliar)
      isActive: true,
      isEmailVerified: true,
    },
    {
      email: "carlos.estudiante@ufps.edu.co",
      password: defaultPasswordHash,
      firstName: "Carlos",
      lastName: "Estudiante",
      documentType: "TI",
      documentNumber: "1000000009",
      phone: "+573001234575",
      roles: ["STUDENT"],
      programId: PROGRAMA_INDUSTRIAL_ID, // Pertenece a Industrial
      coordinatedProgramId: undefined,
      isActive: true,
      isEmailVerified: true,
    },
  ];

  let createdCount = 0;
  let updatedCount = 0;

  for (const userData of users) {
    const existingUser = await userModel.findOne({ email: userData.email });

    // Obtener ObjectIds de los roles (roleMap ya contiene strings de ObjectIds)
    const roleIds = userData.roles
      .map((roleName) => roleMap.get(roleName))
      .filter((id): id is string => id !== undefined);

    if (existingUser) {
      // Actualizar datos si es necesario, pero preservar contraseña si no es la default
      await userModel.updateOne(
        { _id: existingUser._id },
        {
          firstName: userData.firstName,
          lastName: userData.lastName,
          documentType: userData.documentType,
          documentNumber: userData.documentNumber,
          phone: userData.phone,
          programId: userData.programId,
          coordinatedProgramId: userData.coordinatedProgramId,
          roles: userData.roles,
          roleIds: roleIds, // Asignar ObjectIds de roles
          isActive: userData.isActive,
        },
      );
      updatedCount++;
    } else {
      await userModel.create({
        ...userData,
        roleIds: roleIds, // Asignar ObjectIds de roles
        audit: {
          createdBy: "system",
          updatedBy: "system",
        },
      });
      createdCount++;
    }
  }

  logger.info(
    `✅ Usuarios procesados: ${createdCount} creados, ${updatedCount} actualizados`,
  );

  logger.info("👤 Usuarios disponibles:");
  users.forEach((user) => {
    logger.info(
      `  - ${user.email} (${user.roles.join(", ")}) - Contraseña: 123456`,
    );
  });
}

/**
 * Seed data para Auth Service
 * Crea permisos, roles y usuarios de prueba
 */
async function seed() {
  try {
    logger.info("🌱 Iniciando seed de Auth Service...");

    const app = await NestFactory.createApplicationContext(AuthModule);

    const permissionModel = app.get<Model<Permission>>(
      getModelToken(Permission.name),
    );
    const roleModel = app.get<Model<Role>>(getModelToken(Role.name));
    const userModel = app.get<Model<User>>(getModelToken(User.name));

    // Limpieza opcional explicita
    if (process.argv.includes("--clean")) {
      logger.info("🧹 Limpiando datos existentes (--clean)...");
      await permissionModel.deleteMany({});
      await roleModel.deleteMany({});
      await userModel.deleteMany({});
    } else if (process.env.NODE_ENV === "development") {
      logger.info(
        "ℹ️ Modo desarrollo detectado. Usar --clean para limpiar DB antes del seed.",
      );
    }

    // ── Reference Data (tipos, estados dinámicos del dominio auth) ──
    const refDataRepo = app.get(ReferenceDataRepository);
    logger.info(
      `📋 Procesando ${AUTH_REFERENCE_DATA.length} datos de referencia...`,
    );
    for (const rd of AUTH_REFERENCE_DATA) {
      await refDataRepo.upsert(rd);
    }
    logger.info(
      `✅ ${AUTH_REFERENCE_DATA.length} datos de referencia procesados (upsert)`,
    );

    // Sembrar permisos
    const permissionMap = await seedPermissions(permissionModel);

    // Sembrar roles
    const roleMap = await seedRoles(roleModel, permissionMap);

    // Hash de contraseña por defecto
    const defaultPassword = await bcrypt.hash("123456", 10);

    // Sembrar usuarios
    await seedUsers(userModel, roleMap, defaultPassword);

    logger.info("\n✅ Seed de Auth Service completado exitosamente\n");
    logger.info("📊 Resumen:");
    logger.info(`  - Permisos: ${ALL_PERMISSIONS.length}`);
    logger.info(`  - Roles: ${ALL_ROLES.length}`);

    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error en seed de Auth Service:", error);
    process.exit(1);
  }
}

// Ejecutar seed
seed();
