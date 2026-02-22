/**
 * Introspect Token Response from auth-service.
 * Authoritative user identity resolved from DB.
 */
export interface IntrospectResult {
  active: boolean;
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  is2FAEnabled: boolean;
  lastLogin?: Date;
}

/**
 * Evaluate Permissions Response from auth-service.
 */
export interface EvaluatePermissionsResult {
  allowed: boolean;
  userId: string;
  resource: string;
  action: string;
  matchedRoles: string[];
  matchedPermissions: string[];
  policyVersion: string;
}

/**
 * Auth Client configuration options.
 */
export interface AuthClientOptions {
  /** Base URL of auth-service (e.g., http://localhost:3001) */
  authServiceUrl: string;
  /** API prefix (default: /api/v1) */
  apiPrefix?: string;
  /** HTTP timeout in ms (default: 5000) */
  timeout?: number;
  /** Max retries on failure (default: 2) */
  maxRetries?: number;
  /** Redis cache TTL for introspect results in seconds (default: 60) */
  introspectCacheTtl?: number;
  /** Redis cache TTL for permission results in seconds (default: 30) */
  permissionCacheTtl?: number;
}
