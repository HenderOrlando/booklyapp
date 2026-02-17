/**
 * OpenTelemetry SDK Setup
 * Configurable traces + metrics for all Bookly services.
 * Must be called BEFORE NestJS bootstrap (top of main.ts).
 *
 * Environment variables:
 *   OTEL_ENABLED        - "true" to enable (default: false)
 *   OTEL_SERVICE_NAME   - Override service name
 *   OTEL_EXPORTER_OTLP_ENDPOINT - OTLP collector URL (default: http://localhost:4318)
 */

import { NodeSDK } from "@opentelemetry/sdk-node";
import { Resource } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
} from "@opentelemetry/semantic-conventions";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { MongooseInstrumentation } from "@opentelemetry/instrumentation-mongoose";

export interface OtelSetupOptions {
  serviceName: string;
  serviceVersion?: string;
  environment?: string;
  otlpEndpoint?: string;
  metricsIntervalMs?: number;
}

let sdkInstance: NodeSDK | null = null;

/**
 * Initialize OTel SDK. Call once at the top of main.ts, before NestFactory.create().
 * No-ops if OTEL_ENABLED !== "true".
 */
export function initOtel(options: OtelSetupOptions): NodeSDK | null {
  const enabled = process.env.OTEL_ENABLED === "true";
  if (!enabled) {
    return null;
  }

  const serviceName =
    process.env.OTEL_SERVICE_NAME || options.serviceName;
  const endpoint =
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    options.otlpEndpoint ||
    "http://localhost:4318";
  const environment =
    process.env.NODE_ENV || options.environment || "development";

  const resource = new Resource({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: options.serviceVersion || "1.0.0",
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: environment,
  });

  const traceExporter = new OTLPTraceExporter({
    url: `${endpoint}/v1/traces`,
  });

  const metricExporter = new OTLPMetricExporter({
    url: `${endpoint}/v1/metrics`,
  });

  const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: options.metricsIntervalMs || 30000,
  });

  const sdk = new NodeSDK({
    resource,
    traceExporter,
    metricReader,
    instrumentations: [
      new HttpInstrumentation({
        ignoreIncomingRequestHook: (req) => {
          // Skip health checks and metrics endpoints
          const url = req.url || "";
          return url === "/health" || url === "/metrics";
        },
      }),
      new ExpressInstrumentation(),
      new MongooseInstrumentation(),
    ],
  });

  sdk.start();
  sdkInstance = sdk;

  // Graceful shutdown
  const shutdown = async () => {
    try {
      await sdk.shutdown();
    } catch {
      // ignore shutdown errors
    }
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  console.log(
    `[OTel] Initialized for ${serviceName} → ${endpoint} (env: ${environment})`,
  );

  return sdk;
}

/**
 * Get the active SDK instance (null if not enabled).
 */
export function getOtelSdk(): NodeSDK | null {
  return sdkInstance;
}
