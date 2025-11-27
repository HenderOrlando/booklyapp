# RF-12: Diagramas de Flujo - Reservas Recurrentes

**Fecha**: 2025-01-04  
**Servicio**: `availability-service`  
**Versión**: 1.0

---

## 📋 Tabla de Contenidos

1. [Crear Serie Recurrente](#crear-serie-recurrente)
2. [Validar Disponibilidad de Serie](#validar-disponibilidad-de-serie)
3. [Generar Ocurrencias](#generar-ocurrencias)
4. [Actualizar Serie Completa](#actualizar-serie-completa)
5. [Cancelar Serie](#cancelar-serie)
6. [Modificar Instancia Individual](#modificar-instancia-individual)
7. [Arquitectura General](#arquitectura-general)

---

## 🔄 Diagramas de Flujo

### 1. Crear Serie Recurrente

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant CommandBus
    participant Handler
    participant Service
    participant Repository
    participant MongoDB
    participant Kafka

    Client->>Controller: POST /reservations/recurring
    Controller->>Controller: Validate JWT
    Controller->>CommandBus: CreateRecurringReservationCommand
    CommandBus->>Handler: execute()
    Handler->>Service: createRecurringSeries()

    Service->>Service: validateRecurrencePattern()
    alt Pattern inválido
        Service-->>Handler: throw ValidationError
        Handler-->>Client: 400 Bad Request
    end

    Service->>Service: generateOccurrences()
    Note over Service: Genera fechas según patrón

    Service->>Service: validateSeriesAvailability()
    Service->>Repository: find(conflicts)
    Repository->>MongoDB: query
    MongoDB-->>Repository: reservations
    Repository-->>Service: conflicts[]

    alt Conflictos detectados y createAllOrNone=true
        Service-->>Handler: return with failedInstances
        Handler-->>Client: 400 with conflict details
    end

    Service->>Service: createReservationInstances()
    loop Para cada ocurrencia
        Service->>Repository: create(reservation)
        Repository->>MongoDB: insert
        MongoDB-->>Repository: saved
    end

    Service->>Kafka: Publish RecurringSeriesCreated
    Service-->>Handler: RecurringReservationResponseDto
    Handler-->>Client: 201 Created
```

---

### 2. Validar Disponibilidad de Serie

```mermaid
flowchart TD
    A[Inicio: validateSeriesAvailability] --> B[Inicializar conflicts array]
    B --> C{Para cada ocurrencia}

    C -->|Siguiente| D[Buscar reservas en MongoDB]
    D --> E{¿Hay conflictos?}

    E -->|Sí| F[Agregar a conflicts con detalles]
    E -->|No| G[Ocurrencia válida]

    F --> H{¿Más ocurrencias?}
    G --> H

    H -->|Sí| C
    H -->|No| I{¿conflicts.length > 0?}

    I -->|Sí| J[Retornar FailedInstanceDto[]]
    I -->|No| K[Retornar array vacío]

    J --> L[Fin]
    K --> L

    style E fill:#ff6b6b
    style I fill:#ffd93d
    style K fill:#6bcf7f
```

---

### 3. Generar Ocurrencias

```mermaid
flowchart TD
    A[Inicio: generateOccurrences] --> B[Validar patrón]
    B --> C{Tipo de frecuencia}

    C -->|Daily| D[Calcular ocurrencias diarias]
    C -->|Weekly| E[Calcular ocurrencias semanales]
    C -->|Monthly| F[Calcular ocurrencias mensuales]

    D --> G[Agregar interval días]
    E --> H[Filtrar por daysOfWeek]
    F --> I[Establecer día del mes]

    G --> J{¿endDate o occurrences?}
    H --> J
    I --> J

    J -->|endDate| K[Generar hasta endDate]
    J -->|occurrences| L[Generar N ocurrencias]

    K --> M{¿Alcanzó límite de 365?}
    L --> M

    M -->|Sí| N[Truncar a 365]
    M -->|No| O[Mantener todas]

    N --> P[Retornar Date[]]
    O --> P

    style B fill:#4ecdc4
    style C fill:#ffd93d
    style M fill:#ff6b6b
    style P fill:#6bcf7f
```

---

### 4. Actualizar Serie Completa

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant CommandBus
    participant Handler
    participant Service
    participant Repository
    participant MongoDB

    Client->>Controller: PATCH /series/:seriesId
    Controller->>CommandBus: UpdateRecurringSeriesCommand
    CommandBus->>Handler: execute()
    Handler->>Service: updateRecurringSeries()

    Service->>Repository: find({seriesId, status != CANCELLED})
    Repository->>MongoDB: query
    MongoDB-->>Repository: instances[]
    Repository-->>Service: instances[]

    alt No hay instancias
        Service-->>Handler: throw Error
        Handler-->>Client: 404 Not Found
    end

    Service->>Service: Filtrar instancias futuras
    Note over Service: Si updatePastInstances=false

    loop Para cada instancia
        Service->>Repository: update(instanceId, data)
        Repository->>MongoDB: updateOne
        MongoDB-->>Repository: updated
    end

    Service-->>Handler: Result with updatedCount
    Handler-->>Client: 200 OK
```

---

### 5. Cancelar Serie

```mermaid
flowchart TD
    A[Inicio: cancelRecurringSeries] --> B[Buscar instancias activas]
    B --> C{¿Instancias encontradas?}

    C -->|No| D[throw Error: Serie no encontrada]
    C -->|Sí| E{cancelPastInstances?}

    E -->|true| F[Cancelar todas las instancias]
    E -->|false| G[Filtrar solo instancias futuras]

    F --> H[Loop: Para cada instancia]
    G --> H

    H --> I[Actualizar estado a CANCELLED]
    I --> J[Agregar audit info]
    J --> K[Guardar en MongoDB]

    K --> L{¿Más instancias?}
    L -->|Sí| H
    L -->|No| M[Retornar resultado]

    D --> N[404 Error]
    M --> O[200 Success]

    style C fill:#ffd93d
    style D fill:#ff6b6b
    style M fill:#6bcf7f
```

---

### 6. Modificar Instancia Individual

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant CommandBus
    participant Handler
    participant Service
    participant Repository
    participant MongoDB

    Client->>Controller: PATCH /series/instances/:id
    Controller->>CommandBus: ModifyRecurringInstanceCommand
    CommandBus->>Handler: execute()
    Handler->>Service: modifyRecurringInstance()

    Service->>Repository: findById(instanceId)
    Repository->>MongoDB: findOne
    MongoDB-->>Repository: instance
    Repository-->>Service: instance

    alt No existe
        Service-->>Handler: throw Error
        Handler-->>Client: 404 Not Found
    end

    alt No tiene seriesId
        Service-->>Handler: throw Error
        Handler-->>Client: 400 Bad Request
    end

    Service->>Repository: update(instanceId, newData)
    Repository->>MongoDB: updateOne
    MongoDB-->>Repository: updated

    Service->>Repository: findOne({seriesId, parent=null})
    Note over Service: Buscar master instance
    Repository->>MongoDB: findOne
    MongoDB-->>Repository: master

    Service->>Service: Agregar excepción a master
    Service->>Repository: update(masterId, exceptions)
    Repository->>MongoDB: updateOne
    MongoDB-->>Repository: updated

    Service-->>Handler: Success result
    Handler-->>Client: 200 OK
```

---

### 7. Arquitectura General

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Client]
        B[Mobile App]
        C[Postman/cURL]
    end

    subgraph "API Gateway"
        D[NestJS Controller]
        D1[JWT Auth Guard]
        D2[Validation Pipes]
    end

    subgraph "CQRS Layer"
        E[Command Bus]
        F[Query Bus]
        G[Event Bus]
    end

    subgraph "Application Layer"
        H[Command Handlers]
        I[Query Handlers]
        J[Event Handlers]
    end

    subgraph "Domain Layer"
        K[RecurringReservationService]
        L[ReservationService]
        M[AvailabilityService]
    end

    subgraph "Infrastructure Layer"
        N[Reservation Repository]
        O[Availability Repository]
        P[Resource Metadata Repository]
    end

    subgraph "Data Layer"
        Q[(MongoDB)]
        R[(Redis Cache)]
    end

    subgraph "Message Layer"
        S[Kafka Producer]
        T[Kafka Consumer]
    end

    A --> D
    B --> D
    C --> D

    D --> D1
    D1 --> D2
    D2 --> E
    D2 --> F

    E --> H
    F --> I
    G --> J

    H --> K
    I --> K
    J --> K

    K --> L
    K --> M

    L --> N
    M --> O
    K --> P

    N --> Q
    O --> Q
    P --> Q

    K --> R
    L --> R

    K --> S
    T --> J

    style D fill:#4ecdc4
    style K fill:#ffd93d
    style Q fill:#ff6b6b
    style S fill:#6bcf7f
```

---

## 🔄 Flujo de Datos: Crear Serie Recurrente

```mermaid
flowchart LR
    A[Cliente HTTP] -->|POST /recurring| B[Controller]
    B -->|CreateCommand| C[CommandBus]
    C --> D[Handler]
    D --> E[Service]

    E -->|1. Validar| F{Patrón válido?}
    F -->|No| G[400 Error]
    F -->|Sí| H[Generar fechas]

    H --> I[Validar disponibilidad]
    I -->|Query| J[(MongoDB)]
    J -->|Conflicts| K{¿Conflictos?}

    K -->|Sí y strict| L[Return con errores]
    K -->|No| M[Crear instancias]

    M -->|Insert| J
    M -->|Publish| N[Kafka]
    M --> O[Retornar respuesta]

    L --> P[Cliente recibe 400]
    O --> Q[Cliente recibe 201]

    style F fill:#ffd93d
    style K fill:#ffd93d
    style G fill:#ff6b6b
    style N fill:#6bcf7f
```

---

## 📊 Modelo de Estados

```mermaid
stateDiagram-v2
    [*] --> Pending: Crear Serie

    Pending --> Confirmed: Aprobar
    Pending --> Cancelled: Cancelar

    Confirmed --> InProgress: Check-in
    Confirmed --> Cancelled: Cancelar

    InProgress --> Completed: Check-out
    InProgress --> Cancelled: Cancelar

    Completed --> [*]
    Cancelled --> [*]

    note right of Pending
        Estado inicial de
        todas las instancias
    end note

    note right of Cancelled
        Estado final
        (no reversible)
    end note
```

---

## 🔍 Proceso de Validación

```mermaid
flowchart TD
    A[Request DTO] --> B{Validación de Schema}
    B -->|Fail| C[400 ValidationError]
    B -->|Pass| D{Patrón de Recurrencia}

    D -->|Daily| E[Validar interval: 1-30]
    D -->|Weekly| F[Validar daysOfWeek: 0-6]
    D -->|Monthly| G[Validar monthDay: 1-31]

    E --> H{endDate XOR occurrences?}
    F --> H
    G --> H

    H -->|No| I[400 ValidationError]
    H -->|Sí| J[Validar rango de fechas]

    J --> K{startDate < endDate?}
    K -->|No| L[400 ValidationError]
    K -->|Sí| M[Validar límite 365]

    M --> N{occurrences <= 365?}
    N -->|No| O[400 ValidationError]
    N -->|Sí| P[Validación exitosa]

    P --> Q[Continuar con creación]

    style B fill:#ffd93d
    style H fill:#ffd93d
    style P fill:#6bcf7f
    style C fill:#ff6b6b
    style I fill:#ff6b6b
    style L fill:#ff6b6b
    style O fill:#ff6b6b
```

---

## 🎯 Decisiones de Diseño

### 1. Generación de Instancias

**Decisión**: Generar todas las instancias al crear la serie.

**Alternativas consideradas**:

- Generación lazy (on-demand)
- Generación por lotes

**Ventajas**:

- ✅ Validación de disponibilidad completa
- ✅ Visualización inmediata del calendario
- ✅ Detección temprana de conflictos
- ✅ Simplicidad en consultas

**Desventajas**:

- ❌ Mayor uso de almacenamiento
- ❌ Tiempo de creación más largo

### 2. Manejo de Excepciones

**Decisión**: Almacenar excepciones en array dentro de la instancia master.

**Alternativas consideradas**:

- Colección separada de excepciones
- Flag booleano en cada instancia

**Ventajas**:

- ✅ Consulta rápida de excepciones
- ✅ Historial completo en un solo documento
- ✅ Fácil sincronización

### 3. Modo createAllOrNone

**Decisión**: Permitir modo estricto opcional.

**Razón**: Balance entre flexibilidad y consistencia.

**Comportamiento**:

- `createAllOrNone=true`: Falla si hay conflictos
- `createAllOrNone=false`: Crea instancias válidas y reporta conflictos

---

## 📈 Métricas y Observabilidad

```mermaid
flowchart LR
    A[Operación] --> B{Logger}
    B --> C[Winston]
    C --> D[Console]
    C --> E[File]
    C --> F[Sentry]

    A --> G{Metrics}
    G --> H[OpenTelemetry]
    H --> I[Traces]
    H --> J[Spans]

    A --> K{Events}
    K --> L[Kafka]
    L --> M[RecurringSeriesCreated]
    L --> N[RecurringSeriesCancelled]
    L --> O[InstanceModified]

    style C fill:#4ecdc4
    style H fill:#ffd93d
    style L fill:#6bcf7f
```

---

## 🔐 Seguridad y Autorización

```mermaid
flowchart TD
    A[Request] --> B{JWT válido?}
    B -->|No| C[401 Unauthorized]
    B -->|Sí| D{Usuario existe?}

    D -->|No| E[403 Forbidden]
    D -->|Sí| F{¿Es propietario?}

    F -->|No| G{¿Tiene rol admin?}
    F -->|Sí| H[Permitir operación]

    G -->|No| I[403 Forbidden]
    G -->|Sí| H

    H --> J[Ejecutar comando]
    J --> K[Auditar operación]

    style B fill:#ffd93d
    style F fill:#ffd93d
    style H fill:#6bcf7f
    style C fill:#ff6b6b
    style E fill:#ff6b6b
    style I fill:#ff6b6b
```

---

**Última Actualización**: 2025-01-04  
**Versión**: 1.0  
**Herramienta**: Mermaid Diagrams
