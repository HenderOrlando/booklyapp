import { createLogger, SEED_IDS } from "@libs/common";
import { ReferenceDataRepository } from "@libs/database";
import { NestFactory } from "@nestjs/core";
import { getModelToken } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  CheckInOutStatus,
  CheckInOutType,
} from "@libs/common/enums";
import {
  ApprovalFlow,
  ApprovalRequest,
  CheckInOut,
  DocumentTemplate,
  Notification,
} from "../infrastructure/schemas";
import { StockpileModule } from "../stockpile.module";
import { STOCKPILE_REFERENCE_DATA } from "./reference-data.seed-data";

const logger = createLogger("StockpileSeed");

/**
 * Helper: upsert con _id fijo.
 * MongoDB no permite modificar _id en updates, así que usamos $setOnInsert para _id.
 */
async function upsertWithFixedId(
  model: Model<any>,
  filter: Record<string, any>,
  data: Record<string, any>,
): Promise<any> {
  const { _id, ...rest } = data;
  if (!_id) {
    return model.findOneAndUpdate(filter, rest, { upsert: true, new: true });
  }
  return model.findOneAndUpdate(
    filter,
    { $set: rest, $setOnInsert: { _id } } as any,
    { upsert: true, new: true },
  );
}

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
    const checkInOutModel = app.get<Model<CheckInOut>>(
      getModelToken(CheckInOut.name),
    );

    // Limpiar datos existentes (solo con flag --clean)
    if (process.argv.includes("--clean")) {
      logger.warn("🧹 LIMPIEZA DESTRUCTIVA ACTIVADA");
      await approvalRequestModel.deleteMany({});
      await approvalFlowModel.deleteMany({});
      await documentTemplateModel.deleteMany({});
      await notificationModel.deleteMany({});
      await checkInOutModel.deleteMany({});
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

    // ObjectIds fijos desde SEED_IDS
    const systemUserId = new Types.ObjectId(SEED_IDS.SYSTEM_USER_ID);

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
    // IDs fijos desde SEED_IDS
    const reservation1Id = new Types.ObjectId(SEED_IDS.RESERVA_COMPLETADA_ID);
    const reservation2Id = new Types.ObjectId(SEED_IDS.RESERVA_PENDIENTE_ID);
    const COORDINADOR_SISTEMAS_ID = new Types.ObjectId(SEED_IDS.COORDINADOR_SISTEMAS_ID);
    const ESTUDIANTE_MARIA_ID = new Types.ObjectId(SEED_IDS.ESTUDIANTE_MARIA_ID);
    const ADMIN_GENERAL_ID = new Types.ObjectId(SEED_IDS.ADMIN_GENERAL_ID);
    const COORDINADOR_INDUSTRIAL_ID = new Types.ObjectId(SEED_IDS.COORDINADOR_INDUSTRIAL_ID);
    const PROGRAMA_SISTEMAS_ID = new Types.ObjectId(SEED_IDS.PROGRAMA_SISTEMAS_ID);

    // Usamos el primer flow creado (Flujo Multi-nivel (Auditorios))
    const auditoriumFlowId = insertedFlows.find(f => f.name === "Flujo Multi-nivel (Auditorios)")?._id || insertedFlows[0]._id;

    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Fechas de reservas (deben coincidir con availability-service seed)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const approvalRequests = [
      // Solicitud aprobada
      {
        _id: new Types.ObjectId(SEED_IDS.APPROVAL_REQ_APROBADA_ID),
        reservationId: reservation1Id,
        requesterId: COORDINADOR_SISTEMAS_ID,
        programId: PROGRAMA_SISTEMAS_ID, // Programa del recurso
        approvalFlowId: auditoriumFlowId,
        status: "APPROVED",
        currentStepIndex: 2,
        submittedAt: new Date(new Date(lastWeek).setHours(9, 0, 0)),
        completedAt: new Date(new Date(lastWeek).setHours(15, 0, 0)),
        metadata: {
          requesterId: SEED_IDS.COORDINADOR_SISTEMAS_ID,
          resourceId: SEED_IDS.RECURSO_AUDITORIO_ID,
          reservationStartDate: new Date(new Date(lastWeek).setHours(10, 0, 0)).toISOString(),
          reservationEndDate: new Date(new Date(lastWeek).setHours(12, 0, 0)).toISOString(),
          purpose: "Conferencia sobre Inteligencia Artificial",
          userName: "Coordinador Sistemas",
          userEmail: "coord.sistemas@ufps.edu.co",
          userRole: "Coordinador",
          resourceName: "Auditorio Principal",
          resourceType: "AUDITORIUM",
          programName: "Ingeniería de Sistemas",
          attendees: 100,
          priority: "HIGH",
          currentLevel: "FINAL_LEVEL",
          maxLevel: "FINAL_LEVEL",
        },
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
        _id: new Types.ObjectId(SEED_IDS.APPROVAL_REQ_PENDIENTE_ID),
        reservationId: reservation2Id,
        requesterId: ESTUDIANTE_MARIA_ID,
        programId: PROGRAMA_SISTEMAS_ID,
        approvalFlowId: auditoriumFlowId,
        status: "PENDING",
        currentStepIndex: 0,
        submittedAt: new Date(today),
        metadata: {
          requesterId: SEED_IDS.ESTUDIANTE_MARIA_ID,
          resourceId: SEED_IDS.RECURSO_AUDITORIO_ID,
          reservationStartDate: new Date(new Date(nextWeek).setHours(16, 0, 0)).toISOString(),
          reservationEndDate: new Date(new Date(nextWeek).setHours(18, 0, 0)).toISOString(),
          purpose: "Evento Estudiantil",
          userName: "María Estudiante",
          userEmail: "maria.estudiante@ufps.edu.co",
          userRole: "Estudiante",
          resourceName: "Auditorio Principal",
          resourceType: "AUDITORIUM",
          programName: "Ingeniería de Sistemas",
          attendees: 50,
          priority: "NORMAL",
          currentLevel: "FIRST_LEVEL",
          maxLevel: "SECOND_LEVEL",
        },
        approvalHistory: [],
        createdBy: ESTUDIANTE_MARIA_ID,
      },
      // ── CU-019: Solicitud RECHAZADA ──
      {
        _id: new Types.ObjectId(SEED_IDS.APPROVAL_REQ_RECHAZADA_ID),
        reservationId: new Types.ObjectId(SEED_IDS.RESERVA_RECHAZADA_ID),
        requesterId: ESTUDIANTE_MARIA_ID,
        programId: PROGRAMA_SISTEMAS_ID,
        approvalFlowId: auditoriumFlowId,
        status: "REJECTED",
        currentStepIndex: 1,
        submittedAt: new Date(new Date(lastWeek).setHours(8, 0, 0)),
        completedAt: new Date(new Date(lastWeek).setHours(12, 0, 0)),
        metadata: {
          requesterId: SEED_IDS.ESTUDIANTE_MARIA_ID,
          resourceId: SEED_IDS.RECURSO_AUDITORIO_ID,
          reservationStartDate: new Date(new Date(lastWeek).setHours(14, 0, 0)).toISOString(),
          reservationEndDate: new Date(new Date(lastWeek).setHours(18, 0, 0)).toISOString(),
          purpose: "Fiesta de fin de semestre",
          userName: "María Estudiante",
          userEmail: "maria.estudiante@ufps.edu.co",
          userRole: "Estudiante",
          resourceName: "Auditorio Principal",
          resourceType: "AUDITORIUM",
          programName: "Ingeniería de Sistemas",
          attendees: 200,
          priority: "NORMAL",
          currentLevel: "FIRST_LEVEL",
          maxLevel: "SECOND_LEVEL",
          rejectionReason: "El propósito no corresponde a actividad académica",
        },
        approvalHistory: [
          {
            stepName: "Revisión por Coordinador de Programa",
            approverId: COORDINADOR_SISTEMAS_ID,
            decision: "REJECTED",
            comment: "El propósito no corresponde a actividad académica",
            approvedAt: new Date(new Date(lastWeek).setHours(12, 0, 0)),
          },
        ],
        createdBy: ESTUDIANTE_MARIA_ID,
        updatedBy: COORDINADOR_SISTEMAS_ID,
      },
      // ── Solicitud EN REVISIÓN (en proceso) ──
      {
        _id: new Types.ObjectId(SEED_IDS.APPROVAL_REQ_IN_REVIEW_ID),
        reservationId: new Types.ObjectId(SEED_IDS.RESERVA_APROBADA_ID),
        requesterId: COORDINADOR_INDUSTRIAL_ID,
        programId: PROGRAMA_SISTEMAS_ID,
        approvalFlowId: auditoriumFlowId,
        status: "IN_REVIEW",
        currentStepIndex: 1,
        submittedAt: new Date(new Date(today).setHours(7, 0, 0)),
        metadata: {
          requesterId: SEED_IDS.COORDINADOR_INDUSTRIAL_ID,
          resourceId: SEED_IDS.RECURSO_LAB_SIS_1_ID,
          reservationStartDate: new Date(new Date(tomorrow).setHours(14, 0, 0)).toISOString(),
          reservationEndDate: new Date(new Date(tomorrow).setHours(16, 0, 0)).toISOString(),
          purpose: "Práctica de Laboratorio de Producción",
          userName: "Coordinador Industrial",
          userEmail: "coord.industrial@ufps.edu.co",
          userRole: "Coordinador",
          resourceName: "Laboratorio de Sistemas 1",
          resourceType: "LAB",
          programName: "Ingeniería Industrial",
          attendees: 30,
          priority: "NORMAL",
          currentLevel: "SECOND_LEVEL",
          maxLevel: "FINAL_LEVEL",
        },
        approvalHistory: [
          {
            stepName: "VoBo del docente responsable",
            approverId: COORDINADOR_SISTEMAS_ID,
            decision: "APPROVED",
            comment: "Evento académico válido",
            approvedAt: new Date(new Date(today).setHours(9, 0, 0)),
          },
        ],
        createdBy: COORDINADOR_INDUSTRIAL_ID,
        updatedBy: COORDINADOR_SISTEMAS_ID,
      },
      // ── Solicitud CANCELADA ──
      {
        _id: new Types.ObjectId(SEED_IDS.APPROVAL_REQ_CANCELADA_ID),
        reservationId: new Types.ObjectId(SEED_IDS.RESERVA_CANCELADA_ID),
        requesterId: ESTUDIANTE_MARIA_ID,
        programId: PROGRAMA_SISTEMAS_ID,
        approvalFlowId: auditoriumFlowId,
        status: "CANCELLED",
        currentStepIndex: 0,
        submittedAt: new Date(new Date(lastWeek).setHours(10, 0, 0)),
        completedAt: new Date(new Date(lastWeek).setHours(11, 0, 0)),
        metadata: {
          requesterId: SEED_IDS.ESTUDIANTE_MARIA_ID,
          resourceId: SEED_IDS.RECURSO_SALA_CONF_A_ID,
          reservationStartDate: new Date(new Date(lastWeek).setHours(15, 0, 0)).toISOString(),
          reservationEndDate: new Date(new Date(lastWeek).setHours(17, 0, 0)).toISOString(),
          purpose: "Tutoría Grupal",
          userName: "María Estudiante",
          userEmail: "maria.estudiante@ufps.edu.co",
          userRole: "Estudiante",
          resourceName: "Sala de Conferencias A",
          resourceType: "MEETING_ROOM",
          programName: "Ingeniería de Sistemas",
          attendees: 10,
          priority: "LOW",
          currentLevel: "FIRST_LEVEL",
          maxLevel: "FIRST_LEVEL",
        },
        approvalHistory: [],
        createdBy: ESTUDIANTE_MARIA_ID,
        updatedBy: ESTUDIANTE_MARIA_ID,
      },
    ];

    logger.info(
      `Procesando ${approvalRequests.length} solicitudes de aprobación...`,
    );
    const insertedRequests: any[] = [];

    for (const request of approvalRequests) {
      const doc = await upsertWithFixedId(
        approvalRequestModel,
        { reservationId: request.reservationId },
        request,
      );
      insertedRequests.push(doc);
    }

    // Notificaciones (RF-22, RF-28) - Todos los canales, estados y tipos
    const resourceAuditorioId = new Types.ObjectId(SEED_IDS.RECURSO_AUDITORIO_ID);
    const resourceLabId = new Types.ObjectId(SEED_IDS.RECURSO_LAB_SIS_1_ID);

    const notifications = [
      // EMAIL - SENT - APPROVAL
      {
        recipientId: COORDINADOR_SISTEMAS_ID,
        recipientName: "Juan Docente",
        type: "APPROVAL",
        channel: "EMAIL",
        subject: "Reserva Aprobada",
        message: "Su reserva ha sido aprobada exitosamente.",
        status: "SENT",
        priority: "NORMAL",
        relatedEntity: "approval_request",
        relatedEntityId: insertedRequests[0]._id,
        sentAt: new Date(new Date(lastWeek).setHours(15, 30, 0)),
        audit: { createdBy: systemUserId },
      },
      // EMAIL - SENT - PENDING_APPROVAL
      {
        recipientId: ESTUDIANTE_MARIA_ID,
        recipientName: "María Estudiante",
        type: "PENDING_APPROVAL",
        channel: "EMAIL",
        subject: "Solicitud en Revisión",
        message: "Su solicitud de reserva está siendo revisada.",
        status: "SENT",
        priority: "NORMAL",
        relatedEntity: "approval_request",
        relatedEntityId: insertedRequests[1]._id,
        sentAt: new Date(today),
        audit: { createdBy: systemUserId },
      },
      // EMAIL - SENT - REJECTION (HU-19)
      {
        recipientId: ESTUDIANTE_MARIA_ID,
        recipientName: "María Estudiante",
        type: "REJECTION",
        channel: "EMAIL",
        subject: "Solicitud Rechazada",
        message: "Su solicitud de reserva ha sido rechazada. Motivo: El propósito no corresponde a actividad académica.",
        status: "SENT",
        priority: "HIGH",
        relatedEntity: "approval_request",
        relatedEntityId: insertedRequests[2]?._id || insertedRequests[0]._id,
        sentAt: new Date(new Date(lastWeek).setHours(12, 30, 0)),
        audit: { createdBy: systemUserId },
      },
      // WHATSAPP - SENT - REMINDER (HU-24)
      {
        recipientId: COORDINADOR_SISTEMAS_ID,
        recipientName: "Juan Docente",
        type: "REMINDER",
        channel: "WHATSAPP",
        subject: "Recordatorio de Reserva",
        message: "Recuerde que tiene una reserva mañana a las 9:00 AM en el Auditorio Principal.",
        status: "SENT",
        priority: "NORMAL",
        relatedEntity: "reservation",
        relatedEntityId: reservation1Id,
        sentAt: new Date(new Date(today).setHours(18, 0, 0)),
        audit: { createdBy: systemUserId },
      },
      // SMS - FAILED (error de envío)
      {
        recipientId: ESTUDIANTE_MARIA_ID,
        recipientName: "María Estudiante",
        type: "CANCELLATION",
        channel: "SMS",
        subject: "Reserva Cancelada",
        message: "Su reserva ha sido cancelada.",
        status: "FAILED",
        priority: "HIGH",
        relatedEntity: "reservation",
        relatedEntityId: reservation2Id,
        errorMessage: "Error al enviar SMS: número no válido",
        audit: { createdBy: systemUserId },
      },
      // IN_APP - PENDING (no leída)
      {
        recipientId: ADMIN_GENERAL_ID,
        recipientName: "Admin Principal",
        type: "PENDING_APPROVAL",
        channel: "IN_APP",
        subject: "Nueva solicitud pendiente",
        message: "Hay una nueva solicitud de aprobación que requiere su revisión.",
        status: "PENDING",
        priority: "URGENT",
        relatedEntity: "approval_request",
        relatedEntityId: insertedRequests[1]._id,
        audit: { createdBy: systemUserId },
      },
      // IN_APP - READ
      {
        recipientId: COORDINADOR_SISTEMAS_ID,
        recipientName: "Juan Docente",
        type: "SYSTEM",
        channel: "IN_APP",
        subject: "Mantenimiento programado",
        message: "El Laboratorio de Sistemas 1 estará en mantenimiento la próxima semana.",
        status: "READ",
        priority: "LOW",
        relatedEntity: "resource",
        relatedEntityId: resourceLabId,
        sentAt: new Date(new Date(lastWeek).setHours(10, 0, 0)),
        readAt: new Date(new Date(lastWeek).setHours(11, 0, 0)),
        audit: { createdBy: systemUserId },
      },
    ];

    logger.info(`Procesando ${notifications.length} notificaciones...`);
    const insertedNotifications: any[] = [];

    for (const notif of notifications) {
      const doc = await notificationModel.findOneAndUpdate(
        {
          recipientId: notif.recipientId,
          subject: notif.subject,
          channel: notif.channel,
        },
        notif,
        { upsert: true, new: true },
      );
      insertedNotifications.push(doc);
    }

    // ── Check-in/Check-out Records (HU-23, RF-26) ──
    const STAFF_VIGILANTE_ID = new Types.ObjectId(SEED_IDS.STAFF_VIGILANTE_ID);

    const checkInOuts = [
      // Check-in + Check-out completado (reserva pasada)
      {
        reservationId: reservation1Id,
        resourceId: resourceAuditorioId,
        userId: COORDINADOR_SISTEMAS_ID,
        status: CheckInOutStatus.CHECKED_OUT,
        checkInTime: new Date(new Date(lastWeek).setHours(9, 55, 0)),
        checkInBy: STAFF_VIGILANTE_ID,
        checkInType: CheckInOutType.MANUAL,
        checkInNotes: "Docente llegó puntual",
        checkOutTime: new Date(new Date(lastWeek).setHours(12, 10, 0)),
        checkOutBy: STAFF_VIGILANTE_ID,
        checkOutType: CheckInOutType.MANUAL,
        checkOutNotes: "Salida normal, recurso en buen estado",
        expectedReturnTime: new Date(new Date(lastWeek).setHours(12, 0, 0)),
        actualReturnTime: new Date(new Date(lastWeek).setHours(12, 10, 0)),
        resourceCondition: {
          beforeCheckIn: "Buen estado",
          afterCheckOut: "Buen estado",
          damageReported: false,
        },
      },
      // Check-in sin check-out aún (reserva en progreso)
      {
        reservationId: new Types.ObjectId(SEED_IDS.RESERVA_IN_PROGRESS_ID),
        resourceId: new Types.ObjectId(SEED_IDS.RECURSO_SALA_CONF_A_ID),
        userId: COORDINADOR_SISTEMAS_ID,
        status: CheckInOutStatus.CHECKED_IN,
        checkInTime: new Date(new Date(today).setHours(7, 55, 0)),
        checkInBy: STAFF_VIGILANTE_ID,
        checkInType: CheckInOutType.MANUAL,
        checkInNotes: "Check-in para reunión de planeación",
        expectedReturnTime: new Date(new Date(today).setHours(10, 0, 0)),
        resourceCondition: {
          beforeCheckIn: "Buen estado",
          damageReported: false,
        },
      },
      // Check-out tardío (LATE)
      {
        reservationId: new Types.ObjectId(SEED_IDS.RESERVA_NO_SHOW_ID),
        resourceId: resourceLabId,
        userId: ESTUDIANTE_MARIA_ID,
        status: CheckInOutStatus.LATE,
        checkInTime: new Date(new Date(lastWeek).setHours(8, 0, 0)),
        checkInBy: STAFF_VIGILANTE_ID,
        checkInType: CheckInOutType.MANUAL,
        checkOutTime: new Date(new Date(lastWeek).setHours(11, 30, 0)),
        checkOutBy: STAFF_VIGILANTE_ID,
        checkOutType: CheckInOutType.MANUAL,
        checkOutNotes: "Devolución tardía - 1.5 horas después de lo esperado",
        expectedReturnTime: new Date(new Date(lastWeek).setHours(10, 0, 0)),
        actualReturnTime: new Date(new Date(lastWeek).setHours(11, 30, 0)),
        resourceCondition: {
          beforeCheckIn: "Buen estado",
          afterCheckOut: "Buen estado",
          damageReported: false,
        },
      },
    ];

    logger.info(`Procesando ${checkInOuts.length} registros de check-in/out...`);
    const insertedCheckInOuts: any[] = [];

    for (const cio of checkInOuts) {
      const doc = await checkInOutModel.findOneAndUpdate(
        { reservationId: cio.reservationId },
        cio,
        { upsert: true, new: true },
      );
      insertedCheckInOuts.push(doc);
    }

    logger.info("✅ Seed de Stockpile Service completado exitosamente");
    logger.info("");
    logger.info("📊 Resumen de datos creados/actualizados:");
    logger.info(`  ✓ ${insertedFlows.length} flujos de aprobación`);
    logger.info(`  ✓ ${insertedTemplates.length} plantillas de documentos`);
    logger.info(`  ✓ ${insertedRequests.length} solicitudes de aprobación`);
    logger.info(`  ✓ ${insertedNotifications.length} notificaciones`);
    logger.info(`  ✓ ${insertedCheckInOuts.length} registros check-in/out`);

    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error en seed de Stockpile Service:", error);
    process.exit(1);
  }
}

// Ejecutar seed
seed();
