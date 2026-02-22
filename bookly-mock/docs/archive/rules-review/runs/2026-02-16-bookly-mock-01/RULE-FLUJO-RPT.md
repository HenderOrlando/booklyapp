# RULE-FLUJO-RPT — Flujos de Reportes y Análisis

> **Rule file:** `.windsurf/rules/bookly-flujos-reports.md`
> **Domain:** reports · **Trigger:** manual
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

### Process Coverage

| Process            | Handlers/Services Found                           |
| ------------------ | ------------------------------------------------- |
| Usage reports      | generate-usage-report, get-usage-reports          |
| User reports       | get-user-reports                                  |
| Demand reports     | get-demand-reports, demand-report.service         |
| Export (CSV/Excel) | export handlers + csv-generator + excel-generator |
| Feedback           | feedback commands/handlers/queries/service        |
| Evaluation         | evaluation commands/handlers/queries              |
| Dashboard          | dashboard handlers/queries/service                |
| Audit analytics    | audit-alert.service, audit-analytics.service      |
| Report scheduling  | report-scheduler.service (inferred)               |

## Gaps & Tasks

| Priority | Task                                                    | Skill            |
| -------- | ------------------------------------------------------- | ---------------- |
| P0       | BDD specs for report generation and export              | `qa-calidad`     |
| P1       | Implement missing conflict + compliance report handlers | `data-reporting` |
