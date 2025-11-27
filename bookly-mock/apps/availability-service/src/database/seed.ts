import { createLogger } from "@libs/common";
import { ReservationStatus, WeekDay } from "@libs/common/enums";
import { NestFactory } from "@nestjs/core";
import { getModelToken } from "@nestjs/mongoose";
import { Document, Model, Types } from "mongoose";
import { AvailabilityModule } from "../availability.module";
import {
  Availability,
  Reservation,
  WaitingList,
} from "../infrastructure/schemas";

const logger = createLogger("AvailabilitySeed");

/**
 * Seed data para Availability Service
 * Crea reservas, disponibilidades, lista de espera e historial
 */
async function seed() {
  try {
    logger.info("🌱 Iniciando seed de Availability Service...");

    const app = await NestFactory.createApplicationContext(AvailabilityModule);
    const reservationModel = app.get<Model<Reservation>>(
      getModelToken(Reservation.name)
    );
    const availabilityModel = app.get<Model<Availability>>(
      getModelToken(Availability.name)
    );
    const waitingListModel = app.get<Model<WaitingList>>(
      getModelToken(WaitingList.name)
    );

    // Limpiar datos existentes (solo con flag --clean)
    if (process.argv.includes("--clean")) {
      logger.warn("🧹 LIMPIEZA DESTRUCTIVA ACTIVADA");
      await reservationModel.deleteMany({});
      await availabilityModel.deleteMany({});
      await waitingListModel.deleteMany({});
    } else if (process.env.NODE_ENV === "development") {
      logger.info(
        "ℹ️ Modo desarrollo detectado. Usar --clean para limpiar DB antes del seed."
      );
    }

    // Disponibilidades (horarios regulares de recursos)
    // Usamos ObjectIds fijos para consistencia entre ejecuciones
    // Estos IDs deberían coincidir con los recursos del resources-service
    const resourceAuditorioId = new Types.ObjectId("507f1f77bcf86cd799439011");
    const resourceLabId = new Types.ObjectId("507f1f77bcf86cd799439012");
    const resourceSalaId = new Types.ObjectId("507f1f77bcf86cd799439013");

    const availabilities = [
      {
        resourceId: resourceAuditorioId,
        dayOfWeek: WeekDay.MONDAY,
        startTime: "06:00",
        endTime: "22:00",
        isAvailable: true,
        maxConcurrentReservations: 1,
        audit: {
          createdBy: "system",
          updatedBy: "system",
        },
      },
      {
        resourceId: resourceAuditorioId,
        dayOfWeek: WeekDay.TUESDAY,
        startTime: "06:00",
        endTime: "22:00",
        isAvailable: true,
        maxConcurrentReservations: 1,
        audit: {
          createdBy: "system",
          updatedBy: "system",
        },
      },
      {
        resourceId: resourceLabId,
        dayOfWeek: WeekDay.MONDAY,
        startTime: "06:00",
        endTime: "18:00",
        isAvailable: true,
        maxConcurrentReservations: 1,
        audit: {
          createdBy: "system",
          updatedBy: "system",
        },
      },
      {
        resourceId: resourceSalaId,
        dayOfWeek: WeekDay.WEDNESDAY,
        startTime: "08:00",
        endTime: "20:00",
        isAvailable: true,
        maxConcurrentReservations: 1,
        audit: {
          createdBy: "system",
          updatedBy: "system",
        },
      },
    ];

    logger.info(`Procesando ${availabilities.length} disponibilidades...`);
    const insertedAvailabilities: (Document & Availability)[] = [];

    for (const avail of availabilities) {
      const doc = await availabilityModel.findOneAndUpdate(
        { resourceId: avail.resourceId, dayOfWeek: avail.dayOfWeek },
        avail,
        { upsert: true, new: true }
      );
      insertedAvailabilities.push(doc as Document & Availability);
    }

    // IDs fijos para consistencia cross-service (según SEED_IDS_REFERENCE.md)
    const COORDINADOR_SISTEMAS_ID = new Types.ObjectId(
      "507f1f77bcf86cd799439021"
    );
    const ADMIN_GENERAL_ID = new Types.ObjectId("507f1f77bcf86cd799439022");
    const ESTUDIANTE_MARIA_ID = new Types.ObjectId("507f1f77bcf86cd799439023");
    const COORDINADOR_INDUSTRIAL_ID = new Types.ObjectId(
      "507f1f77bcf86cd799439026"
    );

    const PROGRAMA_SISTEMAS_ID = new Types.ObjectId("507f1f77bcf86cd799439041");
    const PROGRAMA_INDUSTRIAL_ID = new Types.ObjectId(
      "507f1f77bcf86cd799439042"
    );

    // Fechas para reservas
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Reservas en diferentes estados
    const reservations = [
      // Reserva completada (pasada) - DIRECTA (sin aprobación)
      {
        resourceId: resourceAuditorioId,
        userId: COORDINADOR_SISTEMAS_ID,
        programId: PROGRAMA_SISTEMAS_ID,
        approvalRequestId: undefined, // Reserva directa (sin aprobación)
        startDate: new Date(new Date(lastWeek).setHours(10, 0, 0)),
        endDate: new Date(new Date(lastWeek).setHours(12, 0, 0)),
        purpose: "Conferencia sobre Inteligencia Artificial",
        status: ReservationStatus.COMPLETED,
        checkInTime: new Date(new Date(lastWeek).setHours(9, 55, 0)),
        checkOutTime: new Date(new Date(lastWeek).setHours(12, 10, 0)),
        audit: {
          createdBy: COORDINADOR_SISTEMAS_ID,
          updatedBy: COORDINADOR_SISTEMAS_ID,
        },
      },
      // Reserva confirmada (mañana) - DIRECTA
      {
        resourceId: resourceSalaId,
        userId: ADMIN_GENERAL_ID,
        programId: undefined, // Admin general no tiene programa
        approvalRequestId: undefined,
        startDate: new Date(new Date(tomorrow).setHours(9, 0, 0)),
        endDate: new Date(new Date(tomorrow).setHours(11, 0, 0)),
        purpose: "Reunión de Coordinación",
        status: ReservationStatus.CONFIRMED,
        audit: {
          createdBy: ADMIN_GENERAL_ID,
          updatedBy: ADMIN_GENERAL_ID,
        },
      },
      // Reserva pendiente - REQUIERE APROBACIÓN
      {
        resourceId: resourceAuditorioId,
        userId: ESTUDIANTE_MARIA_ID,
        programId: PROGRAMA_SISTEMAS_ID,
        approvalRequestId: new Types.ObjectId("507f1f77bcf86cd799439081"), // Referencia a solicitud pendiente
        startDate: new Date(new Date(nextWeek).setHours(16, 0, 0)),
        endDate: new Date(new Date(nextWeek).setHours(18, 0, 0)),
        purpose: "Evento Estudiantil",
        status: ReservationStatus.PENDING,
        audit: {
          createdBy: ESTUDIANTE_MARIA_ID, // Estudiante solicita
        },
      },
      // Reserva cancelada
      {
        resourceId: resourceSalaId,
        userId: COORDINADOR_SISTEMAS_ID,
        programId: PROGRAMA_SISTEMAS_ID,
        approvalRequestId: undefined,
        startDate: new Date(new Date(yesterday).setHours(15, 0, 0)),
        endDate: new Date(new Date(yesterday).setHours(17, 0, 0)),
        purpose: "Tutoría Grupal",
        status: ReservationStatus.CANCELLED,
        audit: {
          createdBy: COORDINADOR_SISTEMAS_ID,
          updatedBy: COORDINADOR_SISTEMAS_ID,
          cancelledBy: COORDINADOR_SISTEMAS_ID,
          cancelledAt: new Date(new Date(yesterday).setHours(14, 30, 0)),
          cancellationReason: "El docente tuvo una emergencia médica",
        },
      },
    ];

    logger.info(`Procesando ${reservations.length} reservas...`);
    const insertedReservations: (Document & Reservation)[] = [];

    for (const res of reservations) {
      const doc = await reservationModel.findOneAndUpdate(
        {
          resourceId: res.resourceId,
          userId: res.userId,
          startDate: res.startDate,
        },
        res,
        { upsert: true, new: true }
      );
      insertedReservations.push(doc as Document & Reservation);
    }

    // Lista de espera
    const STAFF_VIGILANTE_ID = new Types.ObjectId("507f1f77bcf86cd799439024");

    const waitList = [
      {
        resourceId: resourceAuditorioId,
        userId: ESTUDIANTE_MARIA_ID,
        requestedStartDate: new Date(new Date(tomorrow).setHours(16, 0, 0)),
        requestedEndDate: new Date(new Date(tomorrow).setHours(18, 0, 0)),
        priority: 1,
        purpose: "Evento Cultural",
        isActive: true,
        audit: {
          createdBy: ESTUDIANTE_MARIA_ID,
        },
      },
      {
        resourceId: resourceAuditorioId,
        userId: STAFF_VIGILANTE_ID,
        requestedStartDate: new Date(new Date(tomorrow).setHours(18, 0, 0)),
        requestedEndDate: new Date(new Date(tomorrow).setHours(19, 30, 0)),
        priority: 10,
        purpose: "Capacitación Administrativa",
        isActive: true,
        audit: {
          createdBy: STAFF_VIGILANTE_ID,
        },
      },
    ];

    logger.info(
      `Procesando ${waitList.length} registros en lista de espera...`
    );
    const insertedWaitList: (Document & WaitingList)[] = [];

    for (const wait of waitList) {
      const doc = await waitingListModel.findOneAndUpdate(
        {
          resourceId: wait.resourceId,
          userId: wait.userId,
          requestedStartDate: wait.requestedStartDate,
        },
        wait,
        { upsert: true, new: true }
      );
      insertedWaitList.push(doc as Document & WaitingList);
    }

    logger.info("✅ Seed de Availability Service completado exitosamente");
    logger.info("");
    logger.info("📊 Resumen de datos creados/actualizados:");
    logger.info(`  ✓ ${insertedAvailabilities.length} disponibilidades`);
    logger.info(`  ✓ ${insertedReservations.length} reservas`);
    logger.info(`  ✓ ${insertedWaitList.length} registros en lista de espera`);
    logger.info("");
    logger.info("📦 Estados de reservas:");
    logger.info("  - COMPLETED: 1 (pasada)");
    logger.info("  - CONFIRMED: 1 (futura)");
    logger.info("  - PENDING: 1 (pendiente aprobación)");
    logger.info("  - CANCELLED: 1");

    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error en seed de Availability Service:", error);
    process.exit(1);
  }
}

// Ejecutar seed
seed();
