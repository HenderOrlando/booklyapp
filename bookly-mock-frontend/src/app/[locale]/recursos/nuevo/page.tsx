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
  AvailabilityRules,
  Category,
  CreateResourceDto,
  ResourceType,
} from "@/types/entities/resource";
import { Plus, Tag, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";

/**
 * Página de Crear Recurso - Bookly
 *
 * Formulario completo para crear un nuevo recurso en el sistema
 */

interface CategoryCollectionPayload {
  items?: Category[];
  categories?: Category[];
}

interface ProgramCollectionPayload {
  items?: AcademicProgram[];
}

interface ResourceCharacteristicOption {
  id?: string;
  _id?: string;
  code?: string;
  name?: string;
  icon?: string;
  isActive?: boolean;
}

interface ResourceCharacteristicsCollectionPayload {
  items?: ResourceCharacteristicOption[];
}

interface CharacteristicTag {
  id?: string;
  name: string;
  normalizedName: string;
  isNew: boolean;
}

interface CreateResourceRequestPayload
  extends Omit<CreateResourceDto, "availabilityRules"> {
  availabilityRules?: {
    requiresApproval?: boolean;
    maxAdvanceBookingDays?: number;
    minBookingDurationMinutes?: number;
    maxBookingDurationMinutes?: number;
    allowRecurring?: boolean;
  };
}

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

function extractCharacteristicOptions(
  data:
    | ResourceCharacteristicsCollectionPayload
    | ResourceCharacteristicOption[]
    | undefined,
): ResourceCharacteristicOption[] {
  const rawItems = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : [];

  const normalized: ResourceCharacteristicOption[] = [];

  rawItems.forEach((item) => {
    const id = String(item.id ?? item._id ?? "").trim();
    const name = normalizeCharacteristicName(String(item.name ?? ""));

    if (!id || !name) {
      return;
    }

    normalized.push({
      ...item,
      id,
      name,
    });
  });

  return Array.from(
    new Map(normalized.map((item) => [item.id, item])).values(),
  ).sort((a, b) =>
    String(a.name ?? "").localeCompare(String(b.name ?? ""), "es"),
  );
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
  const rawItems = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : [];

  const normalized: AcademicProgram[] = [];

  rawItems.forEach((item) => {
    const id = String(item.id ?? item._id ?? item.code ?? "").trim();
    if (!id) return;

    normalized.push({
      ...item,
      id,
    });
  });

  // Deduplicar por ID
  return Array.from(new Map(normalized.map((p) => [p.id, p])).values()).sort(
    (a, b) => a.name.localeCompare(b.name, "es"),
  );
}

export default function CreateResourcePage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "es";
  const [loading, setLoading] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [programs, setPrograms] = React.useState<AcademicProgram[]>([]);
  const [selectedPrograms, setSelectedPrograms] = React.useState<string[]>([]);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const [characteristicsCatalog, setCharacteristicsCatalog] = React.useState<
    ResourceCharacteristicOption[]
  >([]);
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

    const options = characteristicsCatalog.filter((characteristic) => {
      const normalizedName = toCharacteristicKey(String(characteristic.name));

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
    const catalogSet = new Set(
      characteristicsCatalog.map((item) =>
        toCharacteristicKey(String(item.name)),
      ),
    );

    return (
      !catalogSet.has(queryKey) && !selectedCharacteristicKeys.has(queryKey)
    );
  }, [
    characteristicsCatalog,
    normalizedCharacteristicQuery,
    selectedCharacteristicKeys,
  ]);

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
  // (Eliminados: hasProjector, hasAirConditioning, hasWhiteboard, hasComputers ya que se manejan vía selectedCharacteristics)

  // Cargar categorías y programas
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar categorías
        const categoriesResponse = await httpClient.get<
          CategoryCollectionPayload | Category[]
        >("categories");
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(extractCategories(categoriesResponse.data));
        }

        // Cargar programas académicos
        const programsResponse = await httpClient.get<
          ProgramCollectionPayload | AcademicProgram[]
        >("programs");
        if (programsResponse.success && programsResponse.data) {
          setPrograms(extractPrograms(programsResponse.data));
        }

        // Cargar catálogo de características
        const characteristicsResponse = await httpClient.get<
          | ResourceCharacteristicsCollectionPayload
          | ResourceCharacteristicOption[]
        >("resources/characteristics");

        if (characteristicsResponse.success && characteristicsResponse.data) {
          setCharacteristicsCatalog(
            extractCharacteristicOptions(characteristicsResponse.data),
          );
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };

    fetchData();
  }, []);

  const handleClearProgramSelection = () => {
    setSelectedPrograms([]);
    setFormData((prev) => ({ ...prev, programIds: [] }));
  };

  const handleSelectExistingCharacteristic = (
    characteristic: ResourceCharacteristicOption,
  ) => {
    const normalizedName = normalizeCharacteristicName(
      String(characteristic.name ?? ""),
    );
    const normalizedKey = toCharacteristicKey(normalizedName);

    if (!normalizedName || selectedCharacteristicKeys.has(normalizedKey)) {
      return;
    }

    setSelectedCharacteristics((prev) => [
      ...prev,
      {
        id: characteristic.id ? String(characteristic.id) : undefined,
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

  const handleInputChange = <K extends keyof CreateResourceDto>(
    field: K,
    value: CreateResourceDto[K],
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

      const characteristicValues = selectedCharacteristics.map((item) =>
        item.id
          ? item.id
          : {
              name: item.name,
            },
      );

      const attributesPayload: Record<string, unknown> = {
        ...(formData.attributes || {}),
        characteristics: characteristicValues,
        features: characteristicNames,
      };

      // Inyectar atributos requeridos por el backend según el tipo de recurso para evitar 400 Bad Request
      const effectiveType = formData.type;

      if (effectiveType === ResourceType.MULTIMEDIA_EQUIPMENT) {
        if (!attributesPayload.equipmentType) {
          attributesPayload.equipmentType = "laptop"; // Valor por defecto seguro
        }
        if (attributesPayload.isPortable === undefined) {
          attributesPayload.isPortable = true; // Valor por defecto seguro
        }
      } else if (effectiveType === ResourceType.CLASSROOM) {
        if (attributesPayload.capacity === undefined) {
          attributesPayload.capacity = formData.capacity || 1;
        }
      } else if (effectiveType === ResourceType.LABORATORY) {
        if (!attributesPayload.labType) {
          attributesPayload.labType = "computer";
        }
        if (attributesPayload.capacity === undefined) {
          attributesPayload.capacity = formData.capacity || 1;
        }
      } else if (effectiveType === ResourceType.SPORTS_FACILITY) {
        if (!attributesPayload.sportType) {
          attributesPayload.sportType = "soccer";
        }
        if (attributesPayload.isIndoor === undefined) {
          attributesPayload.isIndoor = true;
        }
      } else if (effectiveType === ResourceType.MEETING_ROOM) {
        if (attributesPayload.capacity === undefined) {
          attributesPayload.capacity = formData.capacity || 2;
        }
      } else if (effectiveType === ResourceType.AUDITORIUM) {
        if (attributesPayload.hasSoundSystem === undefined) {
          attributesPayload.hasSoundSystem = true;
        }
      }

      Object.entries(BOOLEAN_ATTRIBUTE_TO_CHARACTERISTIC).forEach(
        ([attribute, characteristicName]) => {
          attributesPayload[attribute] = characteristicKeySet.has(
            toCharacteristicKey(characteristicName),
          );
        },
      );

      const dataToSend: CreateResourceRequestPayload = {
        ...formData,
        attributes: attributesPayload,
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

      const response = await httpClient.post("resources", dataToSend);

      if (response.success) {
        setSuccess(true);
        // Redirigir al listado después de 2 segundos
        setTimeout(() => {
          router.push(`/${locale}/recursos`);
        }, 2000);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al crear el recurso";
      setError(message);
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
          <Button
            variant="outline"
            onClick={() => router.push(`/${locale}/recursos`)}
          >
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
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        Código <span className="text-state-error-500">*</span>
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
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        Nombre <span className="text-state-error-500">*</span>
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
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Descripción{" "}
                      <span className="text-state-error-500">*</span>
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
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        Tipo <span className="text-state-error-500">*</span>
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
                          <SelectItem value={ResourceType.MULTIMEDIA_EQUIPMENT}>
                            Equipo Multimedial
                          </SelectItem>
                          <SelectItem value={ResourceType.SPORTS_FACILITY}>
                            Instalación Deportiva
                          </SelectItem>
                          <SelectItem value={ResourceType.MEETING_ROOM}>
                            Sala de Juntas
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
                        Categoría{" "}
                        <span className="text-state-error-500">*</span>
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
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Capacidad <span className="text-state-error-500">*</span>
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
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                      Ubicación <span className="text-state-error-500">*</span>
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
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
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
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
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
                      {filteredCharacteristics.map((characteristic) => (
                        <button
                          key={String(characteristic.id)}
                          type="button"
                          data-testid={`resource-characteristic-option-${toCharacteristicTestId(String(characteristic.name))}`}
                          onClick={() =>
                            handleSelectExistingCharacteristic(characteristic)
                          }
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text-primary)]"
                        >
                          {characteristic.name}
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
                  <div className="flex items-center justify-between p-4 bg-[var(--color-bg-primary)] rounded-lg">
                    <div>
                      <div className="text-sm text-[var(--color-text-tertiary)]">
                        Programas seleccionados
                      </div>
                      <div className="text-2xl font-bold text-foreground">
                        {selectedPrograms.length} / {programs.length}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearProgramSelection}
                        data-testid="resource-program-clear-selection"
                      >
                        Limpiar selección
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllPrograms}
                      >
                        {selectedPrograms.length === programs.length
                          ? "Deseleccionar Todos"
                          : "Seleccionar Todos"}
                      </Button>
                    </div>
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
                      <div className="text-center py-8 text-[var(--color-text-tertiary)]">
                        No hay programas académicos disponibles
                      </div>
                    ) : (
                      <>
                        {programs.map((program) => (
                          <label
                            key={program.id}
                            className="flex items-start gap-3 p-4 bg-[var(--color-bg-primary)] rounded-lg cursor-pointer hover:bg-[var(--color-bg-secondary)] transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPrograms.includes(program.id)}
                              onChange={() => handleProgramToggle(program.id)}
                              className="rounded w-5 h-5 mt-0.5 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-foreground font-medium">
                                  {program.name}
                                </span>
                                <span className="text-xs text-[var(--color-text-tertiary)] font-mono">
                                  {program.code}
                                </span>
                              </div>
                              {program.description && (
                                <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
                                  {program.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-[var(--color-text-tertiary)]">
                                <span>📚 {program.faculty}</span>
                                {program.department && (
                                  <span>🏛️ {program.department}</span>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Programas seleccionados */}
                  {selectedPrograms.length > 0 && (
                    <div className="p-4 bg-brand-primary-900/20 border border-blue-800 rounded-lg">
                      <div className="text-sm font-medium text-brand-primary-300 mb-2">
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
                              className="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary-900 text-blue-200 rounded-full text-xs"
                            >
                              {program.code}
                              <button
                                type="button"
                                onClick={() => handleProgramToggle(programId)}
                                className="hover:text-state-error-300 ml-1"
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
                        <div className="text-xs text-[var(--color-text-tertiary)]">
                          Las reservas deben ser aprobadas por un administrador
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
                        <div className="text-xs text-[var(--color-text-tertiary)]">
                          Los usuarios pueden crear reservas repetitivas
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
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
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
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
                    <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
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
              onClick={() => router.push(`/${locale}/recursos`)}
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
