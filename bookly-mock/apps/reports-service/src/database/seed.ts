import { createLogger } from "@libs/common";
import { ReferenceDataRepository } from "@libs/database";
import { NestFactory } from "@nestjs/core";
import { getModelToken } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  UnsatisfiedDemand,
  UsageStatistic,
  UserEvaluation,
  UserFeedback,
} from "../infrastructure/schemas";
import { ReportsModule } from "../reports.module";
import { REPORTS_REFERENCE_DATA } from "./reference-data.seed-data";

const logger = createLogger("ReportsSeed");

/**
 * Seed data para Reports Service
 * Crea feedback, evaluaciones, estadísticas de uso y demanda insatisfecha
 * VERSIÓN 2.0 - Idempotente con ObjectIds fijos
 */
async function seed() {
  try {
    logger.info("🌱 Iniciando seed de Reports Service...");

    const app = await NestFactory.createApplicationContext(ReportsModule);
    const userFeedbackModel = app.get<Model<UserFeedback>>(
      getModelToken(UserFeedback.name),
    );
    const userEvaluationModel = app.get<Model<UserEvaluation>>(
      getModelToken(UserEvaluation.name),
    );
    const usageStatisticModel = app.get<Model<UsageStatistic>>(
      getModelToken(UsageStatistic.name),
    );
    const unsatisfiedDemandModel = app.get<Model<UnsatisfiedDemand>>(
      getModelToken(UnsatisfiedDemand.name),
    );

    // Flag --clean para limpieza destructiva
    const shouldClean = process.argv.includes("--clean");
    if (shouldClean) {
      logger.warn("⚠️ Flag --clean detectado. Limpiando base de datos...");
      await userFeedbackModel.deleteMany({});
      await userEvaluationModel.deleteMany({});
      await usageStatisticModel.deleteMany({});
      await unsatisfiedDemandModel.deleteMany({});
      logger.info("✅ Base de datos limpiada");
    } else {
      logger.info(
        "ℹ️  Modo desarrollo detectado. Usar --clean para limpiar DB antes del seed.",
      );
    }

    // ── Reference Data (tipos, estados dinámicos del dominio reports) ──
    const refDataRepo = app.get(ReferenceDataRepository);
    logger.info(
      `📋 Procesando ${REPORTS_REFERENCE_DATA.length} datos de referencia...`,
    );
    for (const rd of REPORTS_REFERENCE_DATA) {
      await refDataRepo.upsert(rd);
    }
    logger.info(
      `✅ ${REPORTS_REFERENCE_DATA.length} datos de referencia procesados (upsert)`,
    );

    // ObjectIds fijos para consistencia
    const systemUserId = new Types.ObjectId("507f1f77bcf86cd799439000");
    const userDocenteId = new Types.ObjectId("507f1f77bcf86cd799439021");
    const userEstudianteId = new Types.ObjectId("507f1f77bcf86cd799439023");
    const userAdminId = new Types.ObjectId("507f1f77bcf86cd799439022");

    const auditorioId = new Types.ObjectId("507f1f77bcf86cd799439011");
    const laboratorioId = new Types.ObjectId("507f1f77bcf86cd799439012");
    const salaId = new Types.ObjectId("507f1f77bcf86cd799439013");

    const reservation1Id = new Types.ObjectId("507f1f77bcf86cd799439031");
    const reservation2Id = new Types.ObjectId("507f1f77bcf86cd799439032");

    // Fechas
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // User Feedback (RF-34)
    const userFeedbacks = [
      {
        userId: userDocenteId,
        userName: "Juan Docente",
        reservationId: reservation1Id,
        resourceId: auditorioId,
        resourceName: "Auditorio Principal",
        rating: 5,
        status: "RESPONDED",
        comments:
          "Excelente espacio, muy bien equipado. El sistema de sonido funcionó perfectamente.",
        feedbackDate: new Date(new Date(lastWeek).setHours(13, 0, 0)),
        category: "FACILITY",
        isAnonymous: false,
        response: "Gracias por su feedback positivo.",
        respondedBy: userAdminId,
        respondedAt: new Date(new Date(lastWeek).setHours(15, 0, 0)),
      },
      {
        userId: userEstudianteId,
        userName: "María Estudiante",
        reservationId: reservation2Id,
        resourceId: laboratorioId,
        resourceName: "Laboratorio de Sistemas 1",
        rating: 4,
        status: "PENDING",
        comments: "Buen laboratorio, pero algunos computadores están lentos.",
        feedbackDate: new Date(new Date(lastWeek).setHours(10, 0, 0)),
        category: "EQUIPMENT",
        isAnonymous: false,
      },
    ];

    logger.info(`Procesando ${userFeedbacks.length} user feedbacks...`);
    const insertedFeedbacks: any[] = [];

    for (const feedback of userFeedbacks) {
      const doc = await userFeedbackModel.findOneAndUpdate(
        { reservationId: feedback.reservationId },
        feedback,
        { upsert: true, new: true },
      );
      insertedFeedbacks.push(doc);
    }

    // User Evaluations (RF-35)
    const userEvaluations = [
      {
        userId: userDocenteId,
        userName: "Juan Docente",
        userEmail: "juan.docente@ufps.edu.co",
        evaluatedBy: userAdminId,
        evaluatorName: "Admin Sistema",
        evaluatorRole: "GENERAL_ADMIN",
        evaluationDate: new Date(new Date(lastWeek).setHours(16, 0, 0)),
        complianceScore: 95,
        punctualityScore: 100,
        resourceCareScore: 90,
        overallScore: 95,
        comments: "Excelente usuario, cumple con todas las normas.",
        recommendations: "Ninguna. Mantener el buen comportamiento.",
        period: {
          startDate: new Date(new Date(lastMonth).setDate(1)),
          endDate: new Date(lastWeek),
        },
      },
      {
        userId: userEstudianteId,
        userName: "María Estudiante",
        userEmail: "maria.estudiante@ufps.edu.co",
        evaluatedBy: userAdminId,
        evaluatorName: "Admin Sistema",
        evaluatorRole: "GENERAL_ADMIN",
        evaluationDate: new Date(new Date(lastWeek).setHours(17, 0, 0)),
        complianceScore: 85,
        punctualityScore: 80,
        resourceCareScore: 90,
        overallScore: 85,
        comments: "Buen usuario en general. Mejorar puntualidad.",
        recommendations: "Llegar 10 minutos antes de la reserva.",
        period: {
          startDate: new Date(new Date(lastMonth).setDate(1)),
          endDate: new Date(lastWeek),
        },
      },
    ];

    logger.info(`Procesando ${userEvaluations.length} user evaluations...`);
    const insertedEvaluations: any[] = [];

    for (const evaluation of userEvaluations) {
      const doc = await userEvaluationModel.findOneAndUpdate(
        {
          userId: evaluation.userId,
          evaluationDate: evaluation.evaluationDate,
        },
        evaluation,
        { upsert: true, new: true },
      );
      insertedEvaluations.push(doc);
    }

    // Usage Statistics (RF-31, RF-32)
    const usageStatistics = [
      {
        statisticType: "RESOURCE",
        referenceId: auditorioId,
        referenceName: "Auditorio Principal",
        periodStart: new Date(new Date(lastMonth).setDate(1)),
        periodEnd: new Date(lastWeek),
        totalReservations: 45,
        confirmedReservations: 42,
        cancelledReservations: 3,
        completedReservations: 40,
        totalHoursReserved: 180,
        totalHoursUsed: 175,
        averageRating: 4.7,
        uniqueUsers: 25,
        peakUsageTimes: ["09:00-11:00", "14:00-16:00"],
        mostUsedResources: [],
      },
      {
        statisticType: "USER",
        referenceId: userDocenteId,
        referenceName: "Juan Docente",
        periodStart: new Date(new Date(lastMonth).setDate(1)),
        periodEnd: new Date(lastWeek),
        totalReservations: 12,
        confirmedReservations: 12,
        cancelledReservations: 0,
        completedReservations: 12,
        totalHoursReserved: 36,
        totalHoursUsed: 36,
        averageRating: 5.0,
        uniqueUsers: 1,
        peakUsageTimes: ["08:00-10:00"],
        mostUsedResources: [
          {
            resourceId: auditorioId,
            resourceName: "Auditorio Principal",
            count: 8,
          },
          {
            resourceId: salaId,
            resourceName: "Sala Conferencias A",
            count: 4,
          },
        ],
      },
      {
        statisticType: "PROGRAM",
        referenceId: new Types.ObjectId("507f1f77bcf86cd799439041"),
        referenceName: "Ingeniería de Sistemas",
        periodStart: new Date(new Date(lastMonth).setDate(1)),
        periodEnd: new Date(lastWeek),
        totalReservations: 78,
        confirmedReservations: 72,
        cancelledReservations: 6,
        completedReservations: 70,
        totalHoursReserved: 312,
        totalHoursUsed: 300,
        averageRating: 4.5,
        uniqueUsers: 45,
        peakUsageTimes: ["10:00-12:00", "16:00-18:00"],
        mostUsedResources: [
          {
            resourceId: laboratorioId,
            resourceName: "Laboratorio de Sistemas 1",
            count: 45,
          },
          {
            resourceId: auditorioId,
            resourceName: "Auditorio Principal",
            count: 20,
          },
        ],
      },
    ];

    logger.info(`Procesando ${usageStatistics.length} usage statistics...`);
    const insertedStatistics: any[] = [];

    for (const statistic of usageStatistics) {
      const doc = await usageStatisticModel.findOneAndUpdate(
        {
          statisticType: statistic.statisticType,
          referenceId: statistic.referenceId,
          periodStart: statistic.periodStart,
        },
        statistic,
        { upsert: true, new: true },
      );
      insertedStatistics.push(doc);
    }

    // Unsatisfied Demand (RF-37)
    const unsatisfiedDemands = [
      {
        resourceId: auditorioId,
        resourceName: "Auditorio Principal",
        resourceType: "AUDITORIUM",
        requestedBy: userDocenteId,
        requesterName: "Juan Docente",
        requesterEmail: "juan.docente@ufps.edu.co",
        requestedDate: new Date(
          new Date(lastWeek).setDate(lastWeek.getDate() + 2),
        ),
        requestedStartTime: new Date(new Date(lastWeek).setHours(9, 0, 0)),
        requestedEndTime: new Date(new Date(lastWeek).setHours(11, 0, 0)),
        duration: 120,
        reason: "UNAVAILABLE",
        priority: "HIGH",
        status: "RESOLVED",
        reasonDetails: "Todas las franjas horarias reservadas para ese día",
        program: "Ingeniería de Sistemas",
        alternatives: [
          {
            resourceId: salaId,
            resourceName: "Sala Conferencias A",
            availableDate: new Date(new Date(lastWeek).setHours(9, 0, 0)),
          },
        ],
        resolvedAt: new Date(new Date(lastWeek).setHours(18, 0, 0)),
        resolvedBy: userAdminId,
        resolutionNotes: "Se asignó sala alternativa",
      },
      {
        resourceId: laboratorioId,
        resourceName: "Laboratorio de Sistemas 1",
        resourceType: "LABORATORY",
        requestedBy: userEstudianteId,
        requesterName: "María Estudiante",
        requesterEmail: "maria.estudiante@ufps.edu.co",
        requestedDate: new Date(today),
        requestedStartTime: new Date(new Date(today).setHours(14, 0, 0)),
        requestedEndTime: new Date(new Date(today).setHours(16, 0, 0)),
        duration: 120,
        reason: "MAINTENANCE",
        priority: "NORMAL",
        status: "PENDING",
        reasonDetails: "Laboratorio en mantenimiento preventivo",
        program: "Ingeniería de Sistemas",
        alternatives: [],
      },
    ];

    logger.info(
      `Procesando ${unsatisfiedDemands.length} unsatisfied demands...`,
    );
    const insertedDemands: any[] = [];

    for (const demand of unsatisfiedDemands) {
      const doc = await unsatisfiedDemandModel.findOneAndUpdate(
        {
          resourceId: demand.resourceId,
          requestedBy: demand.requestedBy,
          requestedStartTime: demand.requestedStartTime,
        },
        demand,
        { upsert: true, new: true },
      );
      insertedDemands.push(doc);
    }

    logger.info("✅ Seed de Reports Service completado exitosamente");
    logger.info("");
    logger.info("📊 Resumen de datos creados/actualizados:");
    logger.info(`  ✓ ${insertedFeedbacks.length} user feedbacks`);
    logger.info(`  ✓ ${insertedEvaluations.length} user evaluations`);
    logger.info(`  ✓ ${insertedStatistics.length} usage statistics`);
    logger.info(`  ✓ ${insertedDemands.length} unsatisfied demands`);

    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error en seed de Reports Service:", error);
    process.exit(1);
  }
}

// Ejecutar seed
seed();
