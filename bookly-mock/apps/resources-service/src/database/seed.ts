import { createLogger } from "@libs/common";
import {
  CategoryType,
  MaintenanceStatus,
  MaintenanceType,
  ResourceStatus,
  ResourceType,
} from "@libs/common/enums";
import { ReferenceDataRepository } from "@libs/database";
import { NestFactory } from "@nestjs/core";
import { getModelToken } from "@nestjs/mongoose";
import { Document, Model, Types } from "mongoose";
import {
  Category,
  Maintenance,
  Program,
  Resource,
} from "../infrastructure/schemas";
import { Department } from "../infrastructure/schemas/department.schema";
import { Faculty } from "../infrastructure/schemas/faculty.schema";
import { ResourcesModule } from "../resources.module";
import { RESOURCES_REFERENCE_DATA } from "./reference-data.seed-data";

const logger = createLogger("ResourcesSeed");

/**
 * Seed data para Resources Service
 * Crea recursos y categorías de prueba
 */
async function seed() {
  try {
    logger.info("🌱 Iniciando seed de Resources Service...");

    const app = await NestFactory.createApplicationContext(ResourcesModule);
    const resourceModel = app.get<Model<Resource>>(
      getModelToken(Resource.name),
    );
    const categoryModel = app.get<Model<Category>>(
      getModelToken(Category.name),
    );
    const maintenanceModel = app.get<Model<Maintenance>>(
      getModelToken(Maintenance.name),
    );
    const programModel = app.get<Model<Program>>(getModelToken(Program.name));
    const facultyModel = app.get<Model<Faculty>>(getModelToken(Faculty.name));
    const departmentModel = app.get<Model<Department>>(
      getModelToken(Department.name),
    );

    // Limpieza opcional explicita
    if (process.argv.includes("--clean")) {
      logger.info("🧹 Limpiando datos existentes (--clean)...");
      await resourceModel.deleteMany({});
      await categoryModel.deleteMany({});
      await maintenanceModel.deleteMany({});
      await programModel.deleteMany({});
    } else if (process.env.NODE_ENV === "development") {
      logger.info(
        "ℹ️ Modo desarrollo detectado. Usar --clean para limpiar DB antes del seed.",
      );
    }

    // ── Reference Data (tipos, estados, categorías dinámicos) ──
    const refDataRepo = app.get(ReferenceDataRepository);
    logger.info(
      `📋 Procesando ${RESOURCES_REFERENCE_DATA.length} datos de referencia...`,
    );
    for (const rd of RESOURCES_REFERENCE_DATA) {
      await refDataRepo.upsert(rd);
    }
    logger.info(
      `✅ ${RESOURCES_REFERENCE_DATA.length} datos de referencia procesados (upsert)`,
    );

    // IDs fijos para consistencia cross-service (según SEED_IDS_REFERENCE.md)
    const ADMIN_GENERAL_ID = "507f1f77bcf86cd799439022";
    const COORDINADOR_SISTEMAS_ID = "507f1f77bcf86cd799439021";
    const COORDINADOR_INDUSTRIAL_ID = "507f1f77bcf86cd799439026";

    const FACULTAD_INGENIERIA_ID = "507f1f77bcf86cd799439051";
    const DEPTO_SISTEMAS_ID = "507f1f77bcf86cd799439061";
    const DEPTO_INDUSTRIAL_ID = "507f1f77bcf86cd799439062";
    const DEPTO_ELECTRONICA_ID = "507f1f77bcf86cd799439063";

    const PROGRAMA_SISTEMAS_ID = "507f1f77bcf86cd799439041";
    const PROGRAMA_INDUSTRIAL_ID = "507f1f77bcf86cd799439042";
    const PROGRAMA_ELECTRONICA_ID = "507f1f77bcf86cd799439043";

    // ── Facultades ──
    const faculties = [
      {
        _id: new Types.ObjectId(FACULTAD_INGENIERIA_ID),
        code: "FING",
        name: "Facultad de Ingeniería",
        description: "Facultad de Ingeniería de la UFPS",
        ownerId: ADMIN_GENERAL_ID,
        ownerName: "Admin Principal",
        ownerEmail: "admin@ufps.edu.co",
        isActive: true,
        audit: { createdBy: ADMIN_GENERAL_ID, updatedBy: ADMIN_GENERAL_ID },
      },
    ];

    logger.info(`Procesando ${faculties.length} facultades...`);
    for (const fac of faculties) {
      await facultyModel.findOneAndUpdate({ code: fac.code }, fac, {
        upsert: true,
        new: true,
      });
    }
    logger.info(`✅ ${faculties.length} facultades procesadas (upsert)`);

    // ── Departamentos ──
    const departments = [
      {
        _id: new Types.ObjectId(DEPTO_SISTEMAS_ID),
        code: "DSIS",
        name: "Sistemas e Informática",
        description: "Departamento de Sistemas e Informática",
        facultyId: FACULTAD_INGENIERIA_ID,
        ownerId: COORDINADOR_SISTEMAS_ID,
        ownerName: "Juan Docente",
        ownerEmail: "juan.docente@ufps.edu.co",
        isActive: true,
        audit: { createdBy: ADMIN_GENERAL_ID, updatedBy: ADMIN_GENERAL_ID },
      },
      {
        _id: new Types.ObjectId(DEPTO_INDUSTRIAL_ID),
        code: "DIND",
        name: "Industrial",
        description: "Departamento de Ingeniería Industrial",
        facultyId: FACULTAD_INGENIERIA_ID,
        ownerId: COORDINADOR_INDUSTRIAL_ID,
        ownerName: "Pedro Coordinador",
        ownerEmail: "pedro.coordinador@ufps.edu.co",
        isActive: true,
        audit: { createdBy: ADMIN_GENERAL_ID, updatedBy: ADMIN_GENERAL_ID },
      },
      {
        _id: new Types.ObjectId(DEPTO_ELECTRONICA_ID),
        code: "DELE",
        name: "Electrónica y Telecomunicaciones",
        description: "Departamento de Electrónica y Telecomunicaciones",
        facultyId: FACULTAD_INGENIERIA_ID,
        ownerId: ADMIN_GENERAL_ID,
        ownerName: "Admin Principal",
        ownerEmail: "admin@ufps.edu.co",
        isActive: true,
        audit: { createdBy: ADMIN_GENERAL_ID, updatedBy: ADMIN_GENERAL_ID },
      },
    ];

    logger.info(`Procesando ${departments.length} departamentos...`);
    for (const dep of departments) {
      await departmentModel.findOneAndUpdate({ code: dep.code }, dep, {
        upsert: true,
        new: true,
      });
    }
    logger.info(`✅ ${departments.length} departamentos procesados (upsert)`);

    // ── Programas Académicos ──
    const programs = [
      {
        _id: new Types.ObjectId(PROGRAMA_SISTEMAS_ID),
        code: "SIS",
        name: "Ingeniería de Sistemas",
        description: "Programa de pregrado en Ingeniería de Sistemas",
        ownerId: COORDINADOR_SISTEMAS_ID,
        ownerName: "Juan Docente",
        ownerEmail: "juan.docente@ufps.edu.co",
        coordinatorId: COORDINADOR_SISTEMAS_ID,
        coordinatorName: "Juan Docente",
        coordinatorEmail: "juan.docente@ufps.edu.co",
        facultyId: FACULTAD_INGENIERIA_ID,
        departmentId: DEPTO_SISTEMAS_ID,
        faculty: "Facultad de Ingeniería",
        department: "Sistemas e Informática",
        isActive: true,
        audit: { createdBy: ADMIN_GENERAL_ID, updatedBy: ADMIN_GENERAL_ID },
      },
      {
        _id: new Types.ObjectId(PROGRAMA_INDUSTRIAL_ID),
        code: "IND",
        name: "Ingeniería Industrial",
        description: "Programa de pregrado en Ingeniería Industrial",
        ownerId: COORDINADOR_INDUSTRIAL_ID,
        ownerName: "Pedro Coordinador",
        ownerEmail: "pedro.coordinador@ufps.edu.co",
        coordinatorId: COORDINADOR_INDUSTRIAL_ID,
        coordinatorName: "Pedro Coordinador",
        coordinatorEmail: "pedro.coordinador@ufps.edu.co",
        facultyId: FACULTAD_INGENIERIA_ID,
        departmentId: DEPTO_INDUSTRIAL_ID,
        faculty: "Facultad de Ingeniería",
        department: "Industrial",
        isActive: true,
        audit: { createdBy: ADMIN_GENERAL_ID, updatedBy: ADMIN_GENERAL_ID },
      },
      {
        _id: new Types.ObjectId(PROGRAMA_ELECTRONICA_ID),
        code: "ELE",
        name: "Ingeniería Electrónica",
        description: "Programa de pregrado en Ingeniería Electrónica",
        ownerId: ADMIN_GENERAL_ID,
        ownerName: "Admin Principal",
        ownerEmail: "admin@ufps.edu.co",
        coordinatorId: undefined,
        coordinatorName: undefined,
        coordinatorEmail: undefined,
        facultyId: FACULTAD_INGENIERIA_ID,
        departmentId: DEPTO_ELECTRONICA_ID,
        faculty: "Facultad de Ingeniería",
        department: "Electrónica y Telecomunicaciones",
        isActive: true,
        audit: { createdBy: ADMIN_GENERAL_ID, updatedBy: ADMIN_GENERAL_ID },
      },
    ];

    logger.info(`Procesando ${programs.length} programas académicos...`);
    const insertedPrograms: (Document & Program)[] = [];

    for (const prog of programs) {
      const doc = await programModel.findOneAndUpdate(
        { code: prog.code },
        prog,
        { upsert: true, new: true },
      );
      insertedPrograms.push(doc as Document & Program);
    }

    logger.info(
      `✅ ${insertedPrograms.length} programas procesados (creados/actualizados)`,
    );

    // Categorías
    const categories = [
      {
        code: "CAT-CONF-ROOMS",
        name: "Salas de Conferencia",
        description: "Salas para conferencias y presentaciones",
        type: CategoryType.RESOURCE_TYPE,
        isActive: true,
        audit: {
          createdBy: "system",
          updatedBy: "system",
        },
      },
      {
        code: "CAT-LABS",
        name: "Laboratorios",
        description: "Laboratorios de computación y prácticas",
        type: CategoryType.RESOURCE_TYPE,
        isActive: true,
        audit: {
          createdBy: "system",
          updatedBy: "system",
        },
      },
      {
        code: "CAT-AUDITORIUMS",
        name: "Auditorios",
        description: "Auditorios para eventos masivos",
        type: CategoryType.RESOURCE_TYPE,
        isActive: true,
        audit: {
          createdBy: "system",
          updatedBy: "system",
        },
      },
      {
        code: "CAT-AV-EQUIPMENT",
        name: "Equipos Audiovisuales",
        description: "Proyectores, parlantes, micrófonos",
        type: CategoryType.RESOURCE_TYPE,
        isActive: true,
        audit: {
          createdBy: "system",
          updatedBy: "system",
        },
      },
    ];

    logger.info(`Procesando ${categories.length} categorías...`);
    const insertedCategories: (Document & Category)[] = [];

    for (const cat of categories) {
      const doc = await categoryModel.findOneAndUpdate(
        { code: cat.code },
        cat,
        { upsert: true, new: true },
      );
      insertedCategories.push(doc as Document & Category);
    }

    // Recursos con reglas de disponibilidad
    // Mapear IDs de categorías por nombre para facilitar referencia
    const catMap = new Map(insertedCategories.map((c) => [c.name, c._id]));

    const resources = [
      {
        code: "RES-AUD-PRINCIPAL",
        name: "Auditorio Principal",
        description: "Auditorio principal con capacidad para 500 personas",
        type: ResourceType.AUDITORIUM,
        categoryId: catMap.get("Auditorios"),
        capacity: 500,
        location: "Edificio Principal - Piso 1",
        floor: "1",
        building: "Edificio Principal",
        attributes: {
          features: [
            "Proyector",
            "Sistema de sonido",
            "Aire acondicionado",
            "Acceso para discapacitados",
          ],
        },
        programIds: [
          PROGRAMA_SISTEMAS_ID,
          PROGRAMA_INDUSTRIAL_ID,
          PROGRAMA_ELECTRONICA_ID,
        ], // Usado por todos los programas
        isActive: true,
        status: ResourceStatus.AVAILABLE,
        availabilityRules: {
          requiresApproval: true,
          maxAdvanceBookingDays: 90,
          minBookingDurationMinutes: 60,
          maxBookingDurationMinutes: 480,
          allowRecurring: true,
        },
        audit: {
          createdBy: ADMIN_GENERAL_ID, // Admin crea recursos globales
          updatedBy: ADMIN_GENERAL_ID,
        },
      },
      {
        code: "RES-LAB-SIS-1",
        name: "Laboratorio de Sistemas 1",
        description: "Laboratorio de computación con 30 equipos",
        type: ResourceType.LABORATORY,
        categoryId: catMap.get("Laboratorios"),
        capacity: 30,
        location: "Edificio de Ingenierías - Piso 3",
        floor: "3",
        building: "Edificio de Ingenierías",
        attributes: {
          features: [
            "30 Computadores",
            "Proyector",
            "Internet de alta velocidad",
            "Software especializado",
          ],
        },
        programIds: [PROGRAMA_SISTEMAS_ID], // Solo para Sistemas
        isActive: true,
        status: ResourceStatus.AVAILABLE,
        availabilityRules: {
          requiresApproval: false,
          maxAdvanceBookingDays: 30,
          minBookingDurationMinutes: 90,
          maxBookingDurationMinutes: 180,
          allowRecurring: true,
        },
        audit: {
          createdBy: COORDINADOR_SISTEMAS_ID, // Coordinador crea recurso de su programa
          updatedBy: COORDINADOR_SISTEMAS_ID,
        },
      },
      {
        code: "RES-CONF-A",
        name: "Sala de Conferencias A",
        description: "Sala para reuniones y presentaciones pequeñas",
        type: ResourceType.MEETING_ROOM,
        categoryId: catMap.get("Salas de Conferencia"),
        capacity: 20,
        location: "Edificio Principal - Piso 2",
        floor: "2",
        building: "Edificio Principal",
        attributes: {
          features: ["Proyector", "Videoconferencia", "Pizarra digital"],
        },
        programIds: [PROGRAMA_SISTEMAS_ID, PROGRAMA_INDUSTRIAL_ID], // Usado por Sistemas e Industrial
        isActive: true,
        status: ResourceStatus.AVAILABLE,
        availabilityRules: {
          requiresApproval: false,
          maxAdvanceBookingDays: 14,
          minBookingDurationMinutes: 30,
          maxBookingDurationMinutes: 240,
          allowRecurring: true,
        },
        audit: {
          createdBy: ADMIN_GENERAL_ID, // Admin crea recursos compartidos
          updatedBy: ADMIN_GENERAL_ID,
        },
      },
      {
        code: "RES-PROJ-PORT-1",
        name: "Proyector Portátil 1",
        description: "Proyector HD portátil con control remoto",
        type: ResourceType.MULTIMEDIA_EQUIPMENT,
        categoryId: catMap.get("Equipos Audiovisuales"),
        capacity: 1,
        location: "Almacén de Equipos",
        attributes: {
          features: [
            "Full HD",
            "HDMI",
            "Control remoto",
            "Estuche de transporte",
          ],
        },
        programIds: [
          PROGRAMA_SISTEMAS_ID,
          PROGRAMA_INDUSTRIAL_ID,
          PROGRAMA_ELECTRONICA_ID,
        ], // Disponible para todos los programas
        isActive: true,
        status: ResourceStatus.AVAILABLE,
        availabilityRules: {
          requiresApproval: true,
          maxAdvanceBookingDays: 7,
          minBookingDurationMinutes: 60,
          maxBookingDurationMinutes: 480,
          allowRecurring: false,
        },
        audit: {
          createdBy: ADMIN_GENERAL_ID, // Admin crea equipos compartidos
          updatedBy: ADMIN_GENERAL_ID,
        },
      },
    ];

    logger.info(`Procesando ${resources.length} recursos...`);
    const insertedResources: (Document & Resource)[] = [];

    for (const res of resources) {
      const doc = await resourceModel.findOneAndUpdate(
        { code: res.code },
        res,
        { upsert: true, new: true },
      );
      insertedResources.push(doc as Document & Resource);
    }

    // Mapear recursos por nombre
    const resMap = new Map(insertedResources.map((r) => [r.name, r._id]));

    // Mantenimientos programados
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const maintenances = [
      // Mantenimiento programado (futuro)
      {
        resourceId: resMap.get("Auditorio Principal"),
        type: MaintenanceType.PREVENTIVE,
        title: "Mantenimiento preventivo anual del auditorio",
        description:
          "Revisión completa del sistema de sonido, proyector y aire acondicionado",
        scheduledStartDate: nextMonth,
        scheduledEndDate: new Date(nextMonth.getTime() + 4 * 60 * 60 * 1000), // 4 horas
        status: MaintenanceStatus.SCHEDULED,
        performedBy: "Equipo de Mantenimiento",
        affectsAvailability: true,
        createdBy: "system",
      },
      // Mantenimiento en progreso
      {
        resourceId: resMap.get("Laboratorio de Sistemas 1"),
        type: MaintenanceType.CORRECTIVE,
        title: "Actualización de software del laboratorio",
        description:
          "Instalación de últimas actualizaciones y herramientas de desarrollo",
        scheduledStartDate: yesterday,
        scheduledEndDate: now,
        actualStartDate: yesterday,
        status: MaintenanceStatus.IN_PROGRESS,
        performedBy: "Soporte IT",
        affectsAvailability: true,
        createdBy: "system",
      },
      // Mantenimiento completado
      {
        resourceId: resMap.get("Sala de Conferencias A"),
        type: MaintenanceType.PREVENTIVE,
        title: "Limpieza y calibración de equipos",
        description:
          "Mantenimiento preventivo de proyector y sistema de videoconferencia",
        scheduledStartDate: lastMonth,
        scheduledEndDate: new Date(lastMonth.getTime() + 2 * 60 * 60 * 1000), // 2 horas
        actualStartDate: lastMonth,
        actualEndDate: new Date(lastMonth.getTime() + 2 * 60 * 60 * 1000),
        status: MaintenanceStatus.COMPLETED,
        performedBy: "Técnico AV",
        cost: 150000,
        notes: "Se reemplazó el cable HDMI y se limpió el filtro del proyector",
        affectsAvailability: true,
        createdBy: "system",
      },
      // Otro mantenimiento programado próximo
      {
        resourceId: resMap.get("Proyector Portátil 1"),
        type: MaintenanceType.UPGRADE,
        title: "Actualización de firmware del proyector",
        description:
          "Actualización del firmware para mejorar compatibilidad con dispositivos modernos",
        scheduledStartDate: nextWeek,
        scheduledEndDate: new Date(nextWeek.getTime() + 1 * 60 * 60 * 1000), // 1 hora
        status: MaintenanceStatus.SCHEDULED,
        performedBy: "Soporte Técnico",
        affectsAvailability: false, // No afecta disponibilidad
        createdBy: "system",
      },
      // Mantenimiento cancelado
      {
        resourceId: resMap.get("Auditorio Principal"),
        type: MaintenanceType.INSPECTION,
        title: "Inspección de seguridad cancelada",
        description: "Inspección rutinaria de sistemas de seguridad",
        scheduledStartDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        scheduledEndDate: new Date(
          now.getTime() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000,
        ),
        status: MaintenanceStatus.CANCELLED,
        performedBy: "Equipo de Seguridad",
        notes: "Cancelled: Pospuesto por evento especial",
        affectsAvailability: true,
        createdBy: "system",
      },
    ];

    logger.info(`Procesando ${maintenances.length} mantenimientos...`);
    const insertedMaintenances: (Document & Maintenance)[] = [];

    for (const maint of maintenances) {
      if (!maint.resourceId) {
        logger.warn(
          `⚠️ Saltando mantenimiento "${maint.title}" - Recurso no encontrado`,
        );
        continue;
      }

      const doc = await maintenanceModel.findOneAndUpdate(
        { title: maint.title },
        maint,
        { upsert: true, new: true },
      );
      insertedMaintenances.push(doc as Document & Maintenance);
    }

    logger.info("✅ Seed de Resources Service completado exitosamente");
    logger.info("\n📊 Resumen de datos creados/actualizados:");
    logger.info(`  ✓ ${insertedCategories.length} categorías`);
    logger.info(
      `  ✓ ${insertedResources.length} recursos con reglas de disponibilidad`,
    );
    logger.info(`  ✓ ${insertedMaintenances.length} mantenimientos`);
    logger.info("\n📦 Recursos disponibles:");
    resources.forEach((resource) => {
      logger.info(`  - ${resource.name} (${resource.type})`);
    });

    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error en seed de Resources Service:", error);
    process.exit(1);
  }
}

// Ejecutar seed
seed();
