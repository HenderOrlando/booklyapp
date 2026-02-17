"use client";

import { Alert } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
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
  Resource,
  ResourceType,
  UpdateResourceDto,
} from "@/types/entities/resource";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Página de Editar Recurso - Bookly
 *
 * Formulario completo para editar un recurso existente
 */

export default function EditResourcePage() {
  const t = useTranslations("resources");
  const params = useParams();
  const router = useRouter();
  const resourceId = params.id as string;

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [resource, setResource] = React.useState<Resource | null>(null);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  // Estados del formulario
  const [formData, setFormData] = React.useState<UpdateResourceDto>({});

  // Estados para programas académicos
  const [allPrograms, setAllPrograms] = React.useState<AcademicProgram[]>([]);
  const [selectedProgramIds, setSelectedProgramIds] = React.useState<
    Set<string>
  >(new Set());
  const [programFilter, setProgramFilter] = React.useState("");

  // Cargar recurso, categorías y programas
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          resourceResponse,
          categoriesResponse,
          programsResponse,
          programResourcesResponse,
        ] = await Promise.all([
          httpClient.get(`resources/${resourceId}`),
          httpClient.get("categories"),
          httpClient.get("academic-programs"),
          httpClient.get(`program-resources?programId=all`),
        ]);

        if (resourceResponse.success && resourceResponse.data) {
          const resourceData = resourceResponse.data;
          setResource(resourceData);
          setFormData({
            code: resourceData.code,
            name: resourceData.name,
            description: resourceData.description,
            type: resourceData.type,
            categoryId: resourceData.categoryId,
            capacity: resourceData.capacity,
            location: resourceData.location,
            floor: resourceData.floor,
            building: resourceData.building,
            attributes: resourceData.attributes || {},
            availabilityRules: resourceData.availabilityRules,
          });
        }

        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data.items || []);
        }

        if (programsResponse.success && programsResponse.data) {
          setAllPrograms(programsResponse.data.items || []);
        }

        // Cargar programas asociados al recurso
        if (programResourcesResponse.success && programResourcesResponse.data) {
          const associations = programResourcesResponse.data.items || [];
          const programIds = associations
            .filter((a: any) => a.resourceId === resourceId)
            .map((a: any) => a.programId);
          setSelectedProgramIds(new Set(programIds));
        }
      } catch (err: any) {
        setError("Error al cargar el recurso");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resourceId]);

  // Toggle selección de programa
  const handleToggleProgram = (programId: string) => {
    const newSelection = new Set(selectedProgramIds);
    if (newSelection.has(programId)) {
      newSelection.delete(programId);
    } else {
      newSelection.add(programId);
    }
    setSelectedProgramIds(newSelection);
  };

  const handleInputChange = (field: keyof UpdateResourceDto, value: any) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      // 1. Actualizar recurso
      const response = await httpClient.patch(
        `resources/${resourceId}`,
        formData
      );

      if (response.success) {
        // 2. Actualizar asociaciones de programas
        // Obtener asociaciones actuales
        const currentProgramsRes = await httpClient.get(
          `program-resources?programId=all`
        );
        const currentAssociations = currentProgramsRes.data?.items || [];
        const currentProgramIds = new Set<string>(
          currentAssociations
            .filter((a: any) => a.resourceId === resourceId)
            .map((a: any) => a.programId as string)
        );

        // Programas a agregar y quitar
        const toAdd = Array.from(selectedProgramIds).filter(
          (id) => !currentProgramIds.has(id)
        );
        const toRemove = Array.from(currentProgramIds).filter(
          (id) => !selectedProgramIds.has(id)
        );

        // Agregar nuevos programas
        for (const programId of toAdd) {
          await httpClient.post("program-resources", {
            programId,
            resourceId: resourceId,
            priority: 3,
          });
        }

        // Quitar programas
        for (const programId of toRemove) {
          await httpClient.delete(
            `program-resources?programId=${programId}&resourceId=${resourceId}`
          );
        }

        setSuccess(true);
        setTimeout(() => {
          router.push(`/recursos/${resourceId}`);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Error al actualizar el recurso");
    } finally {
      setSaving(false);
    }
  };

  const header = <AppHeader title="Editar Recurso" />;
  const sidebar = <AppSidebar />;

  if (loading) {
    return (
      <MainLayout header={header} sidebar={sidebar}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-500 mx-auto mb-4"></div>
            <p className="text-[var(--color-text-secondary)]">
              Cargando recurso...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!resource) {
    return (
      <MainLayout header={header} sidebar={sidebar}>
        <Alert variant="error">Recurso no encontrado</Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout header={header} sidebar={sidebar}>
      <div className="max-w-4xl mx-auto space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
              Editar Recurso
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-2">
              {resource.name} - {resource.code}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/recursos/${resourceId}`)}
          >
            Cancelar
          </Button>
        </div>

        {/* Alertas */}
        {error && <Alert variant="error">{error}</Alert>}
        {success && (
          <Alert variant="success">
            ¡Recurso actualizado exitosamente! Redirigiendo...
          </Alert>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basica" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="basica">Información Básica</TabsTrigger>
              <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
              <TabsTrigger value="caracteristicas">Características</TabsTrigger>
              <TabsTrigger value="disponibilidad">Disponibilidad</TabsTrigger>
              <TabsTrigger value="programas">
                Programas ({selectedProgramIds.size})
              </TabsTrigger>
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
                        Código
                      </label>
                      <Input
                        value={formData.code || ""}
                        onChange={(e) =>
                          handleInputChange("code", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Nombre
                      </label>
                      <Input
                        value={formData.name || ""}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Descripción
                    </label>
                    <Input
                      value={formData.description || ""}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Tipo
                      </label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          handleInputChange("type", value as ResourceType)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                        Categoría
                      </label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) =>
                          handleInputChange("categoryId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                      Capacidad
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.capacity || 1}
                      onChange={(e) =>
                        handleInputChange("capacity", parseInt(e.target.value))
                      }
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
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Ubicación
                    </label>
                    <Input
                      value={formData.location || ""}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Edificio
                      </label>
                      <Input
                        value={formData.building || ""}
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
                        value={formData.floor || ""}
                        onChange={(e) =>
                          handleInputChange("floor", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Características */}
            <TabsContent value="caracteristicas">
              <Card>
                <CardHeader>
                  <CardTitle>Características y Equipamiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "hasProjector",
                      "hasAirConditioning",
                      "hasWhiteboard",
                      "hasComputers",
                    ].map((attr) => (
                      <label
                        key={attr}
                        className="flex items-center gap-3 p-3 bg-[var(--color-bg-primary)] rounded-lg cursor-pointer hover:bg-[var(--color-bg-secondary)]"
                      >
                        <input
                          type="checkbox"
                          checked={formData.attributes?.[attr] || false}
                          onChange={(e) =>
                            handleAttributeChange(attr, e.target.checked)
                          }
                          className="rounded w-4 h-4"
                        />
                        <span className="text-white text-sm">
                          {attr === "hasProjector" && "Proyector"}
                          {attr === "hasAirConditioning" &&
                            "Aire Acondicionado"}
                          {attr === "hasWhiteboard" && "Tablero/Pizarra"}
                          {attr === "hasComputers" && "Computadores"}
                        </span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Disponibilidad */}
            <TabsContent value="disponibilidad">
              <Card>
                <CardHeader>
                  <CardTitle>Reglas de Disponibilidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="flex items-center gap-3 p-3 bg-[var(--color-bg-primary)] rounded-lg cursor-pointer hover:bg-[var(--color-bg-secondary)]">
                      <input
                        type="checkbox"
                        checked={
                          formData.availabilityRules?.requiresApproval || false
                        }
                        onChange={(e) =>
                          handleAvailabilityRuleChange(
                            "requiresApproval",
                            e.target.checked
                          )
                        }
                        className="rounded w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">
                          Requiere Aprobación
                        </div>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 p-3 bg-[var(--color-bg-primary)] rounded-lg cursor-pointer hover:bg-[var(--color-bg-secondary)]">
                      <input
                        type="checkbox"
                        checked={
                          formData.availabilityRules?.allowRecurring || false
                        }
                        onChange={(e) =>
                          handleAvailabilityRuleChange(
                            "allowRecurring",
                            e.target.checked
                          )
                        }
                        className="rounded w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">
                          Permitir Reservas Recurrentes
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Días Anticipación
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
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Duración Mín. (min)
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
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Duración Máx. (min)
                      </label>
                      <Input
                        type="number"
                        min="15"
                        step="15"
                        value={
                          formData.availabilityRules
                            ?.maxBookingDurationMinutes || 240
                        }
                        onChange={(e) =>
                          handleAvailabilityRuleChange(
                            "maxBookingDurationMinutes",
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 5: Programas Académicos */}
            <TabsContent value="programas">
              <Card>
                <CardHeader>
                  <CardTitle>Programas Académicos</CardTitle>
                  <CardDescription>
                    Selecciona los programas académicos que podrán usar este
                    recurso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      placeholder="Buscar por código o nombre..."
                      value={programFilter}
                      onChange={(e) => setProgramFilter(e.target.value)}
                    />

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {allPrograms
                        .filter((p) =>
                          programFilter
                            ? p.name
                                .toLowerCase()
                                .includes(programFilter.toLowerCase()) ||
                              p.code
                                .toLowerCase()
                                .includes(programFilter.toLowerCase())
                            : true
                        )
                        .map((program) => (
                          <label
                            key={program.id}
                            className="flex items-center justify-between p-4 bg-[var(--color-bg-primary)]/50 rounded-lg cursor-pointer hover:bg-[var(--color-bg-primary)]"
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedProgramIds.has(program.id)}
                                onChange={() => handleToggleProgram(program.id)}
                                className="w-5 h-5 rounded border-[var(--color-border-strong)] bg-[var(--color-bg-tertiary)] text-brand-primary-500 focus:ring-brand-primary-500 focus:ring-offset-gray-900"
                              />
                              <div>
                                <p className="font-medium text-white">
                                  {program.name}
                                </p>
                                <p className="text-sm text-[var(--color-text-tertiary)]">
                                  {program.code} - {program.faculty}
                                </p>
                              </div>
                            </div>
                            {selectedProgramIds.has(program.id) && (
                              <Badge variant="success">Seleccionado</Badge>
                            )}
                          </label>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-strong)]">
                      <p className="text-sm text-[var(--color-text-tertiary)]">
                        {selectedProgramIds.size} programa(s) seleccionado(s)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/recursos/${resourceId}`)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
