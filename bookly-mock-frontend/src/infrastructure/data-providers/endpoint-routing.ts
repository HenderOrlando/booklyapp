import { config } from "@/lib/config";

export type ServiceKey = keyof typeof config.serviceUrls;

const authPrefixes = ["auth", "users", "roles", "permissions", "audit"];
const resourcesPrefixes = [
  "resources",
  "categories",
  "maintenances",
  "departments",
  "faculties",
  "programs",
  "imports",
];
const availabilityPrefixes = [
  "reservations",
  "availabilities",
  "waiting-lists",
  "reassignments",
  "calendar",
  "schedules",
  "history",
  "maintenance-blocks",
];
const stockpilePrefixes = [
  "approval-requests",
  "approval-flows",
  "check-in-out",
  "documents",
  "document-templates",
  "monitoring",
  "notifications",
  "notification-templates",
];
const reportsPrefixes = [
  "usage-reports",
  "demand-reports",
  "user-reports",
  "reports",
  "feedback",
  "evaluations",
  "dashboard",
  "audit-dashboard",
];

export function normalizeApiEndpoint(endpoint: string): string {
  const trimmed = endpoint.trim();
  const withoutLeadingSlash = trimmed.startsWith("/")
    ? trimmed.slice(1)
    : trimmed;

  if (withoutLeadingSlash.startsWith("api/v1/")) {
    return `/${withoutLeadingSlash}`;
  }

  return `/api/v1/${withoutLeadingSlash}`;
}

export function extractControllerPrefix(endpoint: string): string {
  const normalized = normalizeApiEndpoint(endpoint);
  const withoutVersion = normalized
    .replace(/^\/api\/v1\//, "")
    .split(/[?#]/)[0];
  const [first, second] = withoutVersion.split("/");

  if (first === "reports" && second === "export") {
    return "reports/export";
  }

  return first;
}

export function resolveDirectServiceKey(endpoint: string): ServiceKey | null {
  const prefix = extractControllerPrefix(endpoint);

  if (authPrefixes.includes(prefix)) {
    return "auth";
  }

  if (resourcesPrefixes.includes(prefix)) {
    return "resources";
  }

  if (availabilityPrefixes.includes(prefix)) {
    return "availability";
  }

  if (stockpilePrefixes.includes(prefix)) {
    return "stockpile";
  }

  if (reportsPrefixes.includes(prefix)) {
    return "reports";
  }

  return null;
}
