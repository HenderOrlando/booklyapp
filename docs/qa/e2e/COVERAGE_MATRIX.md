# Matriz de Cobertura E2E — Bookly Mock Frontend

> Tabla completa de casos E2E derivados de HU/RF, con precondiciones, pasos, aserciones, datos, rol, prioridad y tipo.

**Última actualización:** 2026-02-17
**Total de casos:** 120
**Distribución:** P0 (25) · P1 (55) · P2 (40)

---

## Leyenda

- **Tipo**: `happy` = camino feliz, `negative` = validación/error, `permission` = acceso denegado
- **Suite**: `smoke` = P0 (<10 min, gate PR), `regression` = P1 (nightly), `extended` = P2 (semanal)
- **Rol**: admin (A), coordinador (C), profesor (P), estudiante (E), vigilancia (V)
- **Estado**: ✅ definido, ⚠️ bloqueado por MISSING_DEFINITIONS

---

## 1. Auth (RF-41..RF-45)

### 1.1 Login y sesión (RF-43 — HU-35)

| ID           | Tipo       | Rol | Ruta            | Precondiciones      | Pasos                                                              | Aserciones                                        | Datos                              | Suite      | Estado |
| ------------ | ---------- | --- | --------------- | ------------------- | ------------------------------------------------------------------ | ------------------------------------------------- | ---------------------------------- | ---------- | ------ |
| E2E-AUTH-001 | happy      | A   | `/es/login`     | —                   | 1. Ir a /es/login 2. Llenar email+password 3. Click submit         | URL contiene `/dashboard`, menú usuario visible   | admin@ufps.edu.co / admin123       | smoke      | ✅     |
| E2E-AUTH-002 | negative   | —   | `/es/login`     | —                   | 1. Ir a /es/login 2. Llenar credenciales inválidas 3. Click submit | Mensaje de error visible, permanece en /login     | bad@test.com / wrong               | smoke      | ✅     |
| E2E-AUTH-003 | negative   | —   | `/es/login`     | —                   | 1. Ir a /es/login 2. Click submit sin llenar campos                | Mensajes de validación requerido visibles         | —                                  | smoke      | ✅     |
| E2E-AUTH-004 | happy      | A   | `/es/dashboard` | Logueado como admin | 1. Click botón logout en menú                                      | Redirige a /login, sesión eliminada               | —                                  | smoke      | ✅     |
| E2E-AUTH-005 | permission | —   | `/es/dashboard` | No autenticado      | 1. Navegar directo a /es/dashboard                                 | Redirige a /login                                 | —                                  | smoke      | ✅     |
| E2E-AUTH-006 | happy      | C   | `/es/login`     | —                   | 1. Login como coordinador                                          | URL=/dashboard, sidebar muestra items coordinador | coordinador@ufps.edu.co / coord123 | regression | ✅     |
| E2E-AUTH-007 | happy      | P   | `/es/login`     | —                   | 1. Login como profesor                                             | URL=/dashboard, sidebar restringido               | profesor@ufps.edu.co / prof123     | regression | ✅     |
| E2E-AUTH-008 | happy      | E   | `/es/login`     | —                   | 1. Login como estudiante                                           | URL=/dashboard, sidebar mínimo                    | estudiante@ufps.edu.co / est123    | regression | ✅     |

### 1.2 Registro (RF-43 — HU-35)

| ID           | Tipo     | Rol | Ruta           | Precondiciones | Pasos                                                        | Aserciones                                 | Datos          | Suite      | Estado    |
| ------------ | -------- | --- | -------------- | -------------- | ------------------------------------------------------------ | ------------------------------------------ | -------------- | ---------- | --------- |
| E2E-AUTH-009 | happy    | —   | `/es/register` | —              | 1. Ir a /es/register 2. Llenar formulario completo 3. Submit | Mensaje de éxito o redirect a login        | Datos de test  | regression | ⚠️ MD-009 |
| E2E-AUTH-010 | negative | —   | `/es/register` | —              | 1. Ir a /es/register 2. Submit vacío                         | Errores de validación en campos requeridos | —              | regression | ✅        |
| E2E-AUTH-011 | negative | —   | `/es/register` | —              | 1. Ir a /es/register 2. Email no institucional 3. Submit     | Error de email no válido                   | test@gmail.com | regression | ✅        |

### 1.3 Recuperación de contraseña (RF-43 — HU-35)

| ID           | Tipo     | Rol | Ruta                  | Precondiciones | Pasos                                                   | Aserciones                       | Datos             | Suite      | Estado |
| ------------ | -------- | --- | --------------------- | -------------- | ------------------------------------------------------- | -------------------------------- | ----------------- | ---------- | ------ |
| E2E-AUTH-012 | happy    | —   | `/es/forgot-password` | —              | 1. Ir a /es/forgot-password 2. Ingresar email 3. Submit | Mensaje de confirmación de envío | admin@ufps.edu.co | regression | ✅     |
| E2E-AUTH-013 | negative | —   | `/es/forgot-password` | —              | 1. Submit con email vacío                               | Error de validación              | —                 | regression | ✅     |

### 1.4 Gestión de roles (RF-41 — HU-33)

| ID           | Tipo  | Rol | Ruta              | Precondiciones                | Pasos                                                   | Aserciones                                                          | Datos                | Suite      | Estado |
| ------------ | ----- | --- | ----------------- | ----------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------- | -------------------- | ---------- | ------ |
| E2E-AUTH-014 | happy | A   | `/es/admin/roles` | Logueado admin                | 1. Ir a /es/admin/roles 2. Ver lista de roles           | Tabla de roles visible con admin, coordinador, profesor, estudiante | —                    | smoke      | ✅     |
| E2E-AUTH-015 | happy | A   | `/es/admin/roles` | Logueado admin                | 1. Click crear rol 2. Llenar nombre+permisos 3. Guardar | Rol aparece en la lista, toast éxito                                | Nombre: E2E-TestRole | regression | ✅     |
| E2E-AUTH-016 | happy | A   | `/es/admin/roles` | Logueado admin, rol existente | 1. Click editar rol 2. Modificar permisos 3. Guardar    | Cambios reflejados, toast éxito                                     | —                    | regression | ✅     |
| E2E-AUTH-017 | happy | A   | `/es/admin/roles` | Logueado admin, rol existente | 1. Click eliminar rol 2. Confirmar                      | Rol desaparece de la lista                                          | —                    | regression | ✅     |

### 1.5 Restricción de modificación (RF-42 — HU-34)

| ID           | Tipo       | Rol | Ruta                       | Precondiciones       | Pasos                           | Aserciones                         | Datos | Suite      | Estado    |
| ------------ | ---------- | --- | -------------------------- | -------------------- | ------------------------------- | ---------------------------------- | ----- | ---------- | --------- |
| E2E-AUTH-018 | permission | E   | `/es/recursos/nuevo`       | Logueado estudiante  | 1. Navegar a /es/recursos/nuevo | Redirige o muestra acceso denegado | —     | regression | ⚠️ MD-015 |
| E2E-AUTH-019 | permission | P   | `/es/recursos/[id]/editar` | Logueado profesor    | 1. Navegar a editar recurso     | Redirige o muestra acceso denegado | —     | regression | ⚠️ MD-015 |
| E2E-AUTH-020 | permission | E   | `/es/admin/roles`          | Logueado estudiante  | 1. Navegar a /es/admin/roles    | Redirige o acceso denegado         | —     | regression | ⚠️ MD-015 |
| E2E-AUTH-021 | permission | P   | `/es/admin/usuarios`       | Logueado profesor    | 1. Navegar a /es/admin/usuarios | Redirige o acceso denegado         | —     | regression | ⚠️ MD-015 |
| E2E-AUTH-022 | permission | C   | `/es/admin/roles`          | Logueado coordinador | 1. Navegar a /es/admin/roles    | Redirige o acceso denegado         | —     | regression | ⚠️ MD-015 |

### 1.6 Auditoría (RF-44 — HU-36)

| ID           | Tipo  | Rol | Ruta                  | Precondiciones | Pasos                                                         | Aserciones                                                         | Datos | Suite      | Estado |
| ------------ | ----- | --- | --------------------- | -------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ | ----- | ---------- | ------ |
| E2E-AUTH-023 | happy | A   | `/es/admin/auditoria` | Logueado admin | 1. Ir a /es/admin/auditoria                                   | Tabla de logs visible con columnas timestamp, user, action, entity | —     | regression | ✅     |
| E2E-AUTH-024 | happy | A   | `/es/admin/auditoria` | Logueado admin | 1. Aplicar filtros por acción/usuario 2. Verificar resultados | Tabla filtrada correctamente                                       | —     | regression | ✅     |
| E2E-AUTH-025 | happy | A   | `/es/admin/auditoria` | Logueado admin | 1. Click exportar CSV                                         | Descarga archivo CSV                                               | —     | regression | ✅     |

### 1.7 Verificación 2FA (RF-45 — HU-37)

| ID           | Tipo  | Rol | Ruta                    | Precondiciones | Pasos                                            | Aserciones                                            | Datos | Suite    | Estado |
| ------------ | ----- | --- | ----------------------- | -------------- | ------------------------------------------------ | ----------------------------------------------------- | ----- | -------- | ------ |
| E2E-AUTH-026 | happy | A   | `/es/profile/seguridad` | Logueado admin | 1. Ir a /es/profile/seguridad 2. Ver sección 2FA | Sección de configuración 2FA visible, QR code o setup | —     | extended | ✅     |

### 1.8 Administración de usuarios (RF-41)

| ID           | Tipo  | Rol | Ruta                 | Precondiciones | Pasos                       | Aserciones                       | Datos             | Suite      | Estado |
| ------------ | ----- | --- | -------------------- | -------------- | --------------------------- | -------------------------------- | ----------------- | ---------- | ------ |
| E2E-AUTH-027 | happy | A   | `/es/admin/usuarios` | Logueado admin | 1. Ir a /es/admin/usuarios  | Lista de usuarios visible        | —                 | regression | ✅     |
| E2E-AUTH-028 | happy | A   | `/es/admin/usuarios` | Logueado admin | 1. Buscar usuario por email | Resultado filtrado correctamente | admin@ufps.edu.co | regression | ✅     |

### 1.9 Perfil de usuario

| ID           | Tipo  | Rol | Ruta          | Precondiciones | Pasos               | Aserciones                                 | Datos | Suite      | Estado |
| ------------ | ----- | --- | ------------- | -------------- | ------------------- | ------------------------------------------ | ----- | ---------- | ------ |
| E2E-AUTH-029 | happy | A   | `/es/profile` | Logueado admin | 1. Ir a /es/profile | Info personal visible (nombre, email, rol) | —     | regression | ✅     |

---

## 2. Resources (RF-01..RF-06)

### 2.1 CRUD Recursos (RF-01 — HU-01/02/03)

| ID          | Tipo     | Rol | Ruta                       | Precondiciones                    | Pasos                                                                                          | Aserciones                                               | Datos         | Suite      | Estado |
| ----------- | -------- | --- | -------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------- | ---------- | ------ |
| E2E-RES-001 | happy    | A   | `/es/recursos`             | Logueado admin                    | 1. Ir a /es/recursos                                                                           | Lista de recursos visible con cards/tabla                | —             | smoke      | ✅     |
| E2E-RES-002 | happy    | A   | `/es/recursos/nuevo`       | Logueado admin                    | 1. Ir a /es/recursos/nuevo 2. Llenar formulario (nombre, tipo, ubicación, capacidad) 3. Submit | Toast éxito, recurso aparece en lista                    | E2E-Sala-Test | smoke      | ✅     |
| E2E-RES-003 | happy    | A   | `/es/recursos/[id]`        | Logueado admin, recurso existente | 1. Click en recurso de la lista                                                                | Detalle visible con nombre, ubicación, capacidad, estado | —             | smoke      | ✅     |
| E2E-RES-004 | happy    | A   | `/es/recursos/[id]/editar` | Logueado admin, recurso existente | 1. Click editar 2. Cambiar nombre 3. Guardar                                                   | Toast éxito, nombre actualizado en detalle               | —             | smoke      | ✅     |
| E2E-RES-005 | happy    | A   | `/es/recursos`             | Logueado admin, recurso existente | 1. Click eliminar/deshabilitar recurso 2. Confirmar                                            | Recurso desaparece o cambia estado, toast éxito          | —             | regression | ✅     |
| E2E-RES-006 | negative | A   | `/es/recursos/nuevo`       | Logueado admin                    | 1. Submit formulario vacío                                                                     | Mensajes de validación en campos requeridos              | —             | regression | ✅     |
| E2E-RES-007 | negative | A   | `/es/recursos/nuevo`       | Logueado admin                    | 1. Llenar con capacidad negativa 2. Submit                                                     | Error de validación capacidad                            | capacidad: -5 | regression | ✅     |

### 2.2 Atributos de recurso (RF-03 — HU-04)

| ID          | Tipo  | Rol | Ruta                 | Precondiciones | Pasos                                                                                           | Aserciones                                       | Datos           | Suite      | Estado |
| ----------- | ----- | --- | -------------------- | -------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------- | ---------- | ------ |
| E2E-RES-008 | happy | A   | `/es/recursos/nuevo` | Logueado admin | 1. Crear recurso con todos los atributos (nombre, desc, ubicación, capacidad, horarios, reglas) | Todos los campos guardados y visibles en detalle | Datos completos | regression | ✅     |

### 2.3 Reglas de disponibilidad (RF-05 — HU-05)

| ID          | Tipo  | Rol | Ruta                 | Precondiciones | Pasos                                                     | Aserciones                             | Datos | Suite      | Estado |
| ----------- | ----- | --- | -------------------- | -------------- | --------------------------------------------------------- | -------------------------------------- | ----- | ---------- | ------ |
| E2E-RES-009 | happy | A   | `/es/admin/horarios` | Logueado admin | 1. Ir a /es/admin/horarios 2. Configurar franjas horarias | Configuración guardada, toast éxito    | —     | regression | ✅     |
| E2E-RES-010 | happy | A   | `/es/admin/horarios` | Logueado admin | 1. Crear período bloqueado                                | Período aparece en lista de bloqueados | —     | regression | ✅     |

### 2.4 Categorías y programas (RF-02 — HU-06)

| ID          | Tipo       | Rol | Ruta             | Precondiciones                   | Pasos                                          | Aserciones                               | Datos        | Suite      | Estado    |
| ----------- | ---------- | --- | ---------------- | -------------------------------- | ---------------------------------------------- | ---------------------------------------- | ------------ | ---------- | --------- |
| E2E-RES-011 | happy      | A   | `/es/categorias` | Logueado admin                   | 1. Ir a /es/categorias                         | Lista de categorías visible              | —            | regression | ✅        |
| E2E-RES-012 | happy      | A   | `/es/categorias` | Logueado admin                   | 1. Crear categoría 2. Llenar nombre 3. Guardar | Categoría en lista, toast éxito          | E2E-Cat-Test | regression | ✅        |
| E2E-RES-013 | happy      | A   | `/es/categorias` | Logueado admin, categoría existe | 1. Editar categoría 2. Guardar                 | Cambios reflejados                       | —            | regression | ✅        |
| E2E-RES-014 | happy      | A   | `/es/programas`  | Logueado admin                   | 1. Ir a /es/programas                          | Lista de programas visible               | —            | regression | ✅        |
| E2E-RES-015 | happy      | C   | `/es/categorias` | Logueado coordinador             | 1. Ir a /es/categorias                         | Lista visible (coordinador tiene acceso) | —            | regression | ✅        |
| E2E-RES-016 | permission | E   | `/es/categorias` | Logueado estudiante              | 1. Navegar a /es/categorias                    | Redirige o acceso denegado               | —            | regression | ⚠️ MD-015 |

### 2.5 Importación CSV (RF-04 — HU-07)

| ID          | Tipo  | Rol | Ruta           | Precondiciones | Pasos                                             | Aserciones                                       | Datos       | Suite    | Estado    |
| ----------- | ----- | --- | -------------- | -------------- | ------------------------------------------------- | ------------------------------------------------ | ----------- | -------- | --------- |
| E2E-RES-017 | happy | A   | `/es/recursos` | Logueado admin | 1. Click botón importar 2. Subir CSV 3. Confirmar | Reporte de importación visible, recursos creados | CSV de test | extended | ⚠️ MD-006 |

### 2.6 Mantenimiento (RF-06 — HU-08)

| ID          | Tipo  | Rol | Ruta                 | Precondiciones       | Pasos                                             | Aserciones                               | Datos | Suite      | Estado |
| ----------- | ----- | --- | -------------------- | -------------------- | ------------------------------------------------- | ---------------------------------------- | ----- | ---------- | ------ |
| E2E-RES-018 | happy | A   | `/es/mantenimientos` | Logueado admin       | 1. Ir a /es/mantenimientos                        | Lista de mantenimientos visible          | —     | regression | ✅     |
| E2E-RES-019 | happy | A   | `/es/mantenimientos` | Logueado admin       | 1. Crear mantenimiento para un recurso 2. Guardar | Mantenimiento en lista, recurso marcado  | —     | extended   | ✅     |
| E2E-RES-020 | happy | C   | `/es/mantenimientos` | Logueado coordinador | 1. Ir a /es/mantenimientos                        | Lista visible (coordinador tiene acceso) | —     | extended   | ✅     |

### 2.7 Historial de recurso (RF-11 — HU-12)

| ID          | Tipo  | Rol | Ruta                          | Precondiciones                 | Pasos                        | Aserciones                           | Datos | Suite      | Estado |
| ----------- | ----- | --- | ----------------------------- | ------------------------------ | ---------------------------- | ------------------------------------ | ----- | ---------- | ------ |
| E2E-RES-021 | happy | A   | `/es/recursos/[id]/historial` | Logueado admin, recurso existe | 1. Ir a historial de recurso | Timeline/tabla de uso pasado visible | —     | regression | ✅     |

---

## 3. Availability (RF-07..RF-19)

### 3.1 Reservas CRUD

| ID          | Tipo     | Rol | Ruta                 | Precondiciones                 | Pasos                                                                    | Aserciones                                                  | Datos                          | Suite      | Estado |
| ----------- | -------- | --- | -------------------- | ------------------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------ | ---------- | ------ |
| E2E-AVL-001 | happy    | A   | `/es/reservas`       | Logueado admin                 | 1. Ir a /es/reservas                                                     | Lista de reservas visible con filtros                       | —                              | smoke      | ✅     |
| E2E-AVL-002 | happy    | A   | `/es/reservas/nueva` | Logueado admin                 | 1. Ir a /es/reservas/nueva 2. Seleccionar recurso, fecha, hora 3. Submit | Toast éxito, reserva aparece en lista                       | Recurso: Sala A, fecha: mañana | smoke      | ✅     |
| E2E-AVL-003 | happy    | A   | `/es/reservas/[id]`  | Logueado admin, reserva existe | 1. Click en reserva de lista                                             | Detalle completo: recurso, fecha, hora, estado, solicitante | —                              | smoke      | ✅     |
| E2E-AVL-004 | happy    | A   | `/es/reservas/[id]`  | Logueado admin, reserva existe | 1. Click editar 2. Cambiar hora 3. Guardar                               | Toast éxito, hora actualizada                               | —                              | regression | ✅     |
| E2E-AVL-005 | happy    | A   | `/es/reservas/[id]`  | Logueado admin, reserva existe | 1. Click cancelar reserva 2. Confirmar                                   | Estado cambia a cancelada, toast éxito                      | —                              | regression | ✅     |
| E2E-AVL-006 | negative | A   | `/es/reservas/nueva` | Logueado admin                 | 1. Submit sin seleccionar recurso ni fecha                               | Errores de validación en campos requeridos                  | —                              | regression | ✅     |

### 3.2 Visualización calendario (RF-10 — HU-11)

| ID          | Tipo  | Rol | Ruta             | Precondiciones | Pasos                                                     | Aserciones                                        | Datos | Suite      | Estado |
| ----------- | ----- | --- | ---------------- | -------------- | --------------------------------------------------------- | ------------------------------------------------- | ----- | ---------- | ------ |
| E2E-AVL-007 | happy | A   | `/es/calendario` | Logueado admin | 1. Ir a /es/calendario                                    | Vista de calendario visible con eventos/reservas  | —     | smoke      | ✅     |
| E2E-AVL-008 | happy | A   | `/es/calendario` | Logueado admin | 1. Cambiar vista (mes/semana/día) 2. Navegar entre fechas | Vista cambia correctamente, eventos se actualizan | —     | regression | ✅     |
| E2E-AVL-009 | happy | A   | `/es/calendario` | Logueado admin | 1. Aplicar filtro por recurso                             | Solo eventos del recurso seleccionado             | —     | regression | ✅     |

### 3.3 Configuración de horarios (RF-07 — HU-09)

| ID          | Tipo  | Rol | Ruta                 | Precondiciones | Pasos                                                           | Aserciones             | Datos              | Suite      | Estado |
| ----------- | ----- | --- | -------------------- | -------------- | --------------------------------------------------------------- | ---------------------- | ------------------ | ---------- | ------ |
| E2E-AVL-010 | happy | A   | `/es/admin/horarios` | Logueado admin | 1. Ir a /es/admin/horarios 2. Configurar disponibilidad por día | Configuración guardada | Lun-Vie 7:00-21:00 | regression | ✅     |

### 3.4 Integración calendarios (RF-08 — HU-10)

| ID          | Tipo  | Rol | Ruta                      | Precondiciones | Pasos                           | Aserciones                                               | Datos | Suite      | Estado |
| ----------- | ----- | --- | ------------------------- | -------------- | ------------------------------- | -------------------------------------------------------- | ----- | ---------- | ------ |
| E2E-AVL-011 | happy | A   | `/es/admin/integraciones` | Logueado admin | 1. Ir a /es/admin/integraciones | Lista de integraciones con estado conectado/desconectado | —     | regression | ✅     |

### 3.5 Búsqueda avanzada (RF-09 — HU-16)

| ID          | Tipo  | Rol | Ruta           | Precondiciones | Pasos                                                                      | Aserciones                                | Datos   | Suite      | Estado |
| ----------- | ----- | --- | -------------- | -------------- | -------------------------------------------------------------------------- | ----------------------------------------- | ------- | ---------- | ------ |
| E2E-AVL-012 | happy | A   | `/es/recursos` | Logueado admin | 1. Usar barra de búsqueda con término 2. Aplicar filtros (tipo, ubicación) | Resultados filtrados correctamente        | "Sala"  | regression | ✅     |
| E2E-AVL-013 | happy | A   | `/es/recursos` | Logueado admin | 1. Buscar recurso inexistente                                              | Estado vacío con mensaje "sin resultados" | "ZZZZZ" | regression | ✅     |

### 3.6 Reservas periódicas (RF-12 — HU-13)

| ID          | Tipo  | Rol | Ruta                 | Precondiciones | Pasos                                                                   | Aserciones                                  | Datos              | Suite    | Estado |
| ----------- | ----- | --- | -------------------- | -------------- | ----------------------------------------------------------------------- | ------------------------------------------- | ------------------ | -------- | ------ |
| E2E-AVL-014 | happy | A   | `/es/reservas/nueva` | Logueado admin | 1. Activar opción periódica 2. Seleccionar frecuencia y rango 3. Submit | Múltiples reservas creadas según frecuencia | Semanal, 4 semanas | extended | ✅     |

### 3.7 Lista de espera (RF-14 — HU-14)

| ID          | Tipo       | Rol | Ruta               | Precondiciones       | Pasos                         | Aserciones                               | Datos | Suite      | Estado    |
| ----------- | ---------- | --- | ------------------ | -------------------- | ----------------------------- | ---------------------------------------- | ----- | ---------- | --------- |
| E2E-AVL-015 | happy      | A   | `/es/lista-espera` | Logueado admin       | 1. Ir a /es/lista-espera      | Lista de espera visible con posiciones   | —     | regression | ✅        |
| E2E-AVL-016 | happy      | C   | `/es/lista-espera` | Logueado coordinador | 1. Ir a /es/lista-espera      | Lista visible (coordinador tiene acceso) | —     | regression | ✅        |
| E2E-AVL-017 | permission | E   | `/es/lista-espera` | Logueado estudiante  | 1. Navegar a /es/lista-espera | Redirige o acceso denegado               | —     | regression | ⚠️ MD-015 |

### 3.8 Reasignación (RF-15 — HU-15)

| ID          | Tipo  | Rol | Ruta                        | Precondiciones                         | Pasos                                   | Aserciones                                          | Datos | Suite      | Estado |
| ----------- | ----- | --- | --------------------------- | -------------------------------------- | --------------------------------------- | --------------------------------------------------- | ----- | ---------- | ------ |
| E2E-AVL-018 | happy | A   | `/es/reservas/reasignacion` | Logueado admin                         | 1. Ir a /es/reservas/reasignacion       | Interfaz de reasignación con alternativas sugeridas | —     | regression | ✅     |
| E2E-AVL-019 | happy | A   | `/es/reservas/reasignacion` | Logueado admin, reserva para reasignar | 1. Seleccionar alternativa 2. Confirmar | Reserva reasignada, toast éxito                     | —     | extended   | ✅     |

### 3.9 Restricciones por categoría (RF-16)

| ID          | Tipo     | Rol | Ruta                 | Precondiciones                           | Pasos                                                  | Aserciones                                | Datos | Suite    | Estado    |
| ----------- | -------- | --- | -------------------- | ---------------------------------------- | ------------------------------------------------------ | ----------------------------------------- | ----- | -------- | --------- |
| E2E-AVL-020 | negative | E   | `/es/reservas/nueva` | Logueado estudiante, recurso restringido | 1. Intentar reservar recurso restringido por categoría | Error o recurso no disponible para el rol | —     | extended | ⚠️ MD-007 |

### 3.10 Cancelación/modificación con reglas (RF-18 — HU implícita)

| ID          | Tipo     | Rol | Ruta                | Precondiciones                 | Pasos                | Aserciones                           | Datos | Suite    | Estado |
| ----------- | -------- | --- | ------------------- | ------------------------------ | -------------------- | ------------------------------------ | ----- | -------- | ------ |
| E2E-AVL-021 | negative | A   | `/es/reservas/[id]` | Reserva en plazo no cancelable | 1. Intentar cancelar | Error: fuera de plazo de cancelación | —     | extended | ✅     |

### 3.11 Reservas múltiples (RF-19)

| ID          | Tipo  | Rol | Ruta                 | Precondiciones | Pasos                                                | Aserciones                 | Datos | Suite    | Estado    |
| ----------- | ----- | --- | -------------------- | -------------- | ---------------------------------------------------- | -------------------------- | ----- | -------- | --------- |
| E2E-AVL-022 | happy | A   | `/es/reservas/nueva` | Logueado admin | 1. Seleccionar múltiples recursos/horarios 2. Submit | Todas las reservas creadas | —     | extended | ⚠️ MD-008 |

---

## 4. Stockpile (RF-20..RF-30)

### 4.1 Aprobaciones CRUD (RF-20 — HU-17)

| ID          | Tipo       | Rol | Ruta                    | Precondiciones                      | Pasos                                             | Aserciones                                            | Datos                      | Suite      | Estado    |
| ----------- | ---------- | --- | ----------------------- | ----------------------------------- | ------------------------------------------------- | ----------------------------------------------------- | -------------------------- | ---------- | --------- |
| E2E-STK-001 | happy      | A   | `/es/aprobaciones`      | Logueado admin                      | 1. Ir a /es/aprobaciones                          | Lista de solicitudes pendientes visible con stats     | —                          | smoke      | ✅        |
| E2E-STK-002 | happy      | A   | `/es/aprobaciones/[id]` | Logueado admin, solicitud pendiente | 1. Click en solicitud 2. Ver detalle              | Detalle completo: solicitante, recurso, fecha, estado | —                          | smoke      | ✅        |
| E2E-STK-003 | happy      | A   | `/es/aprobaciones/[id]` | Logueado admin, solicitud pendiente | 1. Click aprobar 2. Confirmar                     | Estado cambia a aprobada, toast éxito                 | —                          | smoke      | ✅        |
| E2E-STK-004 | happy      | A   | `/es/aprobaciones/[id]` | Logueado admin, solicitud pendiente | 1. Click rechazar 2. Ingresar motivo 3. Confirmar | Estado cambia a rechazada, motivo guardado            | "Recurso en mantenimiento" | regression | ✅        |
| E2E-STK-005 | happy      | C   | `/es/aprobaciones`      | Logueado coordinador                | 1. Ir a /es/aprobaciones                          | Lista visible (coordinador tiene acceso)              | —                          | regression | ✅        |
| E2E-STK-006 | permission | E   | `/es/aprobaciones`      | Logueado estudiante                 | 1. Navegar a /es/aprobaciones                     | Redirige o acceso denegado                            | —                          | regression | ⚠️ MD-015 |

### 4.2 Generación de documentos (RF-21 — HU-18)

| ID          | Tipo  | Rol | Ruta                    | Precondiciones     | Pasos                                | Aserciones              | Datos | Suite      | Estado |
| ----------- | ----- | --- | ----------------------- | ------------------ | ------------------------------------ | ----------------------- | ----- | ---------- | ------ |
| E2E-STK-007 | happy | A   | `/es/aprobaciones/[id]` | Solicitud aprobada | 1. Click generar/descargar documento | PDF generado/descargado | —     | regression | ✅     |

### 4.3 Notificación automática (RF-22 — HU-19)

| ID          | Tipo  | Rol | Ruta                    | Precondiciones     | Pasos                | Aserciones                                | Datos | Suite      | Estado |
| ----------- | ----- | --- | ----------------------- | ------------------ | -------------------- | ----------------------------------------- | ----- | ---------- | ------ |
| E2E-STK-008 | happy | A   | `/es/aprobaciones/[id]` | Solicitud aprobada | 1. Aprobar solicitud | Toast/notificación de éxito visible en UI | —     | regression | ✅     |

### 4.4 Pantalla vigilancia (RF-23 — HU-20)

| ID          | Tipo       | Rol | Ruta             | Precondiciones       | Pasos                       | Aserciones                                        | Datos | Suite      | Estado    |
| ----------- | ---------- | --- | ---------------- | -------------------- | --------------------------- | ------------------------------------------------- | ----- | ---------- | --------- |
| E2E-STK-009 | happy      | A   | `/es/vigilancia` | Logueado admin       | 1. Ir a /es/vigilancia      | Panel con reservas activas, con retraso y alertas | —     | regression | ✅        |
| E2E-STK-010 | permission | C   | `/es/vigilancia` | Logueado coordinador | 1. Navegar a /es/vigilancia | Redirige o acceso denegado                        | —     | regression | ⚠️ MD-015 |
| E2E-STK-011 | happy      | V   | `/es/vigilancia` | Logueado vigilancia  | 1. Ir a /es/vigilancia      | Panel visible con reservas aprobadas              | —     | regression | ⚠️ MD-001 |

### 4.5 Flujos de aprobación diferenciados (RF-24 — HU-21)

| ID          | Tipo  | Rol | Ruta                          | Precondiciones | Pasos                                                | Aserciones                   | Datos | Suite      | Estado |
| ----------- | ----- | --- | ----------------------------- | -------------- | ---------------------------------------------------- | ---------------------------- | ----- | ---------- | ------ |
| E2E-STK-012 | happy | A   | `/es/admin/flujos-aprobacion` | Logueado admin | 1. Ir a /es/admin/flujos-aprobacion                  | Lista de flujos configurados | —     | regression | ✅     |
| E2E-STK-013 | happy | A   | `/es/admin/flujos-aprobacion` | Logueado admin | 1. Crear nuevo flujo 2. Configurar reglas 3. Guardar | Flujo aparece en lista       | —     | extended   | ✅     |

### 4.6 Historial de aprobaciones (RF-25 — HU-22)

| ID          | Tipo  | Rol | Ruta                         | Precondiciones       | Pasos                              | Aserciones                                  | Datos | Suite      | Estado |
| ----------- | ----- | --- | ---------------------------- | -------------------- | ---------------------------------- | ------------------------------------------- | ----- | ---------- | ------ |
| E2E-STK-014 | happy | A   | `/es/historial-aprobaciones` | Logueado admin       | 1. Ir a /es/historial-aprobaciones | Timeline de aprobaciones visible            | —     | regression | ✅     |
| E2E-STK-015 | happy | C   | `/es/historial-aprobaciones` | Logueado coordinador | 1. Ir a /es/historial-aprobaciones | Timeline visible (coordinador tiene acceso) | —     | regression | ✅     |
| E2E-STK-016 | happy | P   | `/es/historial-aprobaciones` | Logueado profesor    | 1. Ir a /es/historial-aprobaciones | Timeline visible (profesor tiene acceso)    | —     | regression | ✅     |

### 4.7 Check-in/check-out (RF-26 — HU-23)

| ID          | Tipo  | Rol | Ruta           | Precondiciones                     | Pasos                                   | Aserciones                                        | Datos | Suite      | Estado |
| ----------- | ----- | --- | -------------- | ---------------------------------- | --------------------------------------- | ------------------------------------------------- | ----- | ---------- | ------ |
| E2E-STK-017 | happy | A   | `/es/check-in` | Logueado admin                     | 1. Ir a /es/check-in                    | Interfaz de check-in visible con reservas del día | —     | regression | ✅     |
| E2E-STK-018 | happy | A   | `/es/check-in` | Logueado admin, reserva activa hoy | 1. Buscar reserva 2. Confirmar check-in | Estado cambia a checked-in                        | —     | extended   | ✅     |
| E2E-STK-019 | happy | P   | `/es/check-in` | Logueado profesor                  | 1. Ir a /es/check-in                    | Interfaz visible (profesor tiene acceso)          | —     | extended   | ✅     |

### 4.8 Canales de notificación (RF-27 — HU-24)

| ID          | Tipo  | Rol | Ruta                             | Precondiciones | Pasos                                  | Aserciones                                         | Datos | Suite    | Estado |
| ----------- | ----- | --- | -------------------------------- | -------------- | -------------------------------------- | -------------------------------------------------- | ----- | -------- | ------ |
| E2E-STK-020 | happy | A   | `/es/admin/canales-notificacion` | Logueado admin | 1. Ir a /es/admin/canales-notificacion | Configuración de canales (email, WhatsApp) visible | —     | extended | ✅     |

### 4.9 Templates (RF-21 relacionado)

| ID          | Tipo  | Rol | Ruta                  | Precondiciones | Pasos                       | Aserciones                               | Datos | Suite    | Estado |
| ----------- | ----- | --- | --------------------- | -------------- | --------------------------- | ---------------------------------------- | ----- | -------- | ------ |
| E2E-STK-021 | happy | A   | `/es/admin/templates` | Logueado admin | 1. Ir a /es/admin/templates | Lista de plantillas de documento visible | —     | extended | ✅     |

---

## 5. Reports (RF-31..RF-40)

### 5.1 Dashboard reportes (RF-31 — HU-26)

| ID          | Tipo       | Rol | Ruta                    | Precondiciones       | Pasos                         | Aserciones                                      | Datos | Suite      | Estado    |
| ----------- | ---------- | --- | ----------------------- | -------------------- | ----------------------------- | ----------------------------------------------- | ----- | ---------- | --------- |
| E2E-RPT-001 | happy      | A   | `/es/reportes`          | Logueado admin       | 1. Ir a /es/reportes          | Dashboard con KPIs y enlaces a subreportes      | —     | smoke      | ✅        |
| E2E-RPT-002 | happy      | A   | `/es/reportes/recursos` | Logueado admin       | 1. Ir a /es/reportes/recursos | Reporte de uso por recurso con gráficos y tabla | —     | smoke      | ✅        |
| E2E-RPT-003 | happy      | C   | `/es/reportes`          | Logueado coordinador | 1. Ir a /es/reportes          | Dashboard visible (coordinador tiene acceso)    | —     | regression | ✅        |
| E2E-RPT-004 | permission | E   | `/es/reportes`          | Logueado estudiante  | 1. Navegar a /es/reportes     | Redirige o acceso denegado                      | —     | regression | ⚠️ MD-015 |

### 5.2 Reportes por usuario (RF-32 — HU-27)

| ID          | Tipo  | Rol | Ruta                    | Precondiciones | Pasos                                 | Aserciones                                        | Datos | Suite      | Estado |
| ----------- | ----- | --- | ----------------------- | -------------- | ------------------------------------- | ------------------------------------------------- | ----- | ---------- | ------ |
| E2E-RPT-005 | happy | A   | `/es/reportes/usuarios` | Logueado admin | 1. Ir a /es/reportes/usuarios         | Tabla con reservas por usuario, filtros por fecha | —     | regression | ✅     |
| E2E-RPT-006 | happy | A   | `/es/reportes/usuarios` | Logueado admin | 1. Aplicar filtro por rango de fechas | Datos filtrados correctamente                     | —     | regression | ✅     |

### 5.3 Exportación CSV (RF-33 — HU-28)

| ID          | Tipo  | Rol | Ruta                    | Precondiciones | Pasos                       | Aserciones                       | Datos | Suite      | Estado |
| ----------- | ----- | --- | ----------------------- | -------------- | --------------------------- | -------------------------------- | ----- | ---------- | ------ |
| E2E-RPT-007 | happy | A   | `/es/reportes`          | Logueado admin | 1. Click botón exportar CSV | Botón presente y habilitado      | —     | smoke      | ✅     |
| E2E-RPT-008 | happy | A   | `/es/reportes/recursos` | Logueado admin | 1. Click exportar CSV       | Descarga de archivo CSV iniciada | —     | regression | ✅     |
| E2E-RPT-009 | happy | A   | `/es/reportes/usuarios` | Logueado admin | 1. Click exportar CSV       | Descarga de archivo CSV iniciada | —     | regression | ✅     |

### 5.4 Feedback usuarios (RF-34 — HU-29)

| ID          | Tipo  | Rol | Ruta | Precondiciones                     | Pasos                                                               | Aserciones                     | Datos                      | Suite    | Estado    |
| ----------- | ----- | --- | ---- | ---------------------------------- | ------------------------------------------------------------------- | ------------------------------ | -------------------------- | -------- | --------- |
| E2E-RPT-010 | happy | A   | —    | Logueado admin, reserva completada | 1. Abrir formulario de feedback 2. Calificar + comentario 3. Submit | Toast éxito, feedback guardado | Rating: 4, "Buen servicio" | extended | ⚠️ MD-009 |

### 5.5 Evaluaciones staff (RF-35 — HU-30)

| ID          | Tipo  | Rol | Ruta                     | Precondiciones                    | Pasos                                          | Aserciones                    | Datos | Suite      | Estado |
| ----------- | ----- | --- | ------------------------ | --------------------------------- | ---------------------------------------------- | ----------------------------- | ----- | ---------- | ------ |
| E2E-RPT-011 | happy | A   | `/es/admin/evaluaciones` | Logueado admin                    | 1. Ir a /es/admin/evaluaciones                 | Lista de evaluaciones visible | —     | regression | ✅     |
| E2E-RPT-012 | happy | A   | `/es/admin/evaluaciones` | Logueado admin                    | 1. Crear evaluación para un usuario 2. Guardar | Evaluación aparece en lista   | —     | extended   | ✅     |
| E2E-RPT-013 | happy | A   | `/es/admin/evaluaciones` | Logueado admin, evaluación existe | 1. Editar evaluación 2. Guardar                | Cambios reflejados            | —     | extended   | ✅     |

### 5.6 Reportes avanzados (RF-36 — HU-31)

| ID          | Tipo  | Rol | Ruta                    | Precondiciones | Pasos                         | Aserciones                             | Datos | Suite    | Estado |
| ----------- | ----- | --- | ----------------------- | -------------- | ----------------------------- | -------------------------------------- | ----- | -------- | ------ |
| E2E-RPT-014 | happy | A   | `/es/reportes/avanzado` | Logueado admin | 1. Ir a /es/reportes/avanzado | Interfaz de reportes avanzados visible | —     | extended | ✅     |

### 5.7 Demanda insatisfecha (RF-37 — HU-32)

| ID          | Tipo  | Rol | Ruta                                | Precondiciones | Pasos                                     | Aserciones                                         | Datos | Suite    | Estado |
| ----------- | ----- | --- | ----------------------------------- | -------------- | ----------------------------------------- | -------------------------------------------------- | ----- | -------- | ------ |
| E2E-RPT-015 | happy | A   | `/es/reportes/demanda-insatisfecha` | Logueado admin | 1. Ir a /es/reportes/demanda-insatisfecha | Reporte con recursos de alta demanda no satisfecha | —     | extended | ✅     |

### 5.8 Conflictos de reserva (RF-38)

| ID          | Tipo  | Rol | Ruta                      | Precondiciones | Pasos                           | Aserciones                                                | Datos | Suite    | Estado |
| ----------- | ----- | --- | ------------------------- | -------------- | ------------------------------- | --------------------------------------------------------- | ----- | -------- | ------ |
| E2E-RPT-016 | happy | A   | `/es/reportes/conflictos` | Logueado admin | 1. Ir a /es/reportes/conflictos | Tabla de conflictos detectados con períodos de saturación | —     | extended | ✅     |

### 5.9 Cumplimiento de reservas (RF-39)

| ID          | Tipo  | Rol | Ruta                        | Precondiciones | Pasos                             | Aserciones                                   | Datos | Suite    | Estado |
| ----------- | ----- | --- | --------------------------- | -------------- | --------------------------------- | -------------------------------------------- | ----- | -------- | ------ |
| E2E-RPT-017 | happy | A   | `/es/reportes/cumplimiento` | Logueado admin | 1. Ir a /es/reportes/cumplimiento | Métricas de check-in vs reservas confirmadas | —     | extended | ✅     |

### 5.10 Cancelaciones y ausencias (RF-40)

| ID          | Tipo  | Rol | Ruta           | Precondiciones | Pasos                                        | Aserciones                                  | Datos | Suite    | Estado    |
| ----------- | ----- | --- | -------------- | -------------- | -------------------------------------------- | ------------------------------------------- | ----- | -------- | --------- |
| E2E-RPT-018 | happy | A   | `/es/reportes` | Logueado admin | 1. Buscar sección de cancelaciones/ausencias | Datos de cancelaciones y ausencias visibles | —     | extended | ⚠️ MD-004 |

---

## 6. Navegación y dashboard transversal

| ID          | Tipo  | Rol | Ruta            | Precondiciones       | Pasos                                          | Aserciones                                                                                   | Datos | Suite      | Estado |
| ----------- | ----- | --- | --------------- | -------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------- | ----- | ---------- | ------ |
| E2E-NAV-001 | happy | A   | `/es/dashboard` | Logueado admin       | 1. Ir a /es/dashboard                          | Dashboard con KPIs, gráficos, resúmenes                                                      | —     | smoke      | ✅     |
| E2E-NAV-002 | happy | A   | sidebar         | Logueado admin       | 1. Verificar todos los items del sidebar admin | Todos los enlaces visibles: recursos, reservas, calendario, aprobaciones, reportes, admin/\* | —     | smoke      | ✅     |
| E2E-NAV-003 | happy | E   | sidebar         | Logueado estudiante  | 1. Verificar items del sidebar estudiante      | Solo items permitidos visibles; items admin ocultos                                          | —     | smoke      | ✅     |
| E2E-NAV-004 | happy | C   | sidebar         | Logueado coordinador | 1. Verificar items del sidebar coordinador     | Items de coordinador visibles; items solo-admin ocultos                                      | —     | regression | ✅     |
| E2E-NAV-005 | happy | P   | sidebar         | Logueado profesor    | 1. Verificar items del sidebar profesor        | Items restringidos; items admin ocultos                                                      | —     | regression | ✅     |

---

## Resumen de cobertura

### Por módulo

| Módulo       | Total   | Smoke (P0) | Regression (P1) | Extended (P2) | Bloqueados                 |
| ------------ | ------- | ---------- | --------------- | ------------- | -------------------------- |
| Auth         | 29      | 6          | 18              | 1             | 6 (MD-009, MD-015)         |
| Resources    | 21      | 4          | 12              | 4             | 2 (MD-006, MD-015)         |
| Availability | 22      | 4          | 11              | 6             | 3 (MD-007, MD-008, MD-015) |
| Stockpile    | 21      | 3          | 10              | 5             | 3 (MD-001, MD-015)         |
| Reports      | 18      | 3          | 6               | 8             | 2 (MD-004, MD-009)         |
| Navegación   | 5       | 3          | 2               | 0             | 0                          |
| **Total**    | **116** | **23**     | **59**          | **24**        | **16**                     |

### Por tipo

| Tipo       | Total |
| ---------- | ----- |
| happy      | 89    |
| negative   | 11    |
| permission | 16    |

### Por rol testeado

| Rol         | Total                   |
| ----------- | ----------------------- |
| admin       | 85+                     |
| coordinador | 12                      |
| profesor    | 6                       |
| estudiante  | 8                       |
| vigilancia  | 1 (⚠️ bloqueado MD-001) |

### Items bloqueados por MISSING_DEFINITIONS

| MD-ID  | Tests afectados           | Impacto                                      |
| ------ | ------------------------- | -------------------------------------------- |
| MD-001 | E2E-STK-011               | No se puede testear vigilancia sin mock user |
| MD-004 | E2E-RPT-018               | Sin ruta dedicada para RF-40                 |
| MD-006 | E2E-RES-017               | Sin UI de importación CSV visible            |
| MD-007 | E2E-AVL-020               | Flujo VoBo docente no documentado            |
| MD-008 | E2E-AVL-022               | UI de reservas múltiples no documentada      |
| MD-009 | E2E-AUTH-009, E2E-RPT-010 | Catálogo de mensajes error i18n pendiente    |
| MD-015 | 8 tests de permisos       | Comportamiento ante ruta denegada indefinido |
