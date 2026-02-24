# RF-04: Importación de Horarios Institucionales desde CSV

**Fecha de Implementación**: 2026-02-23  
**Estado**: ✅ IMPLEMENTADO

---

## 📋 Resumen

Extensión del sistema de importación masiva (RF-04) que permite importar horarios institucionales completos desde archivos CSV como los generados por el sistema de horarios UFPS. El proceso:

1. **Crea recursos** (salas, laboratorios) a partir del CSV.
2. **Resuelve o crea docentes** como usuarios en auth-service (SSO-ready o con clave).
3. **Genera reservas recurrentes** semanales si el CSV tiene día+hora, o reservas únicas si tiene fecha específica.
4. **Asocia programas académicos** y categorías a los recursos.

---

## 🎯 Endpoint

**`POST /api/v1/import/schedule`**  
**Auth**: Bearer Token (JWT)

### Request Body

```json
{
  "csvContent": "recurso,edificio,capacidad,dia,hora,programa,...",
  "resourceType": "LABORATORY",
  "recurrenceStartDate": "2026-02-23T00:00:00Z",
  "recurrenceEndDate": "2026-06-30T23:59:59Z",
  "mode": "UPSERT",
  "skipErrors": true,
  "defaultCategoryCodes": ["SALA-COMPUTO"],
  "defaultTeacherRole": "TEACHER",
  "institutionalEmailDomain": "ufps.edu.co"
}
```

### Parámetros

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `csvContent` | string | Sí | Contenido CSV completo |
| `resourceType` | enum | Sí | Tipo de recurso: CLASSROOM, LABORATORY, etc. |
| `recurrenceStartDate` | ISO 8601 | Sí | Fecha inicio del rango de recurrencia |
| `recurrenceEndDate` | ISO 8601 | Sí | Fecha fin del rango de recurrencia |
| `mode` | enum | No | CREATE, UPDATE, UPSERT (default: UPSERT) |
| `skipErrors` | boolean | No | Continuar si hay errores (default: true) |
| `defaultCategoryCodes` | string[] | No | Códigos de categoría por defecto |
| `defaultTeacherRole` | string | No | Rol para docentes creados (default: TEACHER) |
| `institutionalEmailDomain` | string | No | Dominio para emails (default: ufps.edu.co) |

---

## 📝 Formato del CSV

### Headers Esperados

```csv
recurso,edificio,capacidad,dia,hora,programa,materia,docente,estudiantes,title_original
```

### Campos

| Campo | Descripción | Ejemplo |
|---|---|---|
| `recurso` | Código del recurso (= code y name) | SA401 |
| `edificio` | Código del edificio (= building) | SA |
| `capacidad` | Capacidad del recurso | 25 |
| `dia` | Día de la semana o fecha específica | Martes, 2026-03-15 |
| `hora` | Rango horario (HH:MM-HH:MM) | 06:00-07:00 |
| `programa` | Código del programa académico | 1155504-C(35) |
| `materia` | Nombre de la materia (puede ser "No especificado") | - |
| `docente` | Nombre del docente (puede ser "No especificado") | - |
| `estudiantes` | Número de estudiantes | 35 |
| `title_original` | Campo multiline con Carrera, Materia, Docente, No.Alumnos | Ver abajo |

### Campo `title_original` (multiline)

El campo puede contener texto multiline entre comillas con la estructura:

```
"Carrera   : Ingenieria De Sistemas
Materia   : ARQUITECTURA DE COMPUTADORES
Docente : REY CASTILLO JONATHAN ROLANDO
No.Alumnos: 35"
```

El parser extrae automáticamente Carrera, Materia, Docente y No.Alumnos de este campo.

---

## 🔄 Flujo de Procesamiento

### 1. Parse CSV
- Parsea el CSV respetando campos multiline entre comillas.
- Extrae datos estructurados del `title_original`.

### 2. Agrupar por Recurso
- Agrupa todas las filas por código de recurso.
- Acumula programas y horarios únicos por recurso.

### 3. Crear/Actualizar Recursos
- Modo UPSERT: crea si no existe, actualiza si ya existe.
- Asigna tipo, categoría, edificio, piso, capacidad y programas.
- El piso se extrae del código (ej: SA**4**01 → piso 4).

### 4. Resolver Docentes
- Si el campo docente ≠ "No especificado":
  - Busca en auth-service por email generado.
  - Si no existe, lo crea sin password (SSO-ready).
  - Formato email: `nombre1.apellido1@dominio` (ej: `jonathan.rey@ufps.edu.co`).
- Si el docente no está especificado, la reserva se crea con el usuario importador.

### 5. Crear Reservas
- **Si tiene día + hora** → reserva recurrente semanal desde `recurrenceStartDate` hasta `recurrenceEndDate`.
- **Si tiene fecha específica** → reserva única en esa fecha.
- Purpose = "MATERIA - CARRERA/PROGRAMA".

---

## 📊 Response

```json
{
  "success": true,
  "data": {
    "totalRows": 649,
    "resourcesCreated": 8,
    "resourcesUpdated": 0,
    "reservationsCreated": 160,
    "teachersCreated": 20,
    "teachersFound": 5,
    "programsResolved": 45,
    "errorCount": 0,
    "errors": [],
    "warnings": [],
    "resources": [...],
    "reservations": [...],
    "teachers": [...],
    "processingTime": 5432
  }
}
```

---

## 📂 Archivos Implementados

```
apps/resources-service/src/
├── application/
│   ├── commands/
│   │   └── import-schedule.command.ts
│   ├── handlers/
│   │   └── import-schedule.handler.ts
│   └── services/
│       └── schedule-import.service.ts
├── domain/
│   └── repositories/
│       └── program.repository.interface.ts
├── infrastructure/
│   ├── clients/
│   │   ├── auth-service.client.ts
│   │   └── availability-service.client.ts
│   ├── controllers/
│   │   └── import.controller.ts (endpoint schedule agregado)
│   ├── dto/
│   │   └── import-schedule.dto.ts
│   └── repositories/
│       └── program.repository.ts
└── resources.module.ts (providers registrados)
```

---

## 🛡️ Resiliencia

- Si auth-service no responde, el docente se registra como `pending-*` y la importación continúa.
- Si availability-service no responde, la reserva se registra como `pending-*` y la importación continúa.
- Con `skipErrors: true`, errores individuales no detienen la importación completa.
- Cada error y advertencia se reporta en el resumen final.

---

## 🔗 Rules Aplicadas

- `bookly-resource-rf04-importar-recursos-csv.md` → Validación CSV, resumen, auditoría.
- `should-resource-hu-07-rf04.md` → HU-07: Parser, validaciones, resumen.
- `bookly-resource-rf01-crear-editar-eliminar-recursos.md` → Creación de recursos.
- `bookly-availability-rf12-permite-reserva-periodica.md` → Reservas recurrentes semanales.
- `should-availability-hu-13-rf12.md` → Configuración de recurrencia con rango de fechas.
- `bookly-auth-rf43-autenticacion-y-sso.md` → Creación de docentes SSO-ready.

---

## 🧠 Skills Aplicados

- **backend** (SK-BE-API-001): CQRS, endpoint, validaciones, idempotencia.
- **gestion-datos-calidad** (SK-DATA-OPS-001): Lineage (source_batch), DQ rules, auditoría.
- **web-app** (SK-WEB-001): Referencia para futura UI de importación.
