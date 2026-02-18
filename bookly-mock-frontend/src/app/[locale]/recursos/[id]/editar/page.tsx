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
  AvailabilityRules,
  Category,
  Resource,
  ResourceType,
  UpdateResourceDto,
} from "@/types/entities/resource";
import { Plus, Tag, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";

/**
 * Página de Editar Recurso - Bookly
 *
 * Formulario completo para editar un recurso existente
 */

interface CategoryCollectionPayload {
  items?: Category[];
  categories?: Category[];
}

interface ProgramCollectionPayload {
  items?: ProgramApiItem[];
}

interface ProgramApiItem {
  id?: string;
  _id?: string;
  code?: string;
  name?: string;
  description?: string;
  faculty?: string;
  department?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ResourceCollectionPayload {
  items?: Resource[];
  resources?: Resource[];
}

interface CharacteristicTag {
  name: string;
  normalizedName: string;
  isNew: boolean;
}

interface UpdateResourceRequestPayload
  extends Omit<UpdateResourceDto, "availabilityRules"> {
  availabilityRules?: {
    requiresApproval?: boolean;
    maxAdvanceBookingDays?: number;
    minBookingDurationMinutes?: number;
    maxBookingDurationMinutes?: number;
    allowRecurring?: boolean;
  };
}

const DEFAULT_CHARACTERISTICS = [
  "Proyector",
  "Aire acondicionado",
  "Tablero/Pizarra",
  "Computadores",
  "Sistema de sonido",
  "Videoconferencia",
  "Acceso para silla de ruedas",
  "Iluminación especial",
];

const BOOLEAN_ATTRIBUTE_TO_CHARACTERISTIC: Record<string, string> = {
  hasProjector: "Proyector",
  hasAirConditioning: "Aire acondicionado",
  hasWhiteboard: "Tablero/Pizarra",
  hasComputers: "Computadores",
};

function normalizeCharacteristicName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function toCharacteristicKey(value: string): string {
  return normalizeCharacteristicName(value).toLowerCase();
}

function toCharacteristicTestId(value: string): string {
  return toCharacteristicKey(value).replace(/[^a-z0-9]+/g, "-");
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function extractResources(
  data: ResourceCollectionPayload | Resource[] | undefined,
): Resource[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data?.resources && Array.isArray(data.resources)) {
    return data.resources;
  }

  if (data?.items && Array.isArray(data.items)) {
    return data.items;
  }

  return [];
}

function extractCharacteristicNamesFromAttributes(
  attributes: Record<string, unknown> | undefined,
): string[] {
  const characteristicCandidates: string[] = [];

  const characteristicsValue = attributes?.characteristics;
  if (isStringArray(characteristicsValue)) {
    characteristicCandidates.push(...characteristicsValue);
  }

  const featuresValue = attributes?.features;
  if (isStringArray(featuresValue)) {
    characteristicCandidates.push(...featuresValue);
  }

  return Array.from(
    new Map(
      characteristicCandidates
        .map((name) => normalizeCharacteristicName(name))
        .filter(Boolean)
        .map((name) => [toCharacteristicKey(name), name]),
    ).values(),
  );
}

function mapBooleanAttributesToCharacteristics(
  attributes: Record<string, unknown> | undefined,
): string[] {
  if (!attributes) {
    return [];
  }

  return Object.entries(BOOLEAN_ATTRIBUTE_TO_CHARACTERISTIC)
    .filter(([attribute]) => attributes[attribute] === true)
    .map(([, characteristic]) => characteristic);
}

function buildCharacteristicsCatalog(resources: Resource[]): string[] {
  const names = new Map<string, string>();

  DEFAULT_CHARACTERISTICS.forEach((name) => {
    const normalized = normalizeCharacteristicName(name);
    names.set(toCharacteristicKey(normalized), normalized);
  });

  resources.forEach((resource) => {
    const resourceAttributes = resource.attributes as Record<string, unknown>;

    extractCharacteristicNamesFromAttributes(resourceAttributes).forEach(
      (name) => {
        names.set(toCharacteristicKey(name), normalizeCharacteristicName(name));
      },
    );

    mapBooleanAttributesToCharacteristics(resourceAttributes).forEach(
      (name) => {
        names.set(toCharacteristicKey(name), normalizeCharacteristicName(name));
      },
    );
  });

  return Array.from(names.values()).sort((a, b) => a.localeCompare(b));
}

function normalizeProgram(
  program: ProgramApiItem,
  index: number,
): AcademicProgram | null {
  const rawId =
    program.id ??
    (typeof program._id === "string" ? program._id : undefined) ??
    program.code;

  if (!rawId) {
    return null;
  }

  const programId = String(rawId);
  const programCode = normalizeCharacteristicName(program.code ?? programId);

  return {
    id: programId,
    code: programCode,
    name: normalizeCharacteristicName(program.name ?? `Programa ${index + 1}`),
    description: program.description,
    faculty: normalizeCharacteristicName(program.faculty ?? "Sin facultad"),
    department: program.department,
    isActive: program.isActive ?? true,
    createdAt: program.createdAt ?? "",
    updatedAt: program.updatedAt ?? "",
  };
}

function extractCategories(
  data: CategoryCollectionPayload | Category[] | undefined,
): Category[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data?.categories && Array.isArray(data.categories)) {
    return data.categories;
  }

  if (data?.items && Array.isArray(data.items)) {
    return data.items;
  }

  return [];
}

function extractPrograms(
  data: ProgramCollectionPayload | AcademicProgram[] | undefined,
): AcademicProgram[] {
  const rawPrograms = Array.isArray(data)
    ? (data as ProgramApiItem[])
    : (data?.items ?? []);

  const seenProgramIds = new Set<string>();

  return rawPrograms
    .map((program, index) => normalizeProgram(program, index))
    .filter((program): program is AcademicProgram => Boolean(program))
    .filter((program) => {
      if (seenProgramIds.has(program.id)) {
        return false;
      }

      seenProgramIds.add(program.id);
      return true;
    });
}

export default function EditResourcePage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params.id as string;
  const locale = (params.locale as string) || "es";

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
  const [characteristicsCatalog, setCharacteristicsCatalog] = React.useState<
    string[]
  >(DEFAULT_CHARACTERISTICS);
  const [selectedCharacteristics, setSelectedCharacteristics] = React.useState<
    CharacteristicTag[]
  >([]);
  const [characteristicQuery, setCharacteristicQuery] = React.useState("");

  const selectedCharacteristicKeys = React.useMemo(
    () => new Set(selectedCharacteristics.map((item) => item.normalizedName)),
    [selectedCharacteristics],
  );

  const normalizedCharacteristicQuery =
    normalizeCharacteristicName(characteristicQuery);

  const filteredCharacteristics = React.useMemo(() => {
    const normalizedQuery = normalizedCharacteristicQuery.toLowerCase();

    const options = characteristicsCatalog.filter((name) => {
      const normalizedName = toCharacteristicKey(name);

      if (selectedCharacteristicKeys.has(normalizedName)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return normalizedName.includes(normalizedQuery);
    });

    return normalizedQuery ? options : options.slice(0, 8);
  }, [
    characteristicsCatalog,
    normalizedCharacteristicQuery,
    selectedCharacteristicKeys,
  ]);

  const canCreateCharacteristic = React.useMemo(() => {
    if (!normalizedCharacteristicQuery) {
      return false;
    }

    const queryKey = toCharacteristicKey(normalizedCharacteristicQuery);
    const catalogSet = new Set(characteristicsCatalog.map(toCharacteristicKey));

    return (
      !catalogSet.has(queryKey) && !selectedCharacteristicKeys.has(queryKey)
    );
  }, [
    characteristicsCatalog,
    normalizedCharacteristicQuery,
    selectedCharacteristicKeys,
  ]);

  // Cargar recurso, categorías y programas
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          resourceResponse,
          categoriesResponse,
          programsResponse,
          resourcesResponse,
        ] = await Promise.all([
          httpClient.get<Resource>(`resources/${resourceId}`),
          httpClient.get<CategoryCollectionPayload | Category[]>("categories"),
          httpClient.get<ProgramCollectionPayload | AcademicProgram[]>(
            "programs",
          ),
          httpClient.get<ResourceCollectionPayload | Resource[]>("resources", {
            params: { page: 1, limit: 500 },
          }),
        ]);

        if (resourceResponse.success && resourceResponse.data) {
          const resourceData = resourceResponse.data;
          setResource(resourceData);
          setSelectedProgramIds(
            new Set((resourceData.programIds || []).map((id) => String(id))),
          );

          const resourceAttributes =
            (resourceData.attributes as Record<string, unknown>) || {};

          const persistedCharacteristicNames = Array.from(
            new Map(
              [
                ...mapBooleanAttributesToCharacteristics(resourceAttributes),
                ...extractCharacteristicNamesFromAttributes(resourceAttributes),
              ]
                .map((name) => normalizeCharacteristicName(name))
                .filter(Boolean)
                .map((name) => [toCharacteristicKey(name), name]),
            ).values(),
          );

          setSelectedCharacteristics(
            persistedCharacteristicNames.map((name) => ({
              name,
              normalizedName: toCharacteristicKey(name),
              isNew: false,
            })),
          );

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
            attributes: resourceAttributes,
            programIds: resourceData.programIds || [],
            availabilityRules: resourceData.availabilityRules,
          });
        }

        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(extractCategories(categoriesResponse.data));
        }

        if (programsResponse.success && programsResponse.data) {
          setAllPrograms(extractPrograms(programsResponse.data));
        }

        if (resourcesResponse.success && resourcesResponse.data) {
          setCharacteristicsCatalog(
            buildCharacteristicsCatalog(
              extractResources(resourcesResponse.data),
            ),
          );
        }
      } catch (err) {
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
    if (!programId) {
      return;
    }

    setSelectedProgramIds((previousSelection) => {
      const newSelection = new Set(previousSelection);

      if (newSelection.has(programId)) {
        newSelection.delete(programId);
      } else {
        newSelection.add(programId);
      }

      return newSelection;
    });
  };

  const handleClearProgramSelection = () => {
    setSelectedProgramIds(new Set());
  };

  const handleSelectExistingCharacteristic = (name: string) => {
    const normalizedName = normalizeCharacteristicName(name);
    const normalizedKey = toCharacteristicKey(normalizedName);

    if (!normalizedName || selectedCharacteristicKeys.has(normalizedKey)) {
      return;
    }

    setSelectedCharacteristics((prev) => [
      ...prev,
      {
        name: normalizedName,
        normalizedName: normalizedKey,
        isNew: false,
      },
    ]);
    setCharacteristicQuery("");
  };

  const handleCreateCharacteristic = () => {
    if (!canCreateCharacteristic) {
      return;
    }

    const normalizedName = normalizeCharacteristicName(characteristicQuery);
    const normalizedKey = toCharacteristicKey(normalizedName);

    setSelectedCharacteristics((prev) => [
      ...prev,
      {
        name: normalizedName,
        normalizedName: normalizedKey,
        isNew: true,
      },
    ]);
    setCharacteristicQuery("");
  };

  const handleRemoveCharacteristic = (normalizedName: string) => {
    setSelectedCharacteristics((prev) =>
      prev.filter((item) => item.normalizedName !== normalizedName),
    );
  };

  const handleInputChange = <K extends keyof UpdateResourceDto>(
    field: K,
    value: UpdateResourceDto[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvailabilityRuleChange = (
    field: keyof AvailabilityRules,
    value: AvailabilityRules[keyof AvailabilityRules],
  ) => {
    const defaultAvailabilityRules: AvailabilityRules = {
      requiresApproval: false,
      maxAdvanceBookingDays: 30,
      minBookingDurationMinutes: 60,
      maxBookingDurationMinutes: 240,
      bufferTimeBetweenReservationsMinutes: 15,
      allowRecurring: true,
    };

    setFormData((prev) => ({
      ...prev,
      availabilityRules: {
        ...(prev.availabilityRules ?? defaultAvailabilityRules),
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
      const characteristicNames = Array.from(
        new Map(
          selectedCharacteristics
            .map((item) => normalizeCharacteristicName(item.name))
            .filter(Boolean)
            .map((name) => [toCharacteristicKey(name), name]),
        ).values(),
      );

      const characteristicKeySet = new Set(
        characteristicNames.map((name) => toCharacteristicKey(name)),
      );

      const attributesPayload: Record<string, unknown> = {
        ...(formData.attributes || {}),
        characteristics: characteristicNames,
        features: characteristicNames,
      };

      Object.entries(BOOLEAN_ATTRIBUTE_TO_CHARACTERISTIC).forEach(
        ([attribute, characteristicName]) => {
          attributesPayload[attribute] = characteristicKeySet.has(
            toCharacteristicKey(characteristicName),
          );
        },
      );

      const dataToSend: UpdateResourceRequestPayload = {
        ...formData,
        attributes: attributesPayload,
        programIds: Array.from(selectedProgramIds).filter(Boolean),
        availabilityRules: formData.availabilityRules
          ? {
              requiresApproval: formData.availabilityRules.requiresApproval,
              maxAdvanceBookingDays:
                formData.availabilityRules.maxAdvanceBookingDays,
              minBookingDurationMinutes:
                formData.availabilityRules.minBookingDurationMinutes,
              maxBookingDurationMinutes:
                formData.availabilityRules.maxBookingDurationMinutes,
              allowRecurring: formData.availabilityRules.allowRecurring,
            }
          : undefined,
      };

      const response = await httpClient.patch(
        `resources/${resourceId}`,
        dataToSend,
      );

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/${locale}/recursos/${resourceId}`);
        }, 2000);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al actualizar el recurso";
      setError(message);
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
            onClick={() => router.push(`/${locale}/recursos/${resourceId}`)}
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
        <form onSubmit={handleSubmit} data-testid="resource-edit-form">
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
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
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
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
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
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
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
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
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
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
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
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
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
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
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
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
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
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
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
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Seleccionadas ({selectedCharacteristics.length})
                    </p>
                    {selectedCharacteristics.length === 0 ? (
                      <p className="text-sm text-[var(--color-text-tertiary)] p-4 rounded-lg border border-dashed border-[var(--color-border-subtle)]">
                        No hay características seleccionadas.
                      </p>
                    ) : (
                      <div
                        className="flex flex-wrap gap-2"
                        data-testid="resource-characteristics-selected"
                      >
                        {selectedCharacteristics.map((characteristic) => (
                          <span
                            key={characteristic.normalizedName}
                            data-testid={`resource-characteristic-chip-${characteristic.isNew ? "new-" : ""}${toCharacteristicTestId(characteristic.name)}`}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
                              characteristic.isNew
                                ? "border-[var(--color-border-focus)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                                : "border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                            }`}
                          >
                            {characteristic.isNew ? (
                              <Plus className="h-3.5 w-3.5" />
                            ) : (
                              <Tag className="h-3.5 w-3.5" />
                            )}
                            <span>{characteristic.name}</span>
                            {characteristic.isNew && (
                              <span className="rounded-full bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 text-[10px] font-medium">
                                Nueva
                              </span>
                            )}
                            <button
                              type="button"
                              data-testid={`resource-characteristic-remove-${toCharacteristicTestId(characteristic.name)}`}
                              className="rounded p-0.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                              onClick={() =>
                                handleRemoveCharacteristic(
                                  characteristic.normalizedName,
                                )
                              }
                              aria-label={`Eliminar característica ${characteristic.name}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      data-testid="resource-characteristics-search-input"
                      placeholder="Buscar o crear característica..."
                      value={characteristicQuery}
                      onChange={(e) => setCharacteristicQuery(e.target.value)}
                    />

                    <div
                      className="max-h-[280px] overflow-y-auto space-y-2 rounded-lg border border-[var(--color-border-subtle)] p-2"
                      data-testid="resource-characteristics-options"
                    >
                      {filteredCharacteristics.map((name) => (
                        <button
                          key={name}
                          type="button"
                          data-testid={`resource-characteristic-option-${toCharacteristicTestId(name)}`}
                          onClick={() =>
                            handleSelectExistingCharacteristic(name)
                          }
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text-primary)]"
                        >
                          {name}
                        </button>
                      ))}

                      {canCreateCharacteristic && (
                        <button
                          type="button"
                          data-testid="resource-characteristic-create-option"
                          onClick={handleCreateCharacteristic}
                          className="w-full text-left px-3 py-2 rounded-md border border-[var(--color-border-focus)] bg-[var(--color-bg-primary)] text-sm text-[var(--color-text-primary)]"
                        >
                          Crear &quot;{normalizedCharacteristicQuery}&quot;
                        </button>
                      )}

                      {!canCreateCharacteristic &&
                        filteredCharacteristics.length === 0 && (
                          <p className="px-3 py-2 text-sm text-[var(--color-text-tertiary)]">
                            No hay coincidencias disponibles.
                          </p>
                        )}
                    </div>

                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      Las características nuevas se crean solo al guardar el
                      recurso.
                    </p>
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
                            e.target.checked,
                          )
                        }
                        className="rounded w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="text-foreground text-sm font-medium">
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
                            e.target.checked,
                          )
                        }
                        className="rounded w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="text-foreground text-sm font-medium">
                          Permitir Reservas Recurrentes
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
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
                            parseInt(e.target.value),
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
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
                            parseInt(e.target.value),
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
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
                            parseInt(e.target.value),
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
                    <div className="flex items-center justify-between">
                      <p
                        className="text-sm text-[var(--color-text-tertiary)]"
                        data-testid="resource-program-selected-count"
                      >
                        {selectedProgramIds.size} programa(s) seleccionado(s)
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearProgramSelection}
                        data-testid="resource-program-clear-selection"
                      >
                        Limpiar selección
                      </Button>
                    </div>

                    <Input
                      data-testid="resource-program-search-input"
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
                            : true,
                        )
                        .map((program) => (
                          <label
                            key={program.id}
                            data-testid={`resource-program-option-${program.id}`}
                            className="flex items-center justify-between p-4 bg-[var(--color-bg-primary)]/50 rounded-lg cursor-pointer hover:bg-[var(--color-bg-primary)]"
                          >
                            <div className="flex items-center gap-3">
                              <input
                                data-testid={`resource-program-checkbox-${program.id}`}
                                type="checkbox"
                                checked={selectedProgramIds.has(program.id)}
                                onChange={() => handleToggleProgram(program.id)}
                                className="w-5 h-5 rounded border-[var(--color-border-strong)] bg-[var(--color-bg-tertiary)] text-brand-primary-500 focus:ring-brand-primary-500 focus:ring-offset-gray-900"
                              />
                              <div>
                                <p className="font-medium text-foreground">
                                  {program.name}
                                </p>
                                <p className="text-sm text-[var(--color-text-tertiary)]">
                                  {program.code} -{" "}
                                  {program.faculty || "Sin facultad"}
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
                      <p
                        className="text-sm text-[var(--color-text-tertiary)]"
                        data-testid="resource-program-selected-count-footer"
                      >
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
              onClick={() => router.push(`/${locale}/recursos/${resourceId}`)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              data-testid="resource-edit-save-btn"
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
