---
description: Reglas y estándares para la creación, actualización y mantenimiento de la documentación en Bookly (Frontend, Backend y Global)
  - "docs/**/*.md"
  - "bookly-mock/docs/**/*.md"
  - "bookly-mock-frontend/docs/**/*.md"
trigger: always_on
---

# Estándares de Documentación Bookly

Esta regla establece los lineamientos obligatorios para crear, modificar y organizar cualquier archivo de documentación dentro del proyecto Bookly. Aplica para la documentación global, del backend y del frontend.

## 1. Estructura de Directorios (Single Source of Truth)

La documentación debe crearse o modificarse **únicamente** en los siguientes directorios, respetando su alcance:

- **`docs/` (Global):**
  - `business-requirements/`: Requerimientos, historias de usuario, diagramas de flujo.
  - `api-alignment/`: Políticas de integración frontend-backend, inventarios de endpoints.
  - `project-management/`: Progreso, seguridad, auditorías generales.
  - `workflows-guide/`: Guías de windsurf y automatizaciones.

- **`bookly-mock/docs/` (Backend):**
  - `api/`: Swagger, Postman, contratos.
  - `architecture/`: C4 model, ADRs, diseño de base de datos.
  - `implementation/`: Detalles por microservicio.
  - `deployment/` / `operations/`: DevOps, CI/CD, Kubernetes.

- **`bookly-mock-frontend/docs/` (Frontend):**
  - `architecture-and-standards/`: `ARCHITECTURE.md`, `BEST_PRACTICES.md`, `PERFORMANCE.md`, `TESTING.md`.
  - `api-integration/`: Guías de cómo el frontend consume cada servicio (01 a 06).
  - `project-management/`: `PENDIENTES.md` (Deuda técnica y TODOs).

**Regla de Oro:** NO crear documentación técnica del backend en la carpeta global ni en el frontend. NO mezclar reportes de progreso con requerimientos de negocio.

## 2. Formato y Estilo (Markdown)

Todos los archivos `.md` deben cumplir con las siguientes reglas de formato (Markdown Linting):

1. **Título Principal (H1):** Todo archivo debe comenzar con un único `# Título Descriptivo`.
2. **Jerarquía de Encabezados:** Usar secuencialmente `##`, `###`, `####`. No saltar niveles (ej. de `##` a `####`).
3. **Listas y Espaciado:**
   - Dejar una línea en blanco antes y después de cada encabezado (`##`, `###`).
   - Dejar una línea en blanco antes y después de cada lista o bloque de código.
   - Usar sangría de 2 o 4 espacios para listas anidadas de forma consistente.
4. **Enlaces Relativos:** Siempre usar enlaces relativos explícitos (ej. `./ruta/archivo.md` o `../ruta/archivo.md`). NUNCA usar rutas absolutas de la máquina local.

## 3. Actualización de Índices

Cualquier adición, movimiento o eliminación de un archivo de documentación obliga a actualizar los índices correspondientes:

- Si modificas `docs/` -> Actualiza `docs/DIRECTORIO_DOCUMENTACION.md`.
- Si modificas `bookly-mock/docs/` -> Actualiza `bookly-mock/docs/INDEX.md`.
- Si modificas `bookly-mock-frontend/docs/` -> Actualiza `bookly-mock-frontend/docs/INDEX.md`.

## 4. Archivo de Documentación Obsoleta (Archive)

**NUNCA ELIMINAR** documentación histórica (planes completados, soluciones a errores pasados, refactorizaciones terminadas).

- Los documentos obsoletos deben moverse a la carpeta `archive/` correspondiente:
  - `docs/archive/`
  - `bookly-mock/docs/archive/`
  - `bookly-mock-frontend/docs/archive/`
- Si el documento era un plan, mover a `archive/plans/`.
- Si era un fix, mover a `archive/fixes/`.

## 5. Plantillas Estándar

Al crear nuevos documentos, utilizar las plantillas existentes cuando aplique:
- Para features nuevas frontend: Seguir estructura de `Feature: [Nombre]`, `Requerimientos`, `Implementación`, `Tests`.
- Para fixes frontend: Usar `Fix: [Nombre]`, `Problema`, `Causa Raíz`, `Solución`, `Prevención`.
- Para backend: Usar `REQUIREMENT_TEMPLATE.md` o `ENDPOINTS_TEMPLATE.md` si están disponibles.

## 6. Lenguaje y Tono

- **Idioma:** Español neutro.
- **Tono:** Técnico, directo y conciso.
- **Evitar:** Textos extremadamente largos sin estructura. Preferir bullet points, tablas y diagramas (Mermaid.js si es posible) para explicar conceptos complejos.
