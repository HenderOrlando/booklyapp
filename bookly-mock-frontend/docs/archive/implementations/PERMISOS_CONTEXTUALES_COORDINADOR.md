# 🔐 Permisos Contextuales del Coordinador de Programa

**Fecha**: 23 de Noviembre de 2025  
**Estado**: 📋 Documentado - Pendiente Implementación Backend

---

## 🎯 Modelo de Permisos

### Tipos de Permisos en Bookly

#### 1. **Permisos Basados en ROL** (✅ Implementado en Frontend)

- Define QUÉ opciones del menú puede VER cada rol
- Manejado por: `AppSidebar` en el frontend
- Ejemplo: Un estudiante NO ve "Aprobaciones"

#### 2. **Permisos CONTEXTUALES** (⚠️ Requiere Backend)

- Define QUÉ DATOS puede ver/modificar dentro de cada opción
- Manejado por: **Backend** filtra según contexto del usuario
- Ejemplo: Un coordinador ve "Programas" pero solo puede editar SU programa

---

## 👥 Roles y Jerarquía

### 🔹 **Admin (GENERAL_ADMIN)**

- **Alcance**: TODO el sistema
- **Permisos**: Sin restricciones
- **Puede**:
  - Crear programas académicos
  - Asignar coordinadores a programas
  - Ver/modificar todos los recursos, mantenimientos, aprobaciones

### 🔹 **Coordinador de Programa**

- **Definición**: Profesor asignado por el admin como coordinador de UN programa académico específico
- **Alcance**: Solo el programa que coordina
- **Asignación**: `User.coordinatedProgram` (foreign key al programa)

### 🔹 **Profesor**

- **Alcance**: Sus propias reservas y recursos generales
- **Permisos**: Ver recursos, hacer reservas, ver historial propio

### 🔹 **Estudiante**

- **Alcance**: Sus propias reservas
- **Permisos**: Ver recursos, hacer reservas

---

## 📊 Matriz de Permisos Detallada

| Funcionalidad            | Admin               | Coordinador                             | Profesor    | Estudiante      |
| ------------------------ | ------------------- | --------------------------------------- | ----------- | --------------- |
| **Dashboard**            | Todo                | Su programa                             | Sus datos   | Sus datos       |
| **Recursos**             | CRUD todos          | Ver todos, gestionar los de su programa | Ver todos   | Ver disponibles |
| **Categorías**           | CRUD                | Ver todas                               | ❌          | ❌              |
| **Programas Académicos** | CRUD todos          | Solo editar SU programa                 | ❌          | ❌              |
| **Mantenimientos**       | Ver/gestionar todos | Solo los de recursos de SU programa     | ❌          | ❌              |
| **Reservas**             | Ver todas           | Ver todas, gestionar las de su programa | Ver propias | Ver propias     |
| **Lista de Espera**      | Ver/gestionar toda  | Ver/gestionar la de SU programa         | ❌          | ❌              |
| **Aprobaciones**         | Aprobar todas       | Aprobar solo reservas de SU programa    | ❌          | ❌              |
| **Vigilancia**           | ✅                  | ❌                                      | ❌          | ❌              |
| **Check-in/Check-out**   | ✅                  | ✅                                      | ✅          | ✅              |
| **Reportes**             | Todos los programas | Solo SU programa                        | ❌          | ❌              |
| **Plantillas**           | CRUD todas          | Ver todas, editar las de SU programa    | ❌          | ❌              |
| **Roles y Permisos**     | ✅                  | ❌                                      | ❌          | ❌              |
| **Auditoría**            | ✅                  | ❌                                      | ❌          | ❌              |

---

## 🏗️ Modelo de Datos Requerido

### User (Usuario)

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];

  // CLAVE: Programa que coordina (si es coordinador)
  coordinatedProgramId?: string;
  coordinatedProgram?: AcademicProgram;
}
```

### AcademicProgram (Programa Académico)

```typescript
interface AcademicProgram {
  id: string;
  code: string;
  name: string;
  description?: string;

  // CLAVE: Coordinador asignado
  coordinatorId: string;
  coordinator: User;

  // Recursos asociados al programa
  resources: Resource[];

  createdAt: Date;
  updatedAt: Date;
}
```

### Resource (Recurso)

```typescript
interface Resource {
  id: string;
  name: string;

  // CLAVE: Programa al que pertenece
  academicProgramId: string;
  academicProgram: AcademicProgram;

  // ... otros campos
}
```

---

## 🔒 Lógica de Permisos Contextuales

### 1. **Programas Académicos**

#### Admin:

```typescript
// Backend - GET /api/v1/programs
async findAll(user: User) {
  // Sin filtro - devuelve todos
  return await this.programRepository.findAll();
}
```

#### Coordinador:

```typescript
// Backend - GET /api/v1/programs
async findAll(user: User) {
  if (user.role === 'coordinador') {
    // Filtrar: solo su programa
    return await this.programRepository.findById(user.coordinatedProgramId);
  }
}

// Backend - PUT /api/v1/programs/:id
async update(id: string, data: UpdateProgramDto, user: User) {
  if (user.role === 'coordinador') {
    // Validar: solo puede editar su programa
    if (id !== user.coordinatedProgramId) {
      throw new ForbiddenException('Solo puedes editar tu programa');
    }
  }

  return await this.programRepository.update(id, data);
}
```

---

### 2. **Mantenimientos**

#### Admin:

```typescript
// Backend - GET /api/v1/maintenances
async findAll(user: User) {
  // Sin filtro - todos los mantenimientos
  return await this.maintenanceRepository.findAll();
}
```

#### Coordinador:

```typescript
// Backend - GET /api/v1/maintenances
async findAll(user: User) {
  if (user.role === 'coordinador') {
    // Filtrar: solo mantenimientos de recursos de su programa
    return await this.maintenanceRepository.findByProgramId(
      user.coordinatedProgramId
    );
  }
}
```

---

### 3. **Aprobaciones de Reservas**

#### Admin:

```typescript
// Backend - GET /api/v1/approvals/pending
async findPending(user: User) {
  // Sin filtro - todas las aprobaciones pendientes
  return await this.approvalRepository.findPending();
}
```

#### Coordinador:

```typescript
// Backend - GET /api/v1/approvals/pending
async findPending(user: User) {
  if (user.role === 'coordinador') {
    // Filtrar: solo aprobaciones de recursos de su programa
    return await this.approvalRepository.findPendingByProgramId(
      user.coordinatedProgramId
    );
  }
}

// Backend - POST /api/v1/approvals/:id/approve
async approve(id: string, user: User) {
  const approval = await this.approvalRepository.findById(id);
  const resource = await this.resourceRepository.findById(approval.resourceId);

  if (user.role === 'coordinador') {
    // Validar: el recurso debe ser de su programa
    if (resource.academicProgramId !== user.coordinatedProgramId) {
      throw new ForbiddenException(
        'Solo puedes aprobar reservas de recursos de tu programa'
      );
    }
  }

  return await this.approvalService.approve(id);
}
```

---

### 4. **Lista de Espera**

#### Admin:

```typescript
// Backend - GET /api/v1/waiting-list
async findAll(user: User) {
  // Sin filtro - todas las listas
  return await this.waitingListRepository.findAll();
}
```

#### Coordinador:

```typescript
// Backend - GET /api/v1/waiting-list
async findAll(user: User) {
  if (user.role === 'coordinador') {
    // Filtrar: solo lista de espera de recursos de su programa
    return await this.waitingListRepository.findByProgramId(
      user.coordinatedProgramId
    );
  }
}
```

---

### 5. **Reportes**

#### Admin:

```typescript
// Backend - GET /api/v1/reports/resources
async getResourceReport(filters: ReportFilters, user: User) {
  // Sin filtro - todos los programas
  return await this.reportService.getResourceReport(filters);
}
```

#### Coordinador:

```typescript
// Backend - GET /api/v1/reports/resources
async getResourceReport(filters: ReportFilters, user: User) {
  if (user.role === 'coordinador') {
    // Forzar filtro por su programa
    filters.programId = user.coordinatedProgramId;
  }

  return await this.reportService.getResourceReport(filters);
}
```

---

## 🎨 Frontend: Filtrado en UI

### Ejemplo: Selector de Programa

```typescript
// Component: ProgramSelector.tsx
function ProgramSelector() {
  const { user } = useAuth();
  const { data: programs } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      // El backend YA filtra según el rol
      const response = await httpClient.get('/programs');
      return response.data;
    }
  });

  // Si es coordinador, solo verá SU programa en el dropdown
  // Si es admin, verá TODOS los programas

  return (
    <select>
      {programs.map(program => (
        <option key={program.id} value={program.id}>
          {program.name}
        </option>
      ))}
    </select>
  );
}
```

### Ejemplo: Lista de Aprobaciones

```typescript
// Page: AprobacionesPage.tsx
function AprobacionesPage() {
  const { user } = useAuth();
  const { data: approvals } = useQuery({
    queryKey: ['approvals', 'pending'],
    queryFn: async () => {
      // El backend filtra automáticamente según el rol
      // Coordinador: solo aprobaciones de su programa
      // Admin: todas las aprobaciones
      const response = await httpClient.get('/approvals/pending');
      return response.data;
    }
  });

  return (
    <div>
      <h1>Aprobaciones Pendientes</h1>
      {user.role === 'coordinador' && (
        <p className="text-sm text-gray-500">
          Mostrando solo aprobaciones del programa: {user.coordinatedProgram?.name}
        </p>
      )}

      <ApprovalsList approvals={approvals} />
    </div>
  );
}
```

---

## ✅ Implementación: Checklist

### Backend (Crítico)

- [ ] Agregar `coordinatedProgramId` al modelo `User`
- [ ] Agregar `coordinatorId` al modelo `AcademicProgram`
- [ ] Agregar `academicProgramId` al modelo `Resource`
- [ ] Implementar filtros contextuales en:
  - [ ] `ProgramsService.findAll()`
  - [ ] `MaintenancesService.findAll()`
  - [ ] `ApprovalsService.findPending()`
  - [ ] `WaitingListService.findAll()`
  - [ ] `ReportsService.getResourceReport()`
- [ ] Agregar validaciones en métodos de escritura:
  - [ ] `ProgramsService.update()` - validar es su programa
  - [ ] `ApprovalsService.approve()` - validar es recurso de su programa
  - [ ] `MaintenancesService.create()` - validar es recurso de su programa
- [ ] Pruebas unitarias de permisos contextuales
- [ ] Documentación de endpoints con filtros

### Frontend (Mejoras)

- [ ] Actualizar interfaces TypeScript con nuevos campos
- [ ] Agregar indicador visual en UI cuando hay filtrado por programa
- [ ] Mensajes informativos para coordinadores sobre su alcance
- [ ] Validación de formularios según permisos
- [ ] Deshabilitar campos que no puede editar

---

## 🚨 Importante: Seguridad

### ⚠️ NUNCA confíes solo en el Frontend

```typescript
// ❌ MAL - Solo ocultar en UI
if (user.role !== 'admin') {
  // Ocultar botón, pero el endpoint sigue accesible
  return null;
}

// ✅ BIEN - Backend valida permisos
// Backend:
async update(id: string, data: any, user: User) {
  // Validar SIEMPRE en el backend
  if (user.role === 'coordinador' && id !== user.coordinatedProgramId) {
    throw new ForbiddenException();
  }

  return await this.repository.update(id, data);
}
```

### Capas de Seguridad

1. **UI**: Oculta opciones no permitidas (UX)
2. **Middleware**: Verifica autenticación (tiene token?)
3. **Guards**: Verifica roles básicos
4. **Service Layer**: Valida permisos contextuales (CRÍTICO)
5. **Database**: Constraints y triggers de respaldo

---

## 📚 Flujo Completo: Aprobar Reserva

```
1. Coordinador ve "Aprobaciones" en el sidebar (por rol)
   ↓
2. Frontend: GET /api/v1/approvals/pending
   ↓
3. Backend: Detecta user.role = 'coordinador'
   ↓
4. Backend: Filtra WHERE resource.programId = user.coordinatedProgramId
   ↓
5. Frontend: Muestra solo aprobaciones de su programa
   ↓
6. Usuario hace click en "Aprobar"
   ↓
7. Frontend: POST /api/v1/approvals/:id/approve
   ↓
8. Backend: Valida que approval.resource.programId === user.coordinatedProgramId
   ↓
9. Backend: Si válido → Aprueba, sino → 403 Forbidden
   ↓
10. Frontend: Muestra resultado al usuario
```

---

## 🎓 Resumen

### Lo que el Frontend PUEDE hacer:

- ✅ Ocultar/mostrar opciones del menú según rol
- ✅ Mostrar mensajes informativos sobre alcance
- ✅ Deshabilitar campos que no puede editar
- ✅ Validaciones de UX (no de seguridad)

### Lo que el Frontend NO PUEDE hacer:

- ❌ Filtrar datos según contexto (el backend debe filtrar)
- ❌ Garantizar seguridad (siempre validar en backend)
- ❌ Prevenir acceso directo a endpoints (middleware/guards)

### Lo que el Backend DEBE hacer:

- 🔒 Filtrar datos según `user.coordinatedProgramId`
- 🔒 Validar permisos en TODOS los endpoints de escritura
- 🔒 Retornar 403 Forbidden si accede a datos fuera de su alcance
- 🔒 Loggear intentos de acceso no autorizado

---

**Última actualización**: 2025-11-23  
**Estado**: Documentación completa - Implementación backend pendiente  
**Prioridad**: Alta - Requiere cambios en base de datos y lógica de backend
