#!/usr/bin/env ts-node

/**
 * Script de prueba para WebSocket Client
 * Testing de conexión y eventos en tiempo real
 */

import { io, Socket } from "socket.io-client";
import { createLogger } from "../libs/common/src/utils/logger.util";

const logger = createLogger("WebSocketTestClient");

const WEBSOCKET_URL =
  process.env.WEBSOCKET_URL || "http://localhost:3000/api/v1/ws";
const USER_ID = process.env.USER_ID || "test-user-123";

logger.info("🔌 Bookly WebSocket Client Test");
logger.info(`Connecting to: ${WEBSOCKET_URL}`);
logger.info(`User ID: ${USER_ID}`);

const socket: Socket = io(WEBSOCKET_URL, {
  query: {
    userId: USER_ID,
  },
  // auth: {
  //   token: "your-jwt-token-here",
  // },
});

// Connection events
socket.on("connect", () => {
  logger.info("✅ Connected:", { socketId: socket.id });

  // Subscribe to all channels
  logger.info("📡 Subscribing to channels...");

  socket.emit(
    "subscribe",
    {
      channels: ["events", "dlq", "dashboard", "notifications", "logs"],
      eventFilters: {
        eventTypes: ["RESOURCE_CREATED", "RESERVATION_CREATED"],
        services: ["resources-service", "availability-service"],
      },
      dlqFilters: {
        status: "pending",
      },
      logFilters: {
        level: "error",
      },
    },
    (response: any) => {
      logger.info("✅ Subscribed to channels:", {
        channels: response.channels,
      });
    }
  );
});

socket.on("disconnect", () => {
  logger.warn("❌ Disconnected");
});

socket.on("connect_error", (error) => {
  logger.error("❌ Connection error", error, { message: error.message });
});

// Event Bus events
socket.on("event:created", (data) => {
  logger.info("📨 [EVENT:CREATED]", {
    eventId: data.eventId,
    eventType: data.eventType,
    service: data.service,
  });
});

socket.on("event:failed", (data) => {
  logger.error("❌ [EVENT:FAILED]", undefined, {
    eventId: data.eventId,
    error: data.error,
  });
});

// DLQ events
socket.on("dlq:event:added", (data) => {
  logger.warn("⚠️  [DLQ:EVENT:ADDED]", {
    dlqId: data.dlqId,
    error: data.error,
  });
});

socket.on("dlq:stats:updated", (data) => {
  logger.info("📊 [DLQ:STATS:UPDATED]", {
    total: data.stats.total,
    pending: data.stats.pending,
    retrying: data.stats.retrying,
    failed: data.stats.failed,
    resolved: data.stats.resolved,
  });
});

// Dashboard events
socket.on("dashboard:metrics:updated", (data) => {
  logger.info("📊 [DASHBOARD:METRICS:UPDATED]", {
    avgLatency: data.metrics.avgLatency,
    throughput: data.metrics.throughput,
    totalEvents: data.metrics.totalEvents,
    failedEvents: data.metrics.failedEvents,
  });
});

socket.on("service:status:changed", (data) => {
  logger.info("🔄 [SERVICE:STATUS:CHANGED]", {
    service: data.service,
    status: data.status,
  });
});

// Notification events
socket.on("notification:created", (notification) => {
  logger.info("🔔 [NOTIFICATION:CREATED]", {
    id: notification.id,
    type: notification.type,
    category: notification.category,
    title: notification.title,
    message: notification.message,
  });
});

socket.on("notification:read", (data) => {
  logger.info("✅ [NOTIFICATION:READ]", {
    notificationId: data.notificationId,
  });
});

socket.on("notifications:initial", (notifications) => {
  logger.info(`🔔 Initial notifications: ${notifications.length} unread`);
  notifications.slice(0, 3).forEach((n: any) => {
    logger.info(`   - [${n.type}] ${n.title}`);
  });
});

// Log events
socket.on("log:entry", (log) => {
  logger.info(`📝 [LOG:${log.level.toUpperCase()}]`, {
    service: log.service,
    context: log.context,
    message: log.message,
  });
});

socket.on("log:error", (log) => {
  logger.error("🔴 [LOG:ERROR]", undefined, {
    service: log.service,
    context: log.context,
    message: log.message,
    stack: log.stack ? log.stack.split("\n")[0] : undefined,
  });
});

socket.on("log:warning", (log) => {
  logger.warn("⚠️  [LOG:WARNING]", {
    service: log.service,
    context: log.context,
    message: log.message,
  });
});

// Test: Get notifications
setTimeout(() => {
  logger.info("📬 Requesting notifications...");
  socket.emit("notifications:get", (response: any) => {
    if (response.success) {
      logger.info(`✅ Got ${response.notifications.length} notifications`);
    } else {
      logger.error("❌ Error", undefined, { error: response.error });
    }
  });
}, 2000);

// Test: Mark notification as read
setTimeout(() => {
  logger.info("✔️  Marking first notification as read...");
  socket.emit(
    "notifications:read",
    { notificationId: "test-notif-123" },
    (response: any) => {
      if (response.success) {
        logger.info("✅ Notification marked as read");
      } else {
        logger.error("❌ Error", undefined, { error: response.error });
      }
    }
  );
}, 3000);

// Keep alive
logger.info("⏳ Listening for events... (Press Ctrl+C to exit)");

// Graceful shutdown
process.on("SIGINT", () => {
  logger.info("👋 Disconnecting...");
  socket.close();
  process.exit(0);
});
