/**
 * Centralized test user credentials for E2E tests
 * Source of truth: src/infrastructure/mock/data/auth-service.mock.ts
 */

export const TEST_USERS = {
  admin: {
    email: "admin@ufps.edu.co",
    password: "admin123",
    id: "user_1",
    role: "admin",
  },
  coordinador: {
    email: "coordinador@ufps.edu.co",
    password: "coord123",
    id: "user_2",
    role: "coordinador",
  },
  profesor: {
    email: "profesor@ufps.edu.co",
    password: "prof123",
    id: "user_3",
    role: "profesor",
  },
  estudiante: {
    email: "estudiante@ufps.edu.co",
    password: "est123",
    id: "user_4",
    role: "estudiante",
  },
  vigilancia: {
    email: "vigilante@ufps.edu.co",
    password: "vig123",
    id: "user_5",
    role: "vigilancia",
  },
} as const;

export type TestRole = keyof typeof TEST_USERS;

export const AUTH_STATE_DIR = "e2e/.auth";

export function authStatePath(role: TestRole): string {
  return `${AUTH_STATE_DIR}/${role}.json`;
}
