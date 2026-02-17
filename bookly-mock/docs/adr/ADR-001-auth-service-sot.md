# ADR-001: auth-service as Single Source of Truth for Identity & Permissions

## Status
**Accepted** — February 17, 2026

## Context
Bookly is a microservices monorepo (6 services). Previously, each service validated JWT tokens locally using a shared secret and trusted the embedded claims (roles, permissions) without consulting auth-service. This created several problems:

1. **Stale permissions**: If a role/permission was revoked, existing JWTs remained valid until expiration.
2. **Inconsistent JWT secrets**: Services used different fallback values, causing token validation failures.
3. **No revocation mechanism**: Once a token was issued, it could not be invalidated (no blacklist).
4. **Duplicated RBAC logic**: Each service implemented its own role/permission checking without a single authoritative source.

## Decision
**auth-service is the ONLY source of truth for users, roles, and permissions.** Other services MUST resolve identity and evaluate permissions by consulting auth-service (with controlled caching).

### Implementation
1. **Internal Contract Endpoints** (auth-service):
   - `POST /api/v1/auth/introspect` — Validates JWT and returns full user identity from DB (not just JWT claims).
   - `POST /api/v1/auth/evaluate-permissions` — Evaluates if a user has a specific `resource:action` permission, resolved from DB.

2. **Shared Auth Client SDK** (`libs/security/`):
   - `AuthClientModule` — Dynamic NestJS module imported by all services.
   - `AuthClientService` — HTTP client calling auth-service with Redis caching (60s introspect, 30s permissions), retry with exponential backoff (max 2 retries), and graceful degradation.

3. **JWT Secret Standardization**:
   - All services use `JWT_SECRET` from `@libs/common/constants` (resolves `process.env.JWT_SECRET`).
   - No more inconsistent fallback values.

4. **Token Revocation**:
   - auth-service `JwtStrategy` checks Redis blacklist before validating user.
   - `AuthCacheService.blacklistToken()` / `isTokenBlacklisted()` provide the revocation API.
   - Logout endpoint adds token to blacklist (TTL: 24h).

### Caching Strategy
- **Introspect results**: Cached 60s in Redis (`auth:introspect:{userId}`).
- **Permission evaluations**: Cached 30s in Redis (`auth:authz:{userId}:{resource}:{action}`).
- **Cache invalidation**: On role/permission changes, `AuthClientService.invalidateUserCache(userId)` clears all cached authz data.

## Consequences

### Positive
- Single authoritative source for all identity and permission data.
- Revoked permissions take effect within cache TTL (max 60s).
- Token revocation via blacklist provides immediate invalidation.
- Consistent JWT handling across all services.

### Negative
- Added latency for uncached auth checks (HTTP call to auth-service).
- auth-service becomes a critical dependency (mitigated by caching + circuit breaker).
- Redis dependency for caching (already required by other features).

### Risks
- **auth-service downtime**: Services fall back to local JWT validation (JWT claims still valid) if auth-service is unreachable and cache is empty. This is a deliberate graceful degradation — deny-by-default only applies to permission evaluation, not token validation.

## Files Changed
- `libs/security/src/` — New auth-client SDK (AuthClientModule, AuthClientService)
- `libs/common/src/constants/index.ts` — JWT_SECRET constant (already existed)
- `apps/auth-service/src/application/handlers/introspect-token.handler.ts` — New
- `apps/auth-service/src/application/handlers/evaluate-permissions.handler.ts` — New
- `apps/auth-service/src/application/queries/introspect-token.query.ts` — New
- `apps/auth-service/src/application/queries/evaluate-permissions.query.ts` — New
- `apps/auth-service/src/infrastructure/dto/introspect-token.dto.ts` — New
- `apps/auth-service/src/infrastructure/dto/evaluate-permissions.dto.ts` — New
- `apps/auth-service/src/infrastructure/strategies/jwt.strategy.ts` — Enhanced with blacklist check
- `apps/*/src/*.module.ts` — All 6 services updated with JWT_SECRET + AuthClientModule
- `tsconfig.json` — Added `@libs/security` path alias
