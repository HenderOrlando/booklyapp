# ✅ Tab de Programas en Crear Recurso - Implementado

**Fecha**: 20 de Noviembre 2025, 23:55  
**Estado**: ✅ Completado

---

## 🎯 Objetivo

Agregar funcionalidad para configurar qué programas académicos pueden reservar un recurso específico durante su creación.

---

## 📋 Funcionalidad Implementada

### Tab de Programas Académicos

Se agregó un **5º Tab** en el formulario de crear recurso (`/recursos/nuevo`) con las siguientes características:

#### 1. **Carga Automática de Programas**

- Al montar el componente, se cargan todos los programas académicos disponibles
- Endpoint: `GET /programs`
- Los programas se muestran con información completa

#### 2. **Selección de Programas**

- ✅ Checkboxes individuales para cada programa
- ✅ Botón "Seleccionar/Deseleccionar Todos"
- ✅ Contador de programas seleccionados (X / Total)

#### 3. **Vista de Cada Programa**

```
┌────────────────────────────────────────────┐
│ ☐ Ingeniería de Sistemas    [ISI-001]     │
│   Programa de Ingeniería de Sistemas...    │
│   📚 Facultad de Ingeniería               │
│   🏛️ Depto. de Sistemas                   │
└────────────────────────────────────────────┘
```

Cada programa muestra:

- **Nombre**: Título del programa
- **Código**: Identificador único (monospace)
- **Descripción**: Texto descriptivo (si existe)
- **Facultad**: Facultad a la que pertenece (📚)
- **Departamento**: Departamento específico (🏛️)

#### 4. **Resumen de Selección**

Cuando se seleccionan programas, aparece un resumen con badges:

```
Resumen de selección:
[ ISI-001 × ]  [ IEL-002 × ]  [ IME-003 × ]
```

- **Badges azules** con código del programa
- **Botón ×** para remover individualmente

#### 5. **Mensaje Informativo**

```
⚠️ Nota: Si no seleccionas ningún programa, el recurso
estará disponible para todos los programas académicos.
```

---

## 🔧 Cambios Técnicos

### Archivo Modificado

`src/app/recursos/nuevo/page.tsx` (~750 líneas)

### Estados Agregados

```typescript
const [programs, setPrograms] = React.useState<AcademicProgram[]>([]);
const [selectedPrograms, setSelectedPrograms] = React.useState<string[]>([]);
```

### Funciones Nuevas

#### 1. `handleProgramToggle(programId: string)`

- Toggle individual de programa
- Actualiza `selectedPrograms` y `formData.programIds`

#### 2. `handleSelectAllPrograms()`

- Selecciona/deselecciona todos los programas
- Actualiza ambos estados simultáneamente

#### 3. Carga de datos actualizada

```typescript
React.useEffect(() => {
  const fetchData = async () => {
    // Cargar categorías
    const categoriesResponse = await httpClient.get("categories");
    setCategories(categoriesResponse.data.items || []);

    // Cargar programas académicos
    const programsResponse = await httpClient.get("programs");
    setPrograms(programsResponse.data.items || []);
  };
  fetchData();
}, []);
```

### TabsList Actualizado

```typescript
<TabsList className="grid w-full grid-cols-5 mb-6">
  <TabsTrigger value="basica">Información Básica</TabsTrigger>
  <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
  <TabsTrigger value="caracteristicas">Características</TabsTrigger>
  <TabsTrigger value="programas">Programas</TabsTrigger>  {/* ⭐ NUEVO */}
  <TabsTrigger value="disponibilidad">Disponibilidad</TabsTrigger>
</TabsList>
```

---

## 🎨 UI/UX Features

### Características Visuales

1. **Cards Interactivos**: Hover effect en cada programa
2. **Estadística en Tiempo Real**: Muestra X/Total seleccionados
3. **Feedback Visual**:
   - Checkboxes grandes (20x20px)
   - Badges con botón de remover
   - Colores diferenciados (azul para selección)
4. **Estado Vacío**: Mensaje cuando no hay programas
5. **Responsive**: Grid que se adapta a mobile/desktop

### Colores

- **Fondo cards**: `bg-gray-800`
- **Hover**: `hover:bg-gray-750`
- **Resumen**: `bg-blue-900/20` con border `border-blue-800`
- **Badges**: `bg-blue-900` con texto `text-blue-200`

---

## 📊 Flujo de Datos

```
1. Usuario entra a /recursos/nuevo
   ↓
2. useEffect carga programas desde API
   ↓
3. Tab "Programas" muestra lista de programas
   ↓
4. Usuario selecciona programas con checkboxes
   ↓
5. handleProgramToggle actualiza:
   - selectedPrograms (estado UI)
   - formData.programIds (datos a enviar)
   ↓
6. Al hacer submit, formData.programIds se envía al backend
   ↓
7. Recurso se crea con restricción a programas seleccionados
```

---

## 💡 Lógica de Negocio

### Regla Importante

```typescript
// Si no se selecciona NINGÚN programa:
formData.programIds = []; // Recurso disponible para TODOS

// Si se seleccionan programas específicos:
formData.programIds = ["prog_1", "prog_2"]; // Solo esos programas
```

### Validación

- ✅ No es obligatorio seleccionar programas
- ✅ Se puede seleccionar 1 o más programas
- ✅ Se puede deseleccionar todos (= disponible para todos)

---

## 🔄 Integración con CreateResourceDto

El tipo ya tenía el campo `programIds`:

```typescript
export interface CreateResourceDto {
  // ... otros campos
  programIds?: string[]; // ✅ Ya existía
  // ... otros campos
}
```

Por lo tanto, el backend ya está preparado para recibir esta data.

---

## 📝 Ejemplo de Uso

### Caso 1: Recurso para todos los programas

1. Usuario NO selecciona ningún programa
2. `formData.programIds = []`
3. Backend interpreta como "disponible para todos"

### Caso 2: Recurso exclusivo para Ingeniería

1. Usuario selecciona:
   - Ingeniería de Sistemas
   - Ingeniería Electrónica
   - Ingeniería Mecánica
2. `formData.programIds = ['prog_isi', 'prog_iel', 'prog_ime']`
3. Backend restringe reservas solo a esos 3 programas

### Caso 3: Recurso para un solo programa

1. Usuario selecciona solo "Medicina"
2. `formData.programIds = ['prog_med']`
3. Solo estudiantes/profesores de Medicina pueden reservar

---

## ✅ Checklist de Features

- [x] Carga de programas desde API
- [x] Listado con información completa
- [x] Checkboxes individuales
- [x] Botón seleccionar/deseleccionar todos
- [x] Contador en tiempo real
- [x] Resumen con badges
- [x] Botón de remover individual en badges
- [x] Mensaje informativo sobre comportamiento
- [x] Integración con formData
- [x] Estado vacío cuando no hay programas
- [x] Hover effects y transiciones
- [x] Responsive design

---

## 🎯 Resultado

**Tab de Programas completamente funcional** que permite:

- ✅ Seleccionar qué programas académicos pueden reservar un recurso
- ✅ Configurar disponibilidad granular por programa
- ✅ UI intuitiva con feedback visual
- ✅ Integración perfecta con el flujo de creación

---

## 🚀 Próximos Pasos Opcionales

1. **Filtros**: Buscar programas por nombre/código
2. **Agrupación**: Agrupar por facultad
3. **Selección por facultad**: Seleccionar todos de una facultad
4. **Horarios por programa**: Configurar horarios diferentes por programa
5. **Prioridad**: Dar prioridad a ciertos programas

---

**🎉 ¡Tab de Programas implementado exitosamente! Los administradores ahora pueden configurar granularmente qué programas académicos tienen acceso a cada recurso. ✨**
