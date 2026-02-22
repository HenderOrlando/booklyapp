/**
 * Contract Tests: FE Endpoint Paths ↔ BE Controller Prefixes
 *
 * Validates that the FE endpoint constants match the BE controller routing.
 * These tests catch drift between frontend and backend path definitions.
 *
 * Finding: F-11 (WF-38 Alignment Report)
 */

import {
  AUTH_ENDPOINTS,
  AVAILABILITY_ENDPOINTS,
  REPORTS_ENDPOINTS,
  RESOURCES_ENDPOINTS,
  STOCKPILE_ENDPOINTS,
  SYSTEM_ENDPOINTS,
} from "@/infrastructure/api/endpoints";

const API_V1 = "/api/v1";

/**
 * BE controller prefixes extracted from @Controller() decorators
 * Source: bookly-mock/apps/{service}/src/infrastructure/controllers/{name}.ts
 */
const BE_CONTROLLERS = {
  auth: ["auth", "users", "roles", "permissions", "audit"],
  resources: ["resources", "categories", "programs", "maintenances", "import"],
  availability: [
    "reservations",
    "availabilities",
    "calendar",
    "waiting-lists",
    "reassignments",
    "schedules",
    "history",
    "reference-data",
  ],
  stockpile: [
    "approval-flows",
    "approval-requests",
    "check-in-out",
    "documents",
    "document-templates",
    "notifications",
    "notification-templates",
  ],
  reports: [
    "reports",
    "usage-reports",
    "demand-reports",
    "user-reports",
    "reports/export",
    "feedback",
    "evaluations",
    "dashboard",
    "audit-dashboard",
  ],
  system: ["health"],
} as const;

function extractPrefix(endpoint: string): string {
  // Remove /api/v1/ and get the first path segment(s)
  const withoutVersion = endpoint.replace(`${API_V1}/`, "");
  // Handle paths like "reports/export" (two segments)
  const parts = withoutVersion.split("/");
  if (parts[0] === "reports" && parts[1] === "export") return "reports/export";
  return parts[0];
}

function isValidBEPrefix(
  prefix: string,
  service: keyof typeof BE_CONTROLLERS,
): boolean {
  return (BE_CONTROLLERS[service] as readonly string[]).includes(prefix);
}

describe("Contract: AUTH_ENDPOINTS → auth-service controllers", () => {
  const endpoints = [
    { name: "LOGIN", path: AUTH_ENDPOINTS.LOGIN },
    { name: "REGISTER", path: AUTH_ENDPOINTS.REGISTER },
    { name: "PROFILE", path: AUTH_ENDPOINTS.PROFILE },
    { name: "PROFILE_DETAILS", path: AUTH_ENDPOINTS.PROFILE_DETAILS },
    { name: "PROFILE_UPDATE", path: AUTH_ENDPOINTS.PROFILE_UPDATE },
    { name: "PROFILE_PHOTO", path: AUTH_ENDPOINTS.PROFILE_PHOTO },
    { name: "PROFILE_PREFERENCES", path: AUTH_ENDPOINTS.PROFILE_PREFERENCES },
    { name: "REFRESH_TOKEN", path: AUTH_ENDPOINTS.REFRESH_TOKEN },
    { name: "CHANGE_PASSWORD", path: AUTH_ENDPOINTS.CHANGE_PASSWORD },
    { name: "USERS", path: AUTH_ENDPOINTS.USERS },
    { name: "ROLES", path: AUTH_ENDPOINTS.ROLES },
    { name: "PERMISSIONS", path: AUTH_ENDPOINTS.PERMISSIONS },
  ];

  it.each(endpoints)(
    "$name → $path has valid BE controller prefix",
    ({ path }) => {
      expect(path).toMatch(new RegExp(`^${API_V1}/`));
      const prefix = extractPrefix(path);
      expect(isValidBEPrefix(prefix, "auth")).toBe(true);
    },
  );
});

describe("Contract: RESOURCES_ENDPOINTS → resources-service controllers", () => {
  const endpoints = [
    { name: "BASE", path: RESOURCES_ENDPOINTS.BASE },
    { name: "CATEGORIES", path: RESOURCES_ENDPOINTS.CATEGORIES },
    { name: "PROGRAMS", path: RESOURCES_ENDPOINTS.PROGRAMS },
    { name: "MAINTENANCE", path: RESOURCES_ENDPOINTS.MAINTENANCE },
    { name: "IMPORT_CSV", path: RESOURCES_ENDPOINTS.IMPORT_CSV },
  ];

  it.each(endpoints)(
    "$name → $path has valid BE controller prefix",
    ({ path }) => {
      expect(path).toMatch(new RegExp(`^${API_V1}/`));
      const prefix = extractPrefix(path);
      expect(isValidBEPrefix(prefix, "resources")).toBe(true);
    },
  );
});

describe("Contract: AVAILABILITY_ENDPOINTS → availability-service controllers", () => {
  const endpoints = [
    { name: "RESERVATIONS", path: AVAILABILITY_ENDPOINTS.RESERVATIONS },
    { name: "AVAILABILITIES", path: AVAILABILITY_ENDPOINTS.AVAILABILITIES },
    { name: "CALENDAR", path: AVAILABILITY_ENDPOINTS.CALENDAR },
    { name: "WAITLIST", path: AVAILABILITY_ENDPOINTS.WAITLIST },
    { name: "REASSIGNMENT", path: AVAILABILITY_ENDPOINTS.REASSIGNMENT },
    { name: "SCHEDULES", path: AVAILABILITY_ENDPOINTS.SCHEDULES },
  ];

  it.each(endpoints)(
    "$name → $path has valid BE controller prefix",
    ({ path }) => {
      expect(path).toMatch(new RegExp(`^${API_V1}/`));
      const prefix = extractPrefix(path);
      expect(isValidBEPrefix(prefix, "availability")).toBe(true);
    },
  );
});

describe("Contract: STOCKPILE_ENDPOINTS → stockpile-service controllers", () => {
  const endpoints = [
    { name: "APPROVAL_FLOWS", path: STOCKPILE_ENDPOINTS.APPROVAL_FLOWS },
    { name: "APPROVAL_REQUESTS", path: STOCKPILE_ENDPOINTS.APPROVAL_REQUESTS },
    { name: "CHECKIN", path: STOCKPILE_ENDPOINTS.CHECKIN },
    { name: "CHECKOUT", path: STOCKPILE_ENDPOINTS.CHECKOUT },
    { name: "DOCUMENTS", path: STOCKPILE_ENDPOINTS.DOCUMENTS },
    {
      name: "DOCUMENT_TEMPLATES",
      path: STOCKPILE_ENDPOINTS.DOCUMENT_TEMPLATES,
    },
    { name: "NOTIFICATIONS", path: STOCKPILE_ENDPOINTS.NOTIFICATIONS },
    {
      name: "NOTIFICATION_TEMPLATES",
      path: STOCKPILE_ENDPOINTS.NOTIFICATION_TEMPLATES,
    },
  ];

  it.each(endpoints)(
    "$name → $path has valid BE controller prefix",
    ({ path }) => {
      expect(path).toMatch(new RegExp(`^${API_V1}/`));
      const prefix = extractPrefix(path);
      expect(isValidBEPrefix(prefix, "stockpile")).toBe(true);
    },
  );
});

describe("Contract: REPORTS_ENDPOINTS → reports-service controllers", () => {
  const endpoints = [
    { name: "USAGE", path: REPORTS_ENDPOINTS.USAGE },
    { name: "UNSATISFIED_DEMAND", path: REPORTS_ENDPOINTS.UNSATISFIED_DEMAND },
    { name: "EXPORT", path: REPORTS_ENDPOINTS.EXPORT },
    { name: "FEEDBACK", path: REPORTS_ENDPOINTS.FEEDBACK },
    { name: "EVALUATIONS", path: REPORTS_ENDPOINTS.EVALUATIONS },
    { name: "DASHBOARD_OVERVIEW", path: REPORTS_ENDPOINTS.DASHBOARD_OVERVIEW },
  ];

  it.each(endpoints)(
    "$name → $path has valid BE controller prefix",
    ({ path }) => {
      expect(path).toMatch(new RegExp(`^${API_V1}/`));
      const prefix = extractPrefix(path);
      expect(isValidBEPrefix(prefix, "reports")).toBe(true);
    },
  );
});

describe("Contract: SYSTEM_ENDPOINTS → gateway health controller", () => {
  it("HEALTH endpoint uses /api/v1/health prefix", () => {
    expect(SYSTEM_ENDPOINTS.HEALTH).toBe(`${API_V1}/health`);
    const prefix = extractPrefix(SYSTEM_ENDPOINTS.HEALTH);
    expect(isValidBEPrefix(prefix, "system")).toBe(true);
  });
});

describe("Contract: API version consistency", () => {
  const allEndpoints = {
    ...AUTH_ENDPOINTS,
    ...RESOURCES_ENDPOINTS,
    ...AVAILABILITY_ENDPOINTS,
    ...STOCKPILE_ENDPOINTS,
    ...REPORTS_ENDPOINTS,
    ...SYSTEM_ENDPOINTS,
  };

  it("all static endpoints use /api/v1 prefix", () => {
    const staticEndpoints = Object.entries(allEndpoints).filter(
      ([, value]) => typeof value === "string",
    );

    for (const [, path] of staticEndpoints) {
      expect(path).toMatch(new RegExp(`^${API_V1}/`));
    }
  });

  it("all dynamic endpoint factories produce /api/v1 paths", () => {
    const dynamicEndpoints = Object.entries(allEndpoints).filter(
      ([, value]) => typeof value === "function",
    ) as [string, (id: string) => string][];

    for (const [, factory] of dynamicEndpoints) {
      const result = factory("test-id");
      expect(result).toMatch(new RegExp(`^${API_V1}/`));
    }
  });
});
