# RULE-BASE — Arquitectura General Bookly

> **Rule file:** `.windsurf/rules/bookly-base.md`
> **Domain:** global · **Trigger:** always_on
> **Score: 3 / 5** · **Gate:** ⚠️ No tests (capped at 3)

## Evidence

### Architecture Patterns

| Pattern                      | Required | Found | Location                                                             |
| ---------------------------- | -------- | ----- | -------------------------------------------------------------------- |
| Hexagonal (Ports & Adapters) | ✅       | ✅    | `src/domain/`, `src/application/`, `src/infrastructure/` per service |
| Clean Code                   | ✅       | ✅    | Consistent separation across all 6 services                          |
| CQRS                         | ✅       | ✅    | `commands/`, `queries/`, `handlers/` per service                     |
| EDA                          | ✅       | ✅    | `libs/event-bus/` (RabbitMQ + Kafka + DLQ + event-store)             |
| BDD with Jasmine             | ✅       | 🔴    | Only 1 spec file exists                                              |
| IaC with Pulumi              | ✅       | ⚠️    | Not in SCOPE_ROOT (infra is separate)                                |
| Nx Monorepo                  | ✅       | ✅    | `nest-cli.json`, multi-app workspace                                 |

### Monorepo Structure

| Expected                     | Found |
| ---------------------------- | ----- |
| `apps/auth-service/`         | ✅    |
| `apps/resources-service/`    | ✅    |
| `apps/availability-service/` | ✅    |
| `apps/stockpile-service/`    | ✅    |
| `apps/reports-service/`      | ✅    |
| `apps/api-gateway/`          | ✅    |
| `libs/common/`               | ✅    |
| `libs/event-bus/`            | ✅    |
| `libs/database/`             | ✅    |

### Coding Guidelines

| Guideline                                         | Status                                             |
| ------------------------------------------------- | -------------------------------------------------- |
| Imports with aliases                              | ⚠️ Needs codebase-wide verification                |
| Handlers only use services                        | ⚠️ Needs verification                              |
| Services execute business logic                   | ⚠️ Needs verification                              |
| Avoid controller→handler→service→controller cycle | ⚠️ Needs verification                              |
| Use standard Response/Events/Requests             | ⚠️ `libs/common/src/utils/response.util.ts` exists |
| Typed contracts with DTOs                         | ✅ DTOs per service                                |
| DTO function signatures                           | ⚠️ Needs verification                              |

## Gaps

1. **BDD testing is near-zero** — critical violation of the BDD with Jasmine principle
2. **Alias import convention** needs codebase-wide audit
3. **Handler→Service boundary** needs code review to verify no leaky abstractions

## Improvement Tasks

| Priority | Task                                           | Skill                             |
| -------- | ---------------------------------------------- | --------------------------------- |
| P0       | Establish BDD test infrastructure with Jasmine | `qa-calidad`                      |
| P1       | Audit import alias usage across all services   | `gobierno-de-arquitectura-diseno` |
| P1       | Verify handler↔service boundary compliance    | `gobierno-de-arquitectura-diseno` |
