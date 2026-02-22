---
description: Rule for managing resource characteristics in Bookly. Aligns frontend CRUD with backend reference-data contracts.
---

# Resource Characteristics Management

Resource characteristics are dynamic attributes that can be assigned to resources. They are managed through the `reference-data` controller in the `resources-service`.

## Backend Contract (reference-data)

- **Base Path**: `/api/v1/reference-data`
- **Group**: `resource_characteristic`
- **Entity Structure**:
  - `id`: Unique identifier (string).
  - `group`: Always `resource_characteristic`.
  - `code`: Unique uppercase code (string).
  - `name`: Human-readable name.
  - `description`: Optional description.
  - `icon`: Optional Lucide icon name.
  - `color`: Optional hex color code.
  - `isActive`: Boolean flag for logical deletion.
  - `order`: Numeric order for display.

## Frontend Implementation

### API Client (`CharacteristicsClient`)
Located at `src/infrastructure/api/characteristics-client.ts`. 
- Always filters by `group=resource_characteristic`.
- `getCharacteristics(onlyActive)`: Fetches the catalog.
- `create(data)`: POST to `/reference-data`.
- `update(id, data)`: PATCH to `/reference-data/:id`.
- `delete(id)`: DELETE to `/reference-data/:id` (Logical deletion in backend).

### UI Components
- **Modal**: `CharacteristicModal.tsx` handles validation and form layout.
- **Validations**:
  - `name`: Required, min 2 chars.
  - `code`: Required, uppercase, alphanumeric and underscores only.
  - `description`: Max 200 chars.
- **i18n**: Translations located in `src/i18n/translations/{locale}/characteristics.json`.

## Integration with Resources
When creating/updating a resource:
- Existing characteristics are sent as their `id` string.
- New characteristics (created on-the-fly) are sent as objects: `{ name: "New Char Name" }`.
- The backend `ResourceService` handles the resolution and creation of missing `reference-data` entries.
