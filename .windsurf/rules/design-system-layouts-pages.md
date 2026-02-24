---
trigger: model_decision
description: when work in bookly-frontend folder
---

# 🧱 Layouts y Patrones de Página – Bookly

## 1. Propósito del documento

Este documento describe **cómo organizar páginas y layouts** en Bookly para que:

- La navegación sea consistente entre módulos (auth, recursos, reservas, stockpile, reportes).
- Los colores, fondos y superficies se apliquen de forma coherente.
- Nuevas pantallas (por ejemplo, futuros módulos) se puedan componer usando los mismos patrones.

Se basa en los tokens del archivo de colores y en los componentes del archivo de componentes.

---

## 2. Layout general de la aplicación

La aplicación Bookly se estructura típicamente como una **app tipo dashboard**:

- Header superior.
- Sidebar lateral (en desktop).
- Área de contenido principal.
- Modales y drawers para acciones secundarias.

### 2.1. Fondo y superficies

- Fondo general de la app: token `bg.app` (modo claro u oscuro).
- Superficies de contenido (cards, paneles): token `bg.surface`.
- Sidebar y header pueden usar variantes del color primario o un neutro oscuro, dependiendo del modo.

### 2.2. Diagrama de layout (Mermaid)

A nivel conceptual, se puede representar con un diagrama de cajas:

```mermaid
flowchart LR
  subgraph APP[Bookly App]
    direction TB
    H[Header]:::header
    subgraph BODY[ ]
      direction LR
      S[Sidebar]:::sidebar
      C[Contenido principal]:::content
    end
  end

  classDef header fill=#2563EB,stroke=#1D4ED8,color=#FFFFFF;
  classDef sidebar fill=#1E293B,stroke=#0F172A,color=#F9FAFB;
  classDef content fill=#FFFFFF,stroke=#E5E7EB,color=#111827;
```

En modo oscuro, los colores de las clases `header`, `sidebar` y `content` deben ajustarse a los tokens de ese modo, manteniendo la estructura.

---

## 3. Patrones de página principales

### 3.1. Página de listado (ejemplo: lista de recursos o reservas)

Estructura típica:

- Título de la página y breadcrumbs (opcional).
- Barra de acciones (filtros, búsqueda, botones “Crear recurso”, “Nueva reserva”).
- Zona de contenido con tabla o tarjetas.
- Paginación o scroll infinito.

Uso de color:

- Fondo de página: `bg.app`.
- Contenedores (tabla o grid de tarjetas): `bg.surface`.
- Filtros y búsqueda: inputs con colores definidos en el documento de componentes.
- Botones principales de acción: tokens de acción primaria y secundaria.

### 3.2. Página de detalle (ejemplo: detalle de recurso o reserva)

Estructura típica:

- Header de detalle con nombre del recurso o identificador de la reserva.
- Información clave en un panel superior (estado, fechas, responsable, etc.).
- Pestañas (tabs) para secciones: “Detalles”, “Historial”, “Aprobaciones”.

Uso de color:

- Estado actual del recurso o reserva representado con badges de estado (éxito, advertencia, error).
- Secciones internas organizadas en tarjetas con fondo `bg.surface` y bordes `border.subtle`.
- Tabs activos usando `action.primary` para el indicador.

### 3.3. Página de formulario (creación/edición)

Estructura típica:

- Título del formulario.
- Sección de campos agrupados por lógica (datos generales, reglas de disponibilidad, configuraciones avanzadas).
- Botones principales al final (por ejemplo “Guardar”, “Cancelar”).

Uso de color:

- Inputs con fondos neutros y bordes sutiles.
- Mensajes de error con tokens de estado de error.
- Botón principal en `action.primary.default`, botón secundario o de cancelar con variantes ghost o secundarias.

---

## 4. Comportamiento responsive

### 4.1. Breakpoints recomendados

Aunque se puede ajustar, una propuesta común es:

- Mobile: hasta 640 px.
- Tablet: 641–1024 px.
- Desktop: más de 1024 px.

### 4.2. Reglas generales

- En mobile, la sidebar se colapsa a un menú oculto (drawer) que se abre desde el header.
- Las tablas extensas deben poder convertirse en listas o tarjetas verticales en mobile.
- Los paddings laterales del contenido deben reducirse en pantallas pequeñas para aprovechar el espacio.

---

## 5. Relación entre módulos y color

Aunque todos los módulos comparten la misma paleta, se puede usar el color de forma sutil para dar identidad:

- Auth: vistas más limpias, menos elementos, mayor uso de `bg.surface` y primario en botones y títulos.
- Recursos y reservas: uso intenso de tarjetas y tablas, manteniendo neutros como base y primario/ secundario para acciones.
- Stockpile (aprobaciones): uso de badges y alertas para reflejar estados de aprobación.
- Reportes: posible uso de variantes del color primario y secundario en gráficos, siempre manteniendo legibilidad.

No se deben inventar nuevas gamas de color por módulo; solo jugar con distribución e intensidad usando los tokens existentes.

---

## 6. Ejemplo de composición de página de dashboard

A nivel conceptual:

- Header con navegación principal y selector de campus o rol.
- Sidebar con secciones: Recursos, Reservas, Aprobaciones, Reportes, Configuración.
- Contenido principal con:

  - Tarjetas de KPIs (por ejemplo, porcentaje de ocupación de recursos).
  - Listado de acciones recientes.
  - Atajos a tareas frecuentes (nueva reserva, nuevos recursos, generación de reporte).

Uso de color:

- Tarjetas de KPI: pueden tener un borde o banda lateral usando el color primario o secundario, pero fondo neutro para no saturar.
- Alertas globales: situadas en la parte superior de la zona de contenido, usando los tokens de estado.

---

## 7. Buenas prácticas de diseño de página

1. Evitar más de una jerarquía fuerte de color por vista.  
   Normalmente el header y el botón primario ya dan suficiente peso visual.

2. Mantener un espacio consistente entre secciones.  
   Margen vertical uniforme entre bloques principales.

3. Usar tipografía y tamaño como primer nivel de jerarquía y color como apoyo, no al revés.

4. Evitar fondos saturados en grandes superficies.  
   Reservar los colores vivos para acciones y estados.

---

## 8. Relación con los demás documentos

Este documento se complementa con:

- `Bookly_Design_System_Colors_and_Tokens.md` – define la paleta y los tokens.
- `Bookly_Design_System_Components.md` – define cómo los tokens se aplican a componentes individuales.

La combinación de estos tres archivos permite:

- Diseñar nuevas páginas.
- Construir nuevos módulos.
- Mantener la identidad visual de Bookly a lo largo del tiempo.
