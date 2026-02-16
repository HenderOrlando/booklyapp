"use client";

import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/atoms/Tabs/Tabs";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { MainLayout } from "@/components/templates/MainLayout";
import { httpClient } from "@/infrastructure/http";
import {
  AcademicProgram,
  Category,
  CreateResourceDto,
  ResourceType,
} from "@/types/entities/resource";
import { useRouter } from "next/navigation";
import * as React from "react";

/**
 * Página de Crear Recurso - Bookly
 *
 * Formulario completo para crear un nuevo recurso en el sistema
 */

export default function CreateResourcePage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [programs, setPrograms] = React.useState<AcademicProgram[]>([]);
  const [selectedPrograms, setSelectedPrograms] = React.useState<string[]>([]);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  // Estados del formulario
  const [formData, setFormData] = React.useState<CreateResourceDto>({
    code: "",
    name: "",
    description: "",
    type: ResourceType.CLASSROOM,
    categoryId: "",
    capacity: 1,
    location: "",
    floor: "",
    building: "",
    attributes: {},
    programIds: [],
    availabilityRules: {
      requiresApproval: false,
      maxAdvanceBookingDays: 30,
      minBookingDurationMinutes: 60,
      maxBookingDurationMinutes: 240,
      bufferTimeBetweenReservationsMinutes: 15,
      allowRecurring: true,
    },
  });

  // Atributos dinámicos según tipo de recurso
  const [hasProjector, setHasProjector] = React.useState(false);
  const [hasAirConditioning, setHasAirConditioning] = React.useState(false);
  const [hasWhiteboard, setHasWhiteboard] = React.useState(false);
  const [hasComputers, setHasComputers] = React.useState(false);

  // Cargar categorías y programas
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar categorías
        const categoriesResponse = await httpClient.get("categories");
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data.items || []);
        }

        // Cargar programas académicos
        const programsResponse = await httpClient.get("programs");
        if (programsResponse.success && programsResponse.data) {
          setPrograms(programsResponse.data.items || []);
        }
      } catch (err: any) {
        console.error("Error al cargar datos:", err);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field: keyof CreateResourceDto, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAttributeChange = (attribute: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attribute]: value,
      },
    }));
  };

  const handleAvailabilityRuleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      availabilityRules: {
        ...prev.availabilityRules!,
        [field]: value,
      },
    }));
  };

  const handleProgramToggle = (programId: string) => {
    setSelectedPrograms((prev) => {
      const isSelected = prev.includes(programId);
      const newSelection = isSelected
        ? prev.filter((id) => id !== programId)
        : [...prev, programId];

      // Actualizar formData.programIds
      setFormData((prevData) => ({
        ...prevData,
        programIds: newSelection,
      }));

      return newSelection;
    });
  };

  const handleSelectAllPrograms = () => {
    if (selectedPrograms.length === programs.length) {
      // Deseleccionar todos
      setSelectedPrograms([]);
      setFormData((prev) => ({ ...prev, programIds: [] }));
    } else {
      // Seleccionar todos
      const allIds = programs.map((p) => p.id);
      setSelectedPrograms(allIds);
      setFormData((prev) => ({ ...prev, programIds: allIds }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Validaciones básicas
      if (!formData.code || !formData.name || !formData.categoryId) {
        throw new Error("Por favor completa todos los campos obligatorios");
      }

      // Construir atributos según tipo
      const attributes: Record<string, any> = {
        hasProjector,
        hasAirConditioning,
        hasWhiteboard,
        hasComputers,
      };

      const dataToSend: CreateResourceDto = {
        ...formData,
        attributes,
      };

      const response = await httpClient.post("resources", dataToSend);

      if (response.success) {
        setSuccess(true);
        // Redirigir al listado después de 2 segundos
        setTimeout(() => {
          router.push("/recursos");
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Error al crear el recurso");
    } finally {
      setLoading(false);
    }
  };

  const header = <AppHeader title="Crear Nuevo Recurso" />;
  const sidebar = <AppSidebar />;

  return (
    <MainLayout header={header} sidebar={sidebar}>
      <div className="max-w-4xl mx-auto space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
              Crear Nuevo Recurso
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-2">
              Completa el formulario para agregar un nuevo recurso al sistema
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/recursos")}>
            Cancelar
          </Button>
        </div>

        {/* Alertas */}
        {error && <Alert variant="error">{error}</Alert>}
        {success && (
          <Alert variant="success">
            ¡Recurso creado exitosamente! Redirigiendo...
          </Alert>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basica" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="basica">Información Básica</TabsTrigger>
              <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
              <TabsTrigger value="caracteristicas">Características</TabsTrigger>
              <TabsTrigger value="programas">Programas</TabsTrigger>
              <TabsTrigger value="disponibilidad">Disponibilidad</TabsTrigger>
            </TabsList>

            {/* Tab 1: Información Básica */}
            <TabsContent value="basica">
              <Card>
                <CardHeader>
                  <CardTitle>Información Básica</CardTitle>
                  <CardDescription>
                    Datos principales del recurso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Código <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Ej: AULA-101"
                        value={formData.code}
                        onChange={(e) =>
                          handleInputChange("code", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Ej: Aula 101"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Describe el recurso..."
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Tipo <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          handleInputChange("type", value as ResourceType)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ResourceType.CLASSROOM}>
                            Aula/Salón
                          </SelectItem>
                          <SelectItem value={ResourceType.LABORATORY}>
                            Laboratorio
                          </SelectItem>
                          <SelectItem value={ResourceType.AUDITORIUM}>
                            Auditorio
                          </SelectItem>
                          <SelectItem value={ResourceType.CONFERENCE_ROOM}>
                            Sala de Conferencias
                          </SelectItem>
                          <SelectItem value={ResourceType.SPORTS_FIELD}>
                            Cancha Deportiva
                          </SelectItem>
                          <SelectItem value={ResourceType.EQUIPMENT}>
                            Equipo
                          </SelectItem>
                          <SelectItem value={ResourceType.VEHICLE}>
                            Vehículo
                          </SelectItem>
                          <SelectItem value={ResourceType.OTHER}>
                            Otro
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Categoría <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) =>
                          handleInputChange("categoryId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Capacidad <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Ej: 40"
                      value={formData.capacity}
                      onChange={(e) =>
                        handleInputChange("capacity", parseInt(e.target.value))
                      }
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Ubicación */}
            <TabsContent value="ubicacion">
              <Card>
                <CardHeader>
                  <CardTitle>Ubicación</CardTitle>
                  <CardDescription>
                    Información sobre dónde se encuentra el recurso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Ubicación <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Ej: Edificio A - Piso 1"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Edificio
                      </label>
                      <Input
                        placeholder="Ej: Edificio A"
                        value={formData.building}
                        onChange={(e) =>
                          handleInputChange("building", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Piso
                      </label>
                      <Input
                        placeholder="Ej: Piso 2"
                        value={formData.floor}
                        onChange={(e) =>
                          handleInputChange("floor", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Características y Equipamiento */}
            <TabsContent value="caracteristicas">
              <Card>
                <CardHeader>
                  <CardTitle>Características y Equipamiento</CardTitle>
                  <CardDescription>
                    Selecciona las características del recurso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750">
                      <input
                        type="checkbox"
                        checked={hasProjector}
                        onChange={(e) => {
                          setHasProjector(e.target.checked);
                          handleAttributeChange(
                            "hasProjector",
                            e.target.checked,
                          );
                        }}
                        className="rounded w-4 h-4"
                      />
                      <span className="text-white text-sm">Proyector</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750">
                      <input
                        type="checkbox"
                        checked={hasAirConditioning}
                        onChange={(e) => {
                          setHasAirConditioning(e.target.checked);
                          handleAttributeChange(
                            "hasAirConditioning",
                            e.target.checked,
                          );
                        }}
                        className="rounded w-4 h-4"
                      />
                      <span className="text-white text-sm">
                        Aire Acondicionado
                      </span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750">
                      <input
                        type="checkbox"
                        checked={hasWhiteboard}
                        onChange={(e) => {
                          setHasWhiteboard(e.target.checked);
                          handleAttributeChange(
                            "hasWhiteboard",
                            e.target.checked,
                          );
                        }}
                        className="rounded w-4 h-4"
                      />
                      <span className="text-white text-sm">
                        Tablero/Pizarra
                      </span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750">
                      <input
                        type="checkbox"
                        checked={hasComputers}
                        onChange={(e) => {
                          setHasComputers(e.target.checked);
                          handleAttributeChange(
                            "hasComputers",
                            e.target.checked,
                          );
                        }}
                        className="rounded w-4 h-4"
                      />
                      <span className="text-white text-sm">Computadores</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Programas Académicos */}
            <TabsContent value="programas">
              <Card>
                <CardHeader>
                  <CardTitle>Programas Académicos</CardTitle>
                  <CardDescription>
                    Selecciona los programas que pueden reservar este recurso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Estadística */}
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-400">
                        Programas seleccionados
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {selectedPrograms.length} / {programs.length}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSelectAllPrograms}
                    >
                      {selectedPrograms.length === programs.length
                        ? "Deseleccionar Todos"
                        : "Seleccionar Todos"}
                    </Button>
                  </div>

                  {/* Mensaje informativo */}
                  <Alert variant="default">
                    <div className="text-sm">
                      <strong>Nota:</strong> Si no seleccionas ningún programa,
                      el recurso estará disponible para todos los programas
                      académicos.
                    </div>
                  </Alert>

                  {/* Lista de programas */}
                  <div className="space-y-3">
                    {programs.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No hay programas académicos disponibles
                      </div>
                    ) : (
                      programs.map((program) => (
                        <label
                          key={program.id}
                          className="flex items-start gap-3 p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPrograms.includes(program.id)}
                            onChange={() => handleProgramToggle(program.id)}
                            className="rounded w-5 h-5 mt-0.5 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">
                                {program.name}
                              </span>
                              <span className="text-xs text-gray-400 font-mono">
                                {program.code}
                              </span>
                            </div>
                            {program.description && (
                              <p className="text-sm text-gray-400 mt-1">
                                {program.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>📚 {program.faculty}</span>
                              {program.department && (
                                <span>🏛️ {program.department}</span>
                              )}
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>

                  {/* Programas seleccionados */}
                  {selectedPrograms.length > 0 && (
                    <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                      <div className="text-sm font-medium text-blue-300 mb-2">
                        Resumen de selección:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedPrograms.map((programId) => {
                          const program = programs.find(
                            (p) => p.id === programId,
                          );
                          return program ? (
                            <span
                              key={programId}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-xs"
                            >
                              {program.code}
                              <button
                                type="button"
                                onClick={() => handleProgramToggle(programId)}
                                className="hover:text-red-300 ml-1"
                              >
                                ×
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 5: Reglas de Disponibilidad */}
            <TabsContent value="disponibilidad">
              <Card>
                <CardHeader>
                  <CardTitle>Reglas de Disponibilidad</CardTitle>
                  <CardDescription>
                    Configura cómo se puede reservar este recurso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750">
                      <input
                        type="checkbox"
                        checked={
                          formData.availabilityRules?.requiresApproval || false
                        }
                        onChange={(e) =>
                          handleAvailabilityRuleChange(
                            "requiresApproval",
                            e.target.checked,
                          )
                        }
                        className="rounded w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">
                          Requiere Aprobación
                        </div>
                        <div className="text-xs text-gray-400">
                          Las reservas deben ser aprobadas por un administrador
                        </div>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750">
                      <input
                        type="checkbox"
                        checked={
                          formData.availabilityRules?.allowRecurring || false
                        }
                        onChange={(e) =>
                          handleAvailabilityRuleChange(
                            "allowRecurring",
                            e.target.checked,
                          )
                        }
                        className="rounded w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">
                          Permitir Reservas Recurrentes
                        </div>
                        <div className="text-xs text-gray-400">
                          Los usuarios pueden crear reservas repetitivas
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Días Máximos de Anticipación
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={
                          formData.availabilityRules?.maxAdvanceBookingDays ||
                          30
                        }
                        onChange={(e) =>
                          handleAvailabilityRuleChange(
                            "maxAdvanceBookingDays",
                            parseInt(e.target.value),
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Duración Mínima (minutos)
                      </label>
                      <Input
                        type="number"
                        min="15"
                        step="15"
                        value={
                          formData.availabilityRules
                            ?.minBookingDurationMinutes || 60
                        }
                        onChange={(e) =>
                          handleAvailabilityRuleChange(
                            "minBookingDurationMinutes",
                            parseInt(e.target.value),
                          )
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Duración Máxima (minutos)
                    </label>
                    <Input
                      type="number"
                      min="15"
                      step="15"
                      value={
                        formData.availabilityRules?.maxBookingDurationMinutes ||
                        240
                      }
                      onChange={(e) =>
                        handleAvailabilityRuleChange(
                          "maxBookingDurationMinutes",
                          parseInt(e.target.value),
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/recursos")}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Recurso"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
