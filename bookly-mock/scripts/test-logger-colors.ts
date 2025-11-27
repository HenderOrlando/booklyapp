#!/usr/bin/env ts-node

/**
 * Script de prueba para Logger con Colores
 * Demuestra todas las características del logger mejorado
 */

import { createLogger } from "../libs/common/src/utils/logger.util";

const logger = createLogger("ColorLoggerDemo");

console.log("\n🎨 ===== BOOKLY LOGGER WITH COLORS DEMO =====\n");

// 1. Niveles básicos de log
console.log("📋 1. Niveles Básicos de Log:\n");

logger.info("✅ Información general del sistema");
logger.warn("⚠️  Advertencia: Límite de conexiones cercano", {
  current: 95,
  max: 100,
});
logger.error(
  "❌ Error crítico del sistema",
  new Error("Database connection timeout")
);
logger.debug("🔍 Información de debugging detallada", {
  memoryUsage: "256MB",
  cpuUsage: "45%",
});

setTimeout(() => {
  console.log("\n📡 2. HTTP Request/Response Logging:\n");

  // 2. HTTP Methods con colores
  logger.logRequest("GET", "/api/v1/users", "user-123");
  logger.logRequest("POST", "/api/v1/auth/login");
  logger.logRequest("PUT", "/api/v1/users/456");
  logger.logRequest("PATCH", "/api/v1/users/456/profile");
  logger.logRequest("DELETE", "/api/v1/users/789");

  setTimeout(() => {
    console.log("\n📊 3. HTTP Status Codes con colores:\n");

    // 3. Status codes con colores
    logger.logResponse("GET", "/api/v1/users", 200, 150); // Verde (2xx, rápido)
    logger.logResponse("POST", "/api/v1/auth/login", 201, 890); // Verde (2xx, rápido)
    logger.logResponse("GET", "/api/v1/redirect", 302, 50); // Cyan (3xx, muy rápido)
    logger.logResponse("GET", "/api/v1/users/999", 404, 120); // Amarillo (4xx, rápido)
    logger.logResponse("POST", "/api/v1/auth/login", 401, 95); // Amarillo (4xx, rápido)
    logger.logResponse("GET", "/api/v1/data", 500, 2500); // Rojo (5xx, lento)
    logger.logResponse("POST", "/api/v1/process", 503, 3000); // Rojo (5xx, muy lento)

    setTimeout(() => {
      console.log("\n🎯 4. Event Logging:\n");

      // 4. Events con colores
      logger.logEvent("USER_REGISTERED", {
        userId: "user-123",
        email: "user@example.com",
        role: "STUDENT",
      });

      logger.logEvent("RESOURCE_CREATED", {
        resourceId: "lab-101",
        type: "LABORATORY",
        capacity: 30,
      });

      logger.logEvent("RESERVATION_APPROVED", {
        reservationId: "res-456",
        resourceId: "lab-101",
        userId: "user-123",
      });

      setTimeout(() => {
        console.log("\n🔎 5. Database Query Logging (Debug):\n");

        // 5. Query logging
        logger.logQuery("SELECT * FROM users WHERE email = $1", {
          email: "user@example.com",
        });

        logger.logQuery(
          "INSERT INTO reservations (user_id, resource_id, start_time) VALUES ($1, $2, $3)",
          {
            userId: "123",
            resourceId: "lab-101",
            startTime: new Date(),
          }
        );

        setTimeout(() => {
          console.log("\n💾 6. Datos Estructurados:\n");

          // 6. Logs con datos estructurados
          logger.info("Usuario autenticado correctamente", {
            userId: "user-123",
            email: "user@bookly.com",
            roles: ["STUDENT", "MONITOR"],
            timestamp: new Date().toISOString(),
          });

          logger.warn("Cache miss detectado", {
            key: "user:profile:123",
            ttl: 3600,
            strategy: "fallback-to-db",
          });

          setTimeout(() => {
            console.log("\n🚀 7. Escenario Completo - Flujo de Reserva:\n");

            // 7. Flujo completo de reserva
            logger.info("📥 Iniciando flujo de reserva");

            logger.logRequest("POST", "/api/v1/reservations", "user-123");

            logger.debug("Validando disponibilidad del recurso", {
              resourceId: "lab-101",
              date: "2024-01-20",
              time: "10:00-12:00",
            });

            logger.info("✅ Recurso disponible", { resourceId: "lab-101" });

            logger.logEvent("RESERVATION_CREATED", {
              reservationId: "res-789",
              resourceId: "lab-101",
              userId: "user-123",
            });

            logger.logQuery(
              "INSERT INTO reservations (id, user_id, resource_id) VALUES ($1, $2, $3)",
              {
                id: "res-789",
                userId: "user-123",
                resourceId: "lab-101",
              }
            );

            logger.info("📧 Enviando notificación al usuario");

            logger.logEvent("NOTIFICATION_SENT", {
              type: "EMAIL",
              userId: "user-123",
              template: "reservation_confirmed",
            });

            logger.logResponse("POST", "/api/v1/reservations", 201, 450);

            logger.info("✨ Flujo de reserva completado exitosamente");

            setTimeout(() => {
              console.log("\n❌ 8. Manejo de Errores:\n");

              // 8. Errores con stack trace
              try {
                throw new Error("Failed to connect to MongoDB");
              } catch (error) {
                logger.error("Error crítico en base de datos", error as Error, {
                  service: "availability-service",
                  operation: "findAvailableSlots",
                  timestamp: new Date().toISOString(),
                });
              }

              logger.warn("Reintentando conexión", {
                attempt: 3,
                maxAttempts: 5,
                delay: "5000ms",
              });

              setTimeout(() => {
                console.log("\n🎉 9. Métricas de Rendimiento:\n");

                // 9. Logs de rendimiento
                logger.info("📊 Métricas del sistema", {
                  uptime: "24h 15m",
                  activeUsers: 156,
                  totalRequests: 45678,
                  avgResponseTime: "145ms",
                  errorRate: "0.02%",
                });

                logger.debug("🔍 Cache statistics", {
                  hits: 8934,
                  misses: 234,
                  hitRate: "97.4%",
                  size: "128MB",
                });

                setTimeout(() => {
                  console.log("\n✅ 10. Logger Verbose (NestJS Style):\n");

                  // 10. Verbose logging
                  logger.verbose("Procesando lote de notificaciones", {
                    batchSize: 50,
                    channel: "EMAIL",
                    priority: "NORMAL",
                  });

                  logger.verbose("Ejecutando tarea programada", {
                    taskName: "cleanup-expired-reservations",
                    schedule: "0 0 * * *",
                    lastRun: new Date().toISOString(),
                  });

                  setTimeout(() => {
                    console.log(
                      "\n🎨 ===== FIN DEL DEMO - LOGGER WITH COLORS =====\n"
                    );
                    console.log(
                      "✨ Todos los logs se mostraron con colores e iconos"
                    );
                    console.log(
                      "📝 Revisa el código fuente para ver los ejemplos"
                    );
                    console.log(
                      "📚 Documentación completa en: docs/LOGGER_ENHANCEMENTS.md\n"
                    );

                    process.exit(0);
                  }, 1000);
                }, 1500);
              }, 1500);
            }, 1500);
          }, 1500);
        }, 1500);
      }, 1500);
    }, 1500);
  }, 1500);
}, 1500);
