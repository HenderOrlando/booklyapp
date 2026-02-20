import { createLogger } from "@libs/common";
import { ReferenceDataRepository } from "@libs/database";
import { NestFactory } from "@nestjs/core";
import { getModelToken } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  ApprovalFlow,
  ApprovalRequest,
  DocumentTemplate,
  Notification,
} from "../infrastructure/schemas";
import { StockpileModule } from "../stockpile.module";
import { STOCKPILE_REFERENCE_DATA } from "./reference-data.seed-data";

const logger = createLogger("StockpileSeed");

/**
 * Seed data para Stockpile Service
 * Crea flujos de aprobación, solicitudes, documentos y notificaciones
 */
async function seed() {
  try {
    logger.info("🌱 Iniciando seed de Stockpile Service...");

    const app = await NestFactory.createApplicationContext(StockpileModule);
    const approvalRequestModel = app.get<Model<ApprovalRequest>>(
      getModelToken(ApprovalRequest.name),
    );
    const approvalFlowModel = app.get<Model<ApprovalFlow>>(
      getModelToken(ApprovalFlow.name),
    );
    const documentTemplateModel = app.get<Model<DocumentTemplate>>(
      getModelToken(DocumentTemplate.name),
    );
    const notificationModel = app.get<Model<Notification>>(
      getModelToken(Notification.name),
    );

    // Limpiar datos existentes (solo con flag --clean)
    if (process.argv.includes("--clean")) {
      logger.warn("🧹 LIMPIEZA DESTRUCTIVA ACTIVADA");
      await approvalRequestModel.deleteMany({});
      await approvalFlowModel.deleteMany({});
      await documentTemplateModel.deleteMany({});
      await notificationModel.deleteMany({});
    } else if (process.env.NODE_ENV === "development") {
      logger.info(
        "ℹ️ Modo desarrollo detectado. Usar --clean para limpiar DB antes del seed.",
      );
    }

    // ── Reference Data (tipos, estados dinámicos del dominio stockpile) ──
    const refDataRepo = app.get(ReferenceDataRepository);
    logger.info(
      `📋 Procesando ${STOCKPILE_REFERENCE_DATA.length} datos de referencia...`,
    );
    for (const rd of STOCKPILE_REFERENCE_DATA) {
      await refDataRepo.upsert(rd);
    }
    logger.info(
      `✅ ${STOCKPILE_REFERENCE_DATA.length} datos de referencia procesados (upsert)`,
    );

    // ObjectIds fijos para consistencia
    const systemUserId = new Types.ObjectId("507f1f77bcf86cd799439000");

    // Flujos de aprobación (RF-24)
    const approvalFlows = [
      {
        name: "Flujo Rápido Docente",
        description:
          "Auto-aprobación para docentes reservando aulas de su programa. Sin intervención manual.",
        resourceTypes: ["CLASSROOM", "LAB"],
        steps: [],
        autoApproveConditions: {
          roleWhitelist: ["TEACHER", "PROFESSOR"],
          maxDurationMinutes: 120,
          maxAdvanceDays: 7,
        },
        isActive: true,
        createdBy: systemUserId,
        updatedBy: systemUserId,
      },
      {
        name: "Flujo Estándar",
        description:
          "Una sola aprobación por el administrador de programa. Para estudiantes y personal no docente.",
        resourceTypes: ["CLASSROOM", "LAB", "MEETING_ROOM"],
        steps: [
          {
            name: "Aprobación del administrador de programa",
            approverRoles: ["PROGRAM_ADMIN"],
            order: 1,
            isRequired: true,
            allowParallel: false,
            timeoutHours: 48,
          },
        ],
        autoApproveConditions: {
          roleWhitelist: [],
          maxDurationMinutes: 0,
          maxAdvanceDays: 0,
        },
        isActive: true,
        createdBy: systemUserId,
        updatedBy: systemUserId,
      },
      {
        name: "Flujo Multi-nivel (Auditorios)",
        description:
          "Requiere VoBo del docente responsable + aprobación del jefe de programa. Para auditorios y espacios de alto impacto.",
        resourceTypes: ["AUDITORIUM", "CONFERENCE_HALL"],
        steps: [
          {
            name: "VoBo del docente responsable del evento",
            approverRoles: ["TEACHER"],
            order: 1,
            isRequired: true,
            allowParallel: false,
            timeoutHours: 24,
          },
          {
            name: "Aprobación del director de programa",
            approverRoles: ["PROGRAM_DIRECTOR"],
            order: 2,
            isRequired: true,
            allowParallel: false,
            timeoutHours: 48,
          },
        ],
        autoApproveConditions: {
          roleWhitelist: [],
          maxDurationMinutes: 0,
          maxAdvanceDays: 0,
        },
        isActive: true,
        createdBy: systemUserId,
        updatedBy: systemUserId,
      },
      {
        name: "Flujo Eventos Institucionales",
        description:
          "Tres niveles de aprobación para eventos que afectan múltiples recursos o duran más de un día.",
        resourceTypes: ["AUDITORIUM", "OUTDOOR_SPACE"],
        steps: [
          {
            name: "VoBo docente organizador",
            approverRoles: ["TEACHER"],
            order: 1,
            isRequired: true,
            allowParallel: false,
            timeoutHours: 24,
          },
          {
            name: "Aprobación del director de programa",
            approverRoles: ["PROGRAM_DIRECTOR"],
            order: 2,
            isRequired: true,
            allowParallel: false,
            timeoutHours: 48,
          },
          {
            name: "Aprobación final de administración general",
            approverRoles: ["GENERAL_ADMIN"],
            order: 3,
            isRequired: true,
            allowParallel: false,
            timeoutHours: 72,
          },
        ],
        autoApproveConditions: {
          roleWhitelist: [],
          maxDurationMinutes: 0,
          maxAdvanceDays: 0,
        },
        isActive: false,
        createdBy: systemUserId,
        updatedBy: systemUserId,
      },
    ];

    logger.info(`Procesando ${approvalFlows.length} flujos de aprobación...`);
    const insertedFlows: any[] = [];

    for (const flow of approvalFlows) {
      const doc = await approvalFlowModel.findOneAndUpdate(
        { name: flow.name },
        flow,
        { upsert: true, new: true },
      );
      insertedFlows.push(doc);
    }

    // Plantillas de documentos (RF-21)
    const documentTemplates = [
      {
        name: "Carta de Aprobación",
        type: "APPROVAL",
        description: "Carta oficial de aprobación de reserva",
        template: `<html><body><h1>Carta de Aprobación de Reserva</h1><p>Fecha: {{date}}</p><p>Estimado/a {{userName}},</p><p>Le informamos que su solicitud de reserva del recurso <strong>{{resourceName}}</strong> para el día {{reservationDate}} de {{startTime}} a {{endTime}} ha sido <strong>APROBADA</strong>.</p><p>Propósito: {{purpose}}</p><p>Aprobado por: {{approvedBy}}</p><p>Atentamente,</p><p>Sistema de Gestión de Reservas - Bookly</p></body></html>`,
        variables: [
          "date",
          "userName",
          "resourceName",
          "reservationDate",
          "startTime",
          "endTime",
          "purpose",
          "approvedBy",
        ],
        isActive: true,
        format: "PDF",
        audit: {
          createdBy: systemUserId,
          updatedBy: systemUserId,
        },
      },
      {
        name: "Carta de Rechazo",
        type: "REJECTION",
        description: "Carta oficial de rechazo de reserva",
        template: `<html><body><h1>Carta de Rechazo de Reserva</h1><p>Fecha: {{date}}</p><p>Estimado/a {{userName}},</p><p>Lamentamos informarle que su solicitud de reserva del recurso <strong>{{resourceName}}</strong> para el día {{reservationDate}} de {{startTime}} a {{endTime}} ha sido <strong>RECHAZADA</strong>.</p><p>Motivo: {{reason}}</p><p>Rechazado por: {{rejectedBy}}</p><p>Para más información, contacte con la administración.</p><p>Atentamente,</p><p>Sistema de Gestión de Reservas - Bookly</p></body></html>`,
        variables: [
          "date",
          "userName",
          "resourceName",
          "reservationDate",
          "startTime",
          "endTime",
          "reason",
          "rejectedBy",
        ],
        isActive: true,
        format: "PDF",
        audit: {
          createdBy: systemUserId,
          updatedBy: systemUserId,
        },
      },
      {
        name: "Certificado de Uso",
        type: "CERTIFICATE",
        description: "Certificado de uso de recurso",
        template: `<html><body><h1>Certificado de Uso de Recurso</h1><p>Este documento certifica que:</p><p><strong>{{userName}}</strong> ({{userEmail}})</p><p>Hizo uso del recurso <strong>{{resourceName}}</strong></p><p>Fecha: {{reservationDate}}</p><p>Horario: {{startTime}} - {{endTime}}</p><p>Propósito: {{purpose}}</p><p>Check-in: {{checkInTime}}</p><p>Check-out: {{checkOutTime}}</p><p>Atentamente,</p><p>Sistema de Gestión de Reservas - Bookly</p></body></html>`,
        variables: [
          "userName",
          "userEmail",
          "resourceName",
          "reservationDate",
          "startTime",
          "endTime",
          "purpose",
          "checkInTime",
          "checkOutTime",
        ],
        isActive: true,
        format: "PDF",
        audit: {
          createdBy: systemUserId,
          updatedBy: systemUserId,
        },
      },
    ];

    logger.info(
      `Procesando ${documentTemplates.length} plantillas de documentos...`,
    );
    const insertedTemplates: any[] = [];

    for (const template of documentTemplates) {
      const doc = await documentTemplateModel.findOneAndUpdate(
        { name: template.name },
        template,
        { upsert: true, new: true },
      );
      insertedTemplates.push(doc);
    }

    // Solicitudes de aprobación (RF-20, RF-25)
    // IDs fijos para consistencia cross-service (según SEED_IDS_REFERENCE.md)
    const reservation1Id = new Types.ObjectId("507f1f77bcf86cd799439031");
    const reservation2Id = new Types.ObjectId("507f1f77bcf86cd799439032");
    const COORDINADOR_SISTEMAS_ID = new Types.ObjectId(
      "507f1f77bcf86cd799439021",
    );
    const ESTUDIANTE_MARIA_ID = new Types.ObjectId("507f1f77bcf86cd799439023");
    const ADMIN_GENERAL_ID = new Types.ObjectId("507f1f77bcf86cd799439022");

    const PROGRAMA_SISTEMAS_ID = new Types.ObjectId("507f1f77bcf86cd799439041");

    // Usamos el primer flow creado (Flujo Multi-nivel (Auditorios))
    const auditoriumFlowId = insertedFlows.find(f => f.name === "Flujo Multi-nivel (Auditorios)")?._id || insertedFlows[0]._id;

    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const approvalRequests = [
      // Solicitud aprobada
      {
        reservationId: reservation1Id,
        requesterId: COORDINADOR_SISTEMAS_ID,
        programId: PROGRAMA_SISTEMAS_ID, // Programa del recurso
        approvalFlowId: auditoriumFlowId,
        status: "APPROVED",
        currentStepIndex: 2,
        submittedAt: new Date(new Date(lastWeek).setHours(9, 0, 0)),
        completedAt: new Date(new Date(lastWeek).setHours(15, 0, 0)),
        approvalHistory: [
          {
            stepName: "Revisión por Coordinador de Programa",
            approverId: COORDINADOR_SISTEMAS_ID, // Coordinador aprueba
            decision: "APPROVED",
            comment: "Aprobado por coordinación de programa",
            approvedAt: new Date(new Date(lastWeek).setHours(10, 0, 0)),
          },
          {
            stepName: "Aprobación Final por Administración",
            approverId: ADMIN_GENERAL_ID, // Admin aprueba finalmente
            decision: "APPROVED",
            comment: "Aprobado por administración general",
            approvedAt: new Date(new Date(lastWeek).setHours(15, 0, 0)),
          },
        ],
        createdBy: COORDINADOR_SISTEMAS_ID,
        updatedBy: ADMIN_GENERAL_ID,
      },
      // Solicitud pendiente
      {
        reservationId: reservation2Id,
        requesterId: ESTUDIANTE_MARIA_ID,
        programId: PROGRAMA_SISTEMAS_ID, // Programa del recurso
        approvalFlowId: auditoriumFlowId,
        status: "PENDING",
        currentStepIndex: 0,
        submittedAt: new Date(today),
        approvalHistory: [],
        createdBy: ESTUDIANTE_MARIA_ID,
      },
    ];

    logger.info(
      `Procesando ${approvalRequests.length} solicitudes de aprobación...`,
    );
    const insertedRequests: any[] = [];

    for (const request of approvalRequests) {
      const doc = await approvalRequestModel.findOneAndUpdate(
        { reservationId: request.reservationId },
        request,
        { upsert: true, new: true },
      );
      insertedRequests.push(doc);
    }

    // Notificaciones (RF-22, RF-28)
    const notifications = [
      {
        recipientId: COORDINADOR_SISTEMAS_ID,
        recipientName: "Juan Docente",
        type: "APPROVAL",
        channel: "EMAIL",
        subject: "Reserva Aprobada",
        message: "Su reserva ha sido aprobada exitosamente.",
        status: "SENT",
        relatedEntity: "approval_request",
        relatedEntityId: insertedRequests[0]._id,
        sentAt: new Date(new Date(lastWeek).setHours(15, 30, 0)),
        audit: {
          createdBy: systemUserId,
        },
      },
      {
        recipientId: ESTUDIANTE_MARIA_ID,
        recipientName: "María Estudiante",
        type: "PENDING_APPROVAL",
        channel: "EMAIL",
        subject: "Solicitud en Revisión",
        message: "Su solicitud de reserva está siendo revisada.",
        status: "SENT",
        relatedEntity: "approval_request",
        relatedEntityId: insertedRequests[1]._id,
        sentAt: new Date(today),
        audit: {
          createdBy: systemUserId,
        },
      },
    ];

    logger.info(`Procesando ${notifications.length} notificaciones...`);
    const insertedNotifications: any[] = [];

    for (const notif of notifications) {
      const doc = await notificationModel.findOneAndUpdate(
        {
          recipientId: notif.recipientId,
          relatedEntityId: notif.relatedEntityId,
        },
        notif,
        { upsert: true, new: true },
      );
      insertedNotifications.push(doc);
    }

    logger.info("✅ Seed de Stockpile Service completado exitosamente");
    logger.info("");
    logger.info("📊 Resumen de datos creados/actualizados:");
    logger.info(`  ✓ ${insertedFlows.length} flujos de aprobación`);
    logger.info(`  ✓ ${insertedTemplates.length} plantillas de documentos`);
    logger.info(`  ✓ ${insertedRequests.length} solicitudes de aprobación`);
    logger.info(`  ✓ ${insertedNotifications.length} notificaciones`);

    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error en seed de Stockpile Service:", error);
    process.exit(1);
  }
}

// Ejecutar seed
seed();
