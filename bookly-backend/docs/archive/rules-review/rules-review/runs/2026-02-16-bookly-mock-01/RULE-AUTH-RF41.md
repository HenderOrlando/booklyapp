# RULE-AUTH-RF41 — Gestión de Roles y Permisos

> **Rule file:** `.windsurf/rules/bookly-auth-rf41-gestion-de-roles.md`
> **Domain:** auth · **Service:** `apps/auth-service/`
> **Score: 3 / 5** · **Gate:** ⚠️ No tests (capped at 3)

---

## Evidence (within SCOPE_ROOT)

### Commands

- `src/application/commands/roles/create-role.command.ts`
- `src/application/commands/roles/update-role.command.ts`
- `src/application/commands/roles/delete-role.command.ts`
- `src/application/commands/roles/assign-permissions.command.ts`
- `src/application/commands/roles/remove-permissions.command.ts`
- `src/application/commands/permissions/create-permission.command.ts`
- `src/application/commands/permissions/update-permission.command.ts`
- `src/application/commands/permissions/delete-permission.command.ts`
- `src/application/commands/permissions/bulk-create-permissions.command.ts`

### DTOs

- `src/application/dtos/role/assign-permissions.dto.ts`
- `src/application/dtos/role/create-role.dto.ts` (inferred)
- `src/application/dtos/permission/create-permission.dto.ts`
- `src/application/dtos/permission/update-permission.dto.ts`
- `src/application/dtos/permission/permission-response.dto.ts`
- `src/application/dtos/permission/bulk-create-permissions.dto.ts`

### Shared Libs

- `libs/decorators/src/roles.decorator.ts`
- `libs/decorators/src/permissions.decorator.ts`
- `libs/common/src/decorators/require-permissions.decorator.ts`
- `libs/common/src/guards/permissions.guard.ts`

### Documentation

- `docs/fase1-sprint1-rf41-roles-permisos/RF41_RESUMEN_FINAL.md`
- `docs/fase1-sprint1-rf41-roles-permisos/VERIFICACION_FINAL_RF41.md`
- `docs/requirements/RF-41_GESTION_ROLES_PERMISOS.md`

### Tests

- **None specific to RF-41** (1 generic spec: `test/unit/services/auth.service.spec.ts`)

---

## ACs Coverage

| # | Acceptance Criteria | Status |
| --- | --- | --- |
| 1 | Assign roles/permissions per user profile | ✅ Commands exist |
| 2 | Role-specific access (Student, Teacher, Admin, etc.) | ✅ Decorator/guard pattern |
| 3 | Admin interface for role management | ✅ CRUD commands |
| 4 | Audit history for permission changes | ✅ Audit DTOs exist |
| 5 | Auto-update permissions on role change | ⚠️ Needs verification |
| 6 | Only admins can modify roles | ✅ Guard-based restriction |

---

## Gaps

1. **No BDD tests** — Blocks score ≥ 4
2. **Real-time permission propagation** to active sessions needs verification
3. **Predefined vs custom roles** logic (predefined non-editable) needs code verification

## Improvement Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P0 | Write BDD specs for CRUD roles + permissions | `qa-calidad` |
| P1 | Verify session-aware permission propagation | `backend` |
| P1 | Verify predefined roles are non-editable | `backend` |
