import { createLogger } from "@libs/common";
import { Connection } from "mongoose";

const logger = createLogger("MongoDBIndexes");

/**
 * Índices MongoDB para Stockpile Service
 * Optimización de queries de fecha, búsquedas y analytics
 */
export async function createMongoDBIndexes(connection: Connection) {
  try {
    logger.info("Creating MongoDB indexes...");

    // ===== CHECK-IN-OUT COLLECTION =====
    const checkInOutCollection = connection.collection("checkinouts");

    // Índice compuesto para queries de fecha (analytics)
    await checkInOutCollection.createIndex(
      { checkInTime: 1, checkOutTime: 1 },
      {
        name: "idx_checkin_checkout_time",
        background: true,
      }
    );

    // Índice para búsquedas por recurso y fecha
    await checkInOutCollection.createIndex(
      { resourceId: 1, checkInTime: 1 },
      {
        name: "idx_resource_checkin_time",
        background: true,
      }
    );

    // Índice para búsquedas por usuario
    await checkInOutCollection.createIndex(
      { userId: 1, checkInTime: -1 },
      {
        name: "idx_user_checkin_time_desc",
        background: true,
      }
    );

    // Índice para búsqueda por reserva
    await checkInOutCollection.createIndex(
      { reservationId: 1 },
      {
        name: "idx_reservation_id",
        unique: true,
        background: true,
      }
    );

    // Índice para check-ins activos
    await checkInOutCollection.createIndex(
      { status: 1, checkInTime: -1 },
      {
        name: "idx_status_checkin_time",
        background: true,
      }
    );

    // Índice para recursos vencidos (overdue)
    await checkInOutCollection.createIndex(
      { status: 1, expectedReturnTime: 1 },
      {
        name: "idx_status_expected_return",
        background: true,
      }
    );

    // Índice compuesto para analytics de fecha completo
    await checkInOutCollection.createIndex(
      {
        checkInTime: 1,
        checkOutTime: 1,
        resourceId: 1,
        userId: 1,
      },
      {
        name: "idx_analytics_composite",
        background: true,
      }
    );

    // ===== APPROVAL-REQUESTS COLLECTION =====
    const approvalRequestsCollection =
      connection.collection("approvalrequests");

    // Índice para solicitudes pendientes
    await approvalRequestsCollection.createIndex(
      { status: 1, createdAt: 1 },
      {
        name: "idx_status_created",
        background: true,
      }
    );

    // Índice para búsqueda por aprobador
    await approvalRequestsCollection.createIndex(
      { "approvers.userId": 1, status: 1 },
      {
        name: "idx_approver_status",
        background: true,
      }
    );

    // Índice para solicitudes por reserva
    await approvalRequestsCollection.createIndex(
      { reservationId: 1 },
      {
        name: "idx_approval_reservation",
        background: true,
      }
    );

    // Índice para recordatorios pendientes (fecha)
    await approvalRequestsCollection.createIndex(
      { status: 1, updatedAt: 1 },
      {
        name: "idx_status_updated_reminders",
        background: true,
      }
    );

    // ===== DIGITAL-SIGNATURES COLLECTION =====
    // Si se implementa persistencia de firmas en MongoDB
    const signaturesCollection = connection.collection("digitalsignatures");

    // Índice para búsqueda por usuario
    await signaturesCollection.createIndex(
      { userId: 1, timestamp: -1 },
      {
        name: "idx_user_timestamp",
        background: true,
      }
    );

    // Índice único por hash de firma
    await signaturesCollection.createIndex(
      { hash: 1 },
      {
        name: "idx_signature_hash",
        unique: true,
        background: true,
      }
    );

    // Índice TTL para limpieza automática (365 días)
    await signaturesCollection.createIndex(
      { timestamp: 1 },
      {
        name: "idx_signature_ttl",
        expireAfterSeconds: 31536000, // 365 días
        background: true,
      }
    );

    logger.info("MongoDB indexes created successfully", {
      collections: ["checkinouts", "approvalrequests", "digitalsignatures"],
    });

    // Listar índices creados
    const checkInOutIndexes = await checkInOutCollection.indexes();
    logger.debug("CheckInOut indexes", {
      count: checkInOutIndexes.length,
      indexes: checkInOutIndexes.map((idx) => idx.name),
    });

    const approvalIndexes = await approvalRequestsCollection.indexes();
    logger.debug("ApprovalRequest indexes", {
      count: approvalIndexes.length,
      indexes: approvalIndexes.map((idx) => idx.name),
    });

    return {
      success: true,
      message: "All indexes created successfully",
    };
  } catch (error) {
    logger.error("Error creating MongoDB indexes", error as Error);
    throw error;
  }
}

/**
 * Verificar y reportar índices existentes
 */
export async function verifyIndexes(connection: Connection) {
  try {
    const collections = ["checkinouts", "approvalrequests"];
    const report: Record<string, any> = {};

    for (const collectionName of collections) {
      const collection = connection.collection(collectionName);
      const indexes = await collection.indexes();

      report[collectionName] = {
        total: indexes.length,
        indexes: indexes.map((idx) => ({
          name: idx.name,
          keys: idx.key,
          unique: idx.unique || false,
          background: idx.background || false,
        })),
      };
    }

    logger.info("Index verification completed", report);
    return report;
  } catch (error) {
    logger.error("Error verifying indexes", error as Error);
    throw error;
  }
}

/**
 * Analizar estadísticas de uso de índices
 */
export async function analyzeIndexUsage(connection: Connection) {
  try {
    if (!connection.db) {
      throw new Error("Database connection not available");
    }

    const checkInOutStats = await connection.db
      .collection("checkinouts")
      .aggregate([{ $indexStats: {} }])
      .toArray();

    logger.info("CheckInOut index usage stats", {
      count: checkInOutStats.length,
      stats: checkInOutStats.map((stat) => ({
        name: stat.name,
        accesses: stat.accesses,
        since: stat.accesses?.since,
      })),
    });

    return {
      checkinouts: checkInOutStats,
    };
  } catch (error) {
    logger.error("Error analyzing index usage", error as Error);
    throw error;
  }
}
