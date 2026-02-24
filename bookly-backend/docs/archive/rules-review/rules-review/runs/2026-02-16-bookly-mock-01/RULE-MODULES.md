# RULE-MODULES — Resumen por Módulo

> **Rule file:** `.windsurf/rules/bookly-modules.md`
> **Domain:** global · **Trigger:** always_on
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

### Module Coverage

| Module               | HUs      | CUs        | RFs      | Service Exists | RF Rule Files |
| -------------------- | -------- | ---------- | -------- | -------------- | ------------- |
| resources-service    | HU-01→08 | CU-008→010 | RF-01→06 | ✅             | 🔴 Missing    |
| availability-service | HU-09→16 | CU-011→015 | RF-07→19 | ✅             | ✅ 13 files   |
| stockpile-service    | HU-17→25 | CU-016→020 | RF-20→28 | ✅             | 🔴 Missing    |
| reports-service      | HU-26→32 | CU-021→025 | RF-31→37 | ✅             | ✅ 9 files    |
| auth-service         | HU-33→37 | CU-001→007 | RF-41→45 | ✅             | ✅ 5 files    |

### Missing Rule Files (15 total)

- **resources-service:** RF-01, RF-02, RF-03, RF-04, RF-05, RF-06
- **stockpile-service:** RF-20, RF-21, RF-22, RF-23, RF-24, RF-25, RF-26, RF-27, RF-28

> Note: These RFs have requirement docs inside each service's `docs/requirements/` folder but lack `.windsurf/rules/` counterparts for formal audit.

## Gaps

1. **15 RFs lack dedicated rule files** preventing formal audit coverage
2. **No BDD tests** across any module

## Improvement Tasks

| Priority | Task                                                                | Skill                   |
| -------- | ------------------------------------------------------------------- | ----------------------- |
| P2       | Create `.windsurf/rules/bookly-resources-rf01.md` through `rf06.md` | `gestion-datos-calidad` |
| P2       | Create `.windsurf/rules/bookly-stockpile-rf20.md` through `rf28.md` | `gestion-datos-calidad` |
| P0       | Establish test infrastructure per module                            | `qa-calidad`            |
