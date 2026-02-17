"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/atoms/Alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/Avatar";
import { Badge } from "@/components/atoms/Badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/atoms/Breadcrumb";
import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/atoms/DropdownMenu";
import { Input } from "@/components/atoms/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import { Skeleton } from "@/components/atoms/Skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/atoms/Tabs";
import { DataTable } from "@/components/molecules/DataTable";
import { DatePicker } from "@/components/molecules/DatePicker";
import { ThemeColorEditorPanel } from "@/components/organisms/ThemeColorEditorPanel";
import { MainLayout } from "@/components/templates/MainLayout";
import * as React from "react";

/**
 * Página de Demostración del Sistema de Diseño Bookly
 *
 * Muestra todos los componentes implementados con sus variantes
 * siguiendo las reglas del design system.
 */

type DemoResourceRow = {
  id: string;
  nombre: string;
  tipo: string;
  capacidad: number;
  estado: "disponible" | "ocupado" | "mantenimiento";
};

export default function DesignSystemPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>();
  const [currentPage, setCurrentPage] = React.useState(1);
  const header = (
    <div className="flex items-center justify-between flex-1">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Bookly</h1>
        <span className="text-sm">Design System</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-[var(--color-text-inverse)] hover:bg-[var(--color-action-ghost-hover)]"
      >
        Cerrar Sesión
      </Button>
    </div>
  );

  const sidebar = (
    <nav className="space-y-2">
      <a
        href="/design-system"
        className="block rounded-md bg-[var(--color-action-primary)] px-4 py-2 text-[var(--color-text-inverse)]"
      >
        Design System
      </a>
      <a
        href="/"
        className="block rounded-md px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-action-ghost-hover)]"
      >
        Dashboard
      </a>
      <a
        href="/recursos"
        className="block rounded-md px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-action-ghost-hover)]"
      >
        Recursos
      </a>
      <a
        href="/reservas"
        className="block rounded-md px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-action-ghost-hover)]"
      >
        Reservas
      </a>
      <a
        href="/aprobaciones"
        className="block rounded-md px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-action-ghost-hover)]"
      >
        Aprobaciones
      </a>
      <a
        href="/reportes"
        className="block rounded-md px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-action-ghost-hover)]"
      >
        Reportes
      </a>
    </nav>
  );

  return (
    <MainLayout header={header} sidebar={sidebar}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">
            Sistema de Diseño Bookly
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Componentes y tokens implementados siguiendo las reglas del design
            system
          </p>
        </div>

        <ThemeColorEditorPanel />

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas de Estado</CardTitle>
            <CardDescription>
              Comunican estados del sistema usando tokens semánticos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="success">
              <AlertTitle>Operación Exitosa</AlertTitle>
              <AlertDescription>
                La reserva ha sido confirmada correctamente.
              </AlertDescription>
            </Alert>

            <Alert variant="warning">
              <AlertTitle>Advertencia</AlertTitle>
              <AlertDescription>
                El recurso tiene mantenimiento programado para mañana.
              </AlertDescription>
            </Alert>

            <Alert variant="error">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                No se pudo procesar la solicitud. Por favor intenta nuevamente.
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertTitle>Información</AlertTitle>
              <AlertDescription>
                Recuerda revisar las políticas de uso antes de reservar.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges y Etiquetas</CardTitle>
            <CardDescription>
              Para indicar estados, categorías o prioridades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Neutro</Badge>
              <Badge variant="success">Confirmada</Badge>
              <Badge variant="warning">Pendiente</Badge>
              <Badge variant="error">Cancelada</Badge>
              <Badge variant="primary">Prioritaria</Badge>
              <Badge variant="secondary">Laboratorio</Badge>
              <Badge variant="outline">Sin categoría</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Botones</CardTitle>
            <CardDescription>
              Variantes: primary, secondary, ghost, destructive, outline, link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="variants">
              <TabsList>
                <TabsTrigger value="variants">Variantes</TabsTrigger>
                <TabsTrigger value="sizes">Tamaños</TabsTrigger>
                <TabsTrigger value="states">Estados</TabsTrigger>
              </TabsList>

              <TabsContent value="variants" className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button>Botón Primario</Button>
                  <Button variant="secondary">Botón Secundario</Button>
                  <Button variant="ghost">Botón Ghost</Button>
                  <Button variant="destructive">Eliminar</Button>
                  <Button variant="outline">Contorno</Button>
                  <Button variant="link">Enlace</Button>
                </div>
              </TabsContent>

              <TabsContent value="sizes" className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm">Pequeño</Button>
                  <Button size="default">Por Defecto</Button>
                  <Button size="lg">Grande</Button>
                  <Button size="icon">🔍</Button>
                </div>
              </TabsContent>

              <TabsContent value="states" className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button>Normal</Button>
                  <Button disabled>Deshabilitado</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Campos de Formulario</CardTitle>
            <CardDescription>
              Inputs con estados: default, focus, error, disabled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
                  Campo Normal
                </label>
                <Input placeholder="Escribe algo..." />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
                  Campo con Error
                </label>
                <Input
                  placeholder="Email inválido"
                  className="border-[var(--color-state-error-border)]"
                />
                <p className="text-xs text-[var(--color-state-error-text)] mt-1">
                  Este campo es requerido
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
                  Campo Deshabilitado
                </label>
                <Input placeholder="No editable" disabled />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
                  Campo con Focus
                </label>
                <Input placeholder="Click para focus" autoFocus />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Tarjetas</CardTitle>
            <CardDescription>
              Contenedores de información con superficie bg.surface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Recurso 1</CardTitle>
                  <CardDescription>Laboratorio de Computación</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        Capacidad
                      </span>
                      <Badge variant="primary">30 personas</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        Estado
                      </span>
                      <Badge variant="success">Disponible</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recurso 2</CardTitle>
                  <CardDescription>Auditorio Principal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        Capacidad
                      </span>
                      <Badge variant="primary">200 personas</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        Estado
                      </span>
                      <Badge variant="warning">En Mantenimiento</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recurso 3</CardTitle>
                  <CardDescription>Sala de Reuniones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        Capacidad
                      </span>
                      <Badge variant="primary">15 personas</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        Estado
                      </span>
                      <Badge variant="error">Ocupada</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Tokens de Color */}
        <Card>
          <CardHeader>
            <CardTitle>Tokens de Color</CardTitle>
            <CardDescription>Paleta base y tokens semánticos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Colores de marca */}
              <div>
                <h4 className="font-semibold mb-2">Colores de Marca</h4>
                <div className="flex gap-2">
                  <div className="flex h-20 flex-1 items-center justify-center rounded-md bg-[var(--color-action-primary)] text-[var(--color-text-inverse)]">
                    Primary
                  </div>
                  <div className="flex h-20 flex-1 items-center justify-center rounded-md bg-[var(--color-action-secondary)] text-[var(--color-text-inverse)]">
                    Secondary
                  </div>
                </div>
              </div>

              {/* Estados */}
              <div>
                <h4 className="font-semibold mb-2">Estados</h4>
                <div className="flex gap-2">
                  <div className="flex h-20 flex-1 items-center justify-center rounded-md border border-[var(--color-state-success-border)] bg-[var(--color-state-success-bg)] text-[var(--color-state-success-text)]">
                    Success
                  </div>
                  <div className="flex h-20 flex-1 items-center justify-center rounded-md border border-[var(--color-state-warning-border)] bg-[var(--color-state-warning-bg)] text-[var(--color-state-warning-text)]">
                    Warning
                  </div>
                  <div className="flex h-20 flex-1 items-center justify-center rounded-md border border-[var(--color-state-error-border)] bg-[var(--color-state-error-bg)] text-[var(--color-state-error-text)]">
                    Error
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FASE 2: Componentes Adicionales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Fase 2: Componentes Adicionales
            </CardTitle>
            <CardDescription>
              Componentes avanzados para funcionalidad completa
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Avatar */}
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>
              Imágenes de perfil con fallback a iniciales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6 items-center">
              <div className="space-y-2 text-center">
                <Avatar size="sm">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="Usuario"
                  />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Small
                </p>
              </div>

              <div className="space-y-2 text-center">
                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="Usuario"
                  />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Medium
                </p>
              </div>

              <div className="space-y-2 text-center">
                <Avatar size="lg">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="Usuario"
                  />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Large
                </p>
              </div>

              <div className="space-y-2 text-center">
                <Avatar size="xl">
                  <AvatarFallback>HO</AvatarFallback>
                </Avatar>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  XL con Iniciales
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dropdown Menu */}
        <Card>
          <CardHeader>
            <CardTitle>Dropdown Menu</CardTitle>
            <CardDescription>Menús contextuales y de acciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Acciones de Usuario</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Perfil</DropdownMenuItem>
                  <DropdownMenuItem>Configuración</DropdownMenuItem>
                  <DropdownMenuItem>Mis Reservas</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-[var(--color-state-error-text)]">
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Acciones de Recurso</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                  <DropdownMenuItem>Editar</DropdownMenuItem>
                  <DropdownMenuItem>Duplicar</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-[var(--color-state-error-text)]">
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Dialog/Modal */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog / Modal</CardTitle>
            <CardDescription>
              Ventanas modales para formularios y confirmaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Abrir Formulario</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nueva Reserva</DialogTitle>
                    <DialogDescription>
                      Complete los datos para crear una nueva reserva
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Recurso
                      </label>
                      <Input placeholder="Seleccione un recurso" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Fecha
                      </label>
                      <Input type="date" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost">Cancelar</Button>
                    <Button>Crear Reserva</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">Eliminar Recurso</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>¿Estás seguro?</DialogTitle>
                    <DialogDescription>
                      Esta acción no se puede deshacer. El recurso será
                      eliminado permanentemente.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="ghost">Cancelar</Button>
                    <Button variant="destructive">Eliminar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Select */}
        <Card>
          <CardHeader>
            <CardTitle>Select Personalizado</CardTitle>
            <CardDescription>
              Selector con diseño consistente del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tipo de Recurso
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salon">Salón</SelectItem>
                    <SelectItem value="laboratorio">Laboratorio</SelectItem>
                    <SelectItem value="auditorio">Auditorio</SelectItem>
                    <SelectItem value="equipo">Equipo Multimedia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Estado de Reserva
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="confirmada">Confirmada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breadcrumb */}
        <Card>
          <CardHeader>
            <CardTitle>Breadcrumb</CardTitle>
            <CardDescription>
              Navegación jerárquica de ubicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/recursos">Recursos</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Laboratorio A101</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/reservas">Reservas</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/reservas/pendientes">
                      Pendientes
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>RES-2024-001</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </CardContent>
        </Card>

        {/* Skeleton Loaders */}
        <Card>
          <CardHeader>
            <CardTitle>Skeleton Loaders</CardTitle>
            <CardDescription>
              Indicadores de carga para mejor UX
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Card Skeleton */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-4 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
              </div>

              {/* List Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DatePicker */}
        <Card>
          <CardHeader>
            <CardTitle>DatePicker</CardTitle>
            <CardDescription>
              Selector de fecha con calendario visual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Fecha de Reserva
                </label>
                <DatePicker
                  date={selectedDate}
                  onSelect={setSelectedDate}
                  placeholder="Selecciona una fecha"
                />
                {selectedDate && (
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    Fecha seleccionada:{" "}
                    {selectedDate.toLocaleDateString("es-ES")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Con fecha preseleccionada
                </label>
                <DatePicker
                  date={new Date()}
                  placeholder="Selecciona una fecha"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DataTable */}
        <Card>
          <CardHeader>
            <CardTitle>DataTable con Paginación</CardTitle>
            <CardDescription>
              Tabla con ordenamiento, paginación y estados de carga
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={[
                {
                  id: "1",
                  nombre: "Laboratorio A101",
                  tipo: "Laboratorio",
                  capacidad: 30,
                  estado: "disponible",
                },
                {
                  id: "2",
                  nombre: "Auditorio Principal",
                  tipo: "Auditorio",
                  capacidad: 200,
                  estado: "ocupado",
                },
                {
                  id: "3",
                  nombre: "Sala de Reuniones 3",
                  tipo: "Sala",
                  capacidad: 15,
                  estado: "disponible",
                },
                {
                  id: "4",
                  nombre: "Laboratorio B202",
                  tipo: "Laboratorio",
                  capacidad: 25,
                  estado: "mantenimiento",
                },
                {
                  id: "5",
                  nombre: "Salón 301",
                  tipo: "Salón",
                  capacidad: 40,
                  estado: "disponible",
                },
              ]}
              columns={[
                {
                  key: "nombre",
                  header: "Nombre",
                  sortable: true,
                  cell: (item: DemoResourceRow) => item.nombre,
                },
                {
                  key: "tipo",
                  header: "Tipo",
                  sortable: true,
                  cell: (item: DemoResourceRow) => (
                    <Badge variant="outline">{item.tipo}</Badge>
                  ),
                },
                {
                  key: "capacidad",
                  header: "Capacidad",
                  sortable: true,
                  cell: (item: DemoResourceRow) => `${item.capacidad} personas`,
                },
                {
                  key: "estado",
                  header: "Estado",
                  cell: (item: DemoResourceRow) => (
                    <Badge
                      variant={
                        item.estado === "disponible"
                          ? "success"
                          : item.estado === "ocupado"
                            ? "error"
                            : "warning"
                      }
                    >
                      {item.estado === "disponible"
                        ? "Disponible"
                        : item.estado === "ocupado"
                          ? "Ocupado"
                          : "Mantenimiento"}
                    </Badge>
                  ),
                },
              ]}
              currentPage={currentPage}
              totalPages={1}
              pageSize={5}
              totalItems={5}
              onPageChange={setCurrentPage}
              emptyMessage="No hay recursos disponibles"
            />
          </CardContent>
        </Card>

        {/* Sección de Layouts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Layouts Especializados</CardTitle>
            <CardDescription>
              Layouts listos para usar en páginas específicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>AuthLayout</CardTitle>
                  <CardDescription>Para login y registro</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                    <li>✓ Sin sidebar</li>
                    <li>✓ Diseño centrado</li>
                    <li>✓ Logo de Bookly</li>
                    <li>✓ Gradiente de fondo</li>
                    <li>✓ Footer con copyright</li>
                  </ul>
                  <Button
                    className="w-full mt-4"
                    onClick={() => (window.location.href = "/login")}
                  >
                    Ver Ejemplo
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>DashboardLayout</CardTitle>
                  <CardDescription>Para dashboards con KPIs</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                    <li>✓ Grid responsive para KPIs</li>
                    <li>✓ Indicadores de tendencia</li>
                    <li>✓ Estados de carga</li>
                    <li>✓ Tokens de color aplicados</li>
                  </ul>
                  <Button
                    className="w-full mt-4"
                    onClick={() => (window.location.href = "/dashboard")}
                  >
                    Ver Ejemplo
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ListLayout</CardTitle>
                  <CardDescription>Para listados con filtros</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                    <li>✓ Breadcrumbs integrados</li>
                    <li>✓ Búsqueda en tiempo real</li>
                    <li>✓ Botones de filtro y crear</li>
                    <li>✓ Grid responsive</li>
                  </ul>
                  <Button
                    className="w-full mt-4"
                    onClick={() => (window.location.href = "/recursos")}
                  >
                    Ver Ejemplo
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>DetailLayout</CardTitle>
                  <CardDescription>Para páginas de detalle</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                    <li>✓ Tabs para secciones</li>
                    <li>✓ Sidebar opcional</li>
                    <li>✓ Botones de acción</li>
                    <li>✓ Breadcrumbs de navegación</li>
                  </ul>
                  <Button
                    className="w-full mt-4"
                    onClick={() => (window.location.href = "/recursos/1")}
                  >
                    Ver Ejemplo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Resumen Final */}
        <Card className="border-[var(--color-border-focus)] bg-[var(--color-state-info-bg)]">
          <CardHeader>
            <CardTitle className="text-2xl">
              🎉 Sistema de Diseño Completo
            </CardTitle>
            <CardDescription className="text-base">
              Todos los componentes y layouts listos para producción
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-[var(--color-bg-primary)] p-4 text-center">
                <div className="text-3xl font-bold text-[var(--color-action-primary)]">
                  24
                </div>
                <div className="text-sm text-[var(--color-text-secondary)]">
                  Componentes
                </div>
              </div>
              <div className="rounded-lg bg-[var(--color-bg-primary)] p-4 text-center">
                <div className="text-3xl font-bold text-[var(--color-action-primary)]">
                  5
                </div>
                <div className="text-sm text-[var(--color-text-secondary)]">
                  Layouts
                </div>
              </div>
              <div className="rounded-lg bg-[var(--color-bg-primary)] p-4 text-center">
                <div className="text-3xl font-bold text-[var(--color-action-primary)]">
                  40+
                </div>
                <div className="text-sm text-[var(--color-text-secondary)]">
                  Tokens CSS
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-[var(--color-text-primary)] font-medium mb-2">
                ✅ 100% Implementado y Listo para Producción
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Todos los componentes siguen los principios de Clean
                Architecture, Atomic Design y Design Tokens
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
