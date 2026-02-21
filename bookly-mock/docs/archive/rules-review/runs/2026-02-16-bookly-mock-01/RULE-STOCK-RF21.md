# RULE-STOCK-RF21 — Generación automática de documentos de aprobación o rechazo

> **Rule file:** `bookly-stockpile-rf21-generacion-automatica-documento-accept-reject-reserva.md`
> **Domain:** stockpile-service
> **Score:** 3 / 5

---

## Evidence

| Artifact             | Path                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| Command              | `apps/stockpile-service/src/application/commands/generate-document.command.ts`   |
| Handler              | `apps/stockpile-service/src/application/handlers/generate-document.handler.ts`   |
| Service — generation | `apps/stockpile-service/src/application/services/document-generation.service.ts` |
| Service — storage    | `apps/stockpile-service/src/application/services/document-storage.service.ts`    |

### Key implementation details

- `GenerateDocumentHandler` supports 3 document types: `APPROVAL_LETTER`, `REJECTION_LETTER`, `CONFIRMATION`.
- `DocumentGenerationService` with typed data interfaces: `ApprovalDocumentData`, `RejectionDocumentData`, `ConfirmationDocumentData`.
- `DocumentStorageService` handles file storage.
- Returns `DocumentGenerationResult` with URL and metadata.

---

## AC Coverage

| #   | Acceptance Criteria            | Status | Notes                                                 |
| --- | ------------------------------ | ------ | ----------------------------------------------------- |
| 1   | Generate approval letter       | ✅     | `DocumentType.APPROVAL_LETTER`                        |
| 2   | Generate rejection letter      | ✅     | `DocumentType.REJECTION_LETTER`                       |
| 3   | Generate confirmation document | ✅     | `DocumentType.CONFIRMATION`                           |
| 4   | Document storage and retrieval | ✅     | `DocumentStorageService`                              |
| 5   | PDF format                     | ⚠️     | Service exists but PDF rendering engine not confirmed |

---

## Gaps

1. **PDF rendering engine** — Cannot confirm actual PDF generation (may be stub/mock).
2. **No BDD tests** — 0 spec files.

---

## Improvement Tasks

| #   | Task                                                       | Priority |
| --- | ---------------------------------------------------------- | -------- |
| 1   | Verify PDF rendering integration (e.g., puppeteer, pdfkit) | P2       |
| 2   | Write BDD spec: `generate-document.spec.ts`                | P0       |
