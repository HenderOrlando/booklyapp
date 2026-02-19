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
import {
  useAcademicPrograms,
  useResourceCategories,
  useResourceCharacteristics,
  useResourceTypes,
} from "@/hooks/useResources";
import { useRouter } from "@/i18n/navigation";
import { httpClient } from "@/infrastructure/http";
import { extractArray } from "@/lib/data-utils";
import { cn } from "@/lib/utils";
import {
  AcademicProgram,
  AvailabilityRules,
  Category,
  Resource,
  ResourceType,
  UpdateResourceDto,
} from "@/types/entities/resource";
import { Plus, Search, Tag, X } from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";

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
    const rawItem = item as Record<string, unknown>;
    const id = String(rawItem.id ?? rawItem._id ?? rawItem.code ?? "").trim();
    if (!id) return;

    normalized.push({
      ...item,
      id,
    } as AcademicProgram);
  });

  return Array.from(new Map(normalized.map((p) => [p.id, p])).values()).sort(
    (a, b) => a.name.localeCompare(b.name, "es"),
  );
}

interface CharacteristicValue {
  id?: string;
  name?: string;
}

function extractCharacteristicNamesFromAttributes(
  attributes: Record<string, unknown> | undefined,
): string[] {
  if (!attributes) return [];
  const characteristicCandidates: string[] = [];

  const characteristicsValue = attributes?.characteristics;
  if (Array.isArray(characteristicsValue)) {
    characteristicsValue.forEach((item) => {
      if (typeof item === "string") characteristicCandidates.push(item);
      else if (
        typeof item === "object" &&
        item !== null &&
        (item as CharacteristicValue).name
      )
        characteristicCandidates.push(
          (item as CharacteristicValue).name as string,
        );
    });
  }

  const featuresValue = attributes?.features;
  if (Array.isArray(featuresValue)) {
    featuresValue.forEach((item) => {
      if (typeof item === "string") characteristicCandidates.push(item);
    });
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

function resolveSelectedCharacteristics(
  attributes: Record<string, unknown> | undefined,
  characteristicsCatalog: ResourceCharacteristicOption[],
): CharacteristicTag[] {
  if (!attributes) return [];

  const catalogByName = new Map(
    characteristicsCatalog
      .filter((item) => item.name)
      .map((item) => [toCharacteristicKey(String(item.name)), item]),
  );

  const tags = new Map<string, CharacteristicTag>();

  const characteristicNames =
    extractCharacteristicNamesFromAttributes(attributes);

  Object.entries(BOOLEAN_ATTRIBUTE_TO_CHARACTERISTIC).forEach(
    ([attr, name]) => {
      if (attributes[attr] === true) {
        characteristicNames.push(name);
      }
    },
  );

  characteristicNames.forEach((name) => {
    const key = toCharacteristicKey(name);
    const catalogItem = catalogByName.get(key);

    tags.set(key, {
      id: catalogItem?.id,
      name: catalogItem?.name || name,
      normalizedName: key,
      isNew: !catalogItem,
    });
  });

  return Array.from(tags.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "es"),
  );
}

export default function EditResourcePage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params.id as string;
  const locale = (params.locale as string) || "es";

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // Hooks de datos dinámicos
  const { data: resourceTypesData } = useResourceTypes();
  const resourceTypes = React.useMemo(() => {
    return (resourceTypesData || []).map((rt) => ({
      id: rt.code as ResourceType,
      label: rt.name,
      icon: rt.icon || "📦",
    }));
  }, [resourceTypesData]);

  const { data: categoriesData } = useResourceCategories();
  const categories = React.useMemo(() => {
    let extracted = extractArray<Category>(categoriesData, "categories");
    if (extracted.length === 0) {
      extracted = extractArray<Category>(categoriesData, "items");
    }
    return extracted;
  }, [categoriesData]);

  const { data: programsData } = useAcademicPrograms();
  const programsList = React.useMemo(
    () => extractPrograms(programsData),
    [programsData],
  );

  const { data: characteristicsData } = useResourceCharacteristics();
  const characteristicsCatalog = React.useMemo(() => {
    return extractCharacteristicOptions(characteristicsData);
  }, [characteristicsData]);

  const [resource, setResource] = React.useState<Resource | null>(null);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  // Estados del formulario
  const [formData, setFormData] = React.useState<UpdateResourceDto>({});
  const [selectedPrograms, setSelectedPrograms] = React.useState<string[]>([]);
  const [selectedCharacteristics, setSelectedCharacteristics] = React.useState<
    CharacteristicTag[]
  >([]);

  const [characteristicQuery, setCharacteristicQuery] = React.useState("");
  const [programQuery, setProgramQuery] = React.useState("");
  const [typeQuery, setTypeQuery] = React.useState("");

  const filteredTypes = React.useMemo(() => {
    const query = typeQuery.toLowerCase().trim();
    const options = !query
      ? resourceTypes
      : resourceTypes.filter((t) => t.label.toLowerCase().includes(query));
    return options.slice(0, 6);
  }, [typeQuery, resourceTypes]);

  const filteredPrograms = React.useMemo(() => {
    const query = programQuery.toLowerCase().trim();
    const options = !query
      ? programsList
      : programsList.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.code?.toLowerCase().includes(query) ||
            p.faculty?.toLowerCase().includes(query),
        );
    return options.slice(0, 6);
  }, [programsList, programQuery]);

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

    return options.slice(0, 6);
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

  // Cargar recurso
  React.useEffect(() => {
    const fetchResourceData = async () => {
      try {
        const response = await httpClient.get<Resource>(
          `resources/${resourceId}`,
        );

        if (response.success && response.data) {
          const resourceData = response.data;
          setResource(resourceData);
          setSelectedPrograms(
            (resourceData.programIds || []).map((id) => String(id)),
          );

          const resourceAttributes =
            (resourceData.attributes as Record<string, unknown>) || {};

          if (characteristicsCatalog.length > 0) {
            setSelectedCharacteristics(
              resolveSelectedCharacteristics(
                resourceAttributes,
                characteristicsCatalog,
              ),
            );
          }

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
      } catch (err) {
        setError("Error al cargar el recurso");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (resourceId && characteristicsCatalog.length > 0) {
      fetchResourceData();
    }
  }, [resourceId, characteristicsCatalog]);

  const handleClearProgramSelection = () => {
    setSelectedPrograms([]);
    setFormData((prev) => ({ ...prev, programIds: [] }));
  };

  const handleSelectAllPrograms = () => {
    if (selectedPrograms.length === programsList.length) {
      setSelectedPrograms([]);
      setFormData((prev) => ({ ...prev, programIds: [] }));
    } else {
      const allIds = programsList.map((p) => p.id);
      setSelectedPrograms(allIds);
      setFormData((prev) => ({ ...prev, programIds: allIds }));
    }
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

  const handleProgramToggle = (programId: string) => {
    setSelectedPrograms((prev) => {
      const isSelected = prev.includes(programId);
      const newSelection = isSelected
        ? prev.filter((id) => id !== programId)
        : [...prev, programId];

      setFormData((prevData) => ({
        ...prevData,
        programIds: newSelection,
      }));

      return newSelection;
    });
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

      const characteristicValues = selectedCharacteristics.map((item) =>
        item.id ? item.id : { name: item.name },
      );

      const attributesPayload: Record<string, unknown> = {
        ...(formData.attributes || {}),
        characteristics: characteristicValues,
        features: characteristicNames,
      };

      const effectiveType = formData.type || resource?.type;

      if (effectiveType === ResourceType.MULTIMEDIA_EQUIPMENT) {
        if (!attributesPayload.equipmentType)
          attributesPayload.equipmentType = "laptop";
        if (attributesPayload.isPortable === undefined)
          attributesPayload.isPortable = true;
      } else if (effectiveType === ResourceType.CLASSROOM) {
        if (attributesPayload.capacity === undefined)
          attributesPayload.capacity =
            formData.capacity || resource?.capacity || 1;
      } else if (effectiveType === ResourceType.LABORATORY) {
        if (!attributesPayload.labType) attributesPayload.labType = "computer";
        if (attributesPayload.capacity === undefined)
          attributesPayload.capacity =
            formData.capacity || resource?.capacity || 1;
      } else if (effectiveType === ResourceType.SPORTS_FACILITY) {
        if (!attributesPayload.sportType)
          attributesPayload.sportType = "soccer";
        if (attributesPayload.isIndoor === undefined)
          attributesPayload.isIndoor = true;
      } else if (effectiveType === ResourceType.MEETING_ROOM) {
        if (attributesPayload.capacity === undefined)
          attributesPayload.capacity =
            formData.capacity || resource?.capacity || 2;
      } else if (effectiveType === ResourceType.AUDITORIUM) {
        if (attributesPayload.hasSoundSystem === undefined)
          attributesPayload.hasSoundSystem = true;
      }

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
        programIds: selectedPrograms,
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
      <MainLayout>
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
      <MainLayout>
        <Alert variant="error">Recurso no encontrado</Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-6">
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

        {error && <Alert variant="error">{error}</Alert>}
        {success && (
          <Alert variant="success">
            ¡Recurso actualizado exitosamente! Redirigiendo...
          </Alert>
        )}

        <form onSubmit={handleSubmit} data-testid="resource-edit-form">
          <Tabs defaultValue="basica" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="basica">Información Básica</TabsTrigger>
              <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
              <TabsTrigger value="caracteristicas">Características</TabsTrigger>
              <TabsTrigger value="disponibilidad">Disponibilidad</TabsTrigger>
              <TabsTrigger value="programas">
                Programas ({selectedPrograms.length})
              </TabsTrigger>
            </TabsList>

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
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                          Tipo de Recurso *
                        </label>
                        <div className="relative w-48">
                          <Search
                            size={12}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                          />
                          <Input
                            placeholder="Filtrar tipos..."
                            value={typeQuery}
                            onChange={(e) => setTypeQuery(e.target.value)}
                            className="h-8 pl-8 text-xs bg-[var(--color-bg-muted)]/20 border-[var(--color-border-subtle)] rounded-lg focus:ring-brand-primary-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {filteredTypes.map(({ id, label, icon }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => handleInputChange("type", id)}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-colors",
                              (formData.type || resource.type) === id
                                ? "border-brand-primary-500 bg-brand-primary-50 text-brand-primary-700 shadow-sm"
                                : "border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-brand-primary-200 hover:bg-brand-primary-50/30",
                            )}
                          >
                            <span className="text-xl">{icon}</span>
                            <span className="text-center line-clamp-1">
                              {label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Categoría
                        </label>
                        <Select
                          value={formData.categoryId || ""}
                          onValueChange={(v) =>
                            handleInputChange("categoryId", v)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                            handleInputChange(
                              "capacity",
                              parseInt(e.target.value),
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                    <div
                      className="flex flex-wrap gap-2"
                      data-testid="resource-characteristics-selected"
                    >
                      {selectedCharacteristics.map((c) => (
                        <span
                          key={c.normalizedName}
                          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                        >
                          {c.isNew ? (
                            <Plus className="h-3.5 w-3.5" />
                          ) : (
                            <Tag className="h-3.5 w-3.5" />
                          )}
                          <span>{c.name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveCharacteristic(c.normalizedName)
                            }
                            className="rounded p-0.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Buscar o crear característica..."
                      value={characteristicQuery}
                      onChange={(e) => setCharacteristicQuery(e.target.value)}
                    />
                    <div
                      className="max-h-[280px] overflow-y-auto space-y-2 rounded-lg border border-[var(--color-border-subtle)] p-2"
                      data-testid="resource-characteristics-options"
                    >
                      {filteredCharacteristics.map((c) => (
                        <button
                          key={String(c.id)}
                          type="button"
                          onClick={() =>
                            handleSelectExistingCharacteristic(
                              c as ResourceCharacteristicOption,
                            )
                          }
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text-primary)]"
                        >
                          {c.name}
                        </button>
                      ))}
                      {canCreateCharacteristic && (
                        <button
                          type="button"
                          onClick={handleCreateCharacteristic}
                          className="w-full text-left px-3 py-2 rounded-md border border-[var(--color-border-focus)] bg-[var(--color-bg-primary)] text-sm text-[var(--color-text-primary)]"
                        >
                          Crear &quot;{normalizedCharacteristicQuery}&quot;
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="disponibilidad">
              <Card>
                <CardHeader>
                  <CardTitle>Reglas de Disponibilidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-center gap-3 p-3 bg-[var(--color-bg-primary)] rounded-lg cursor-pointer">
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
                    <span className="text-sm font-medium">
                      Requiere Aprobación
                    </span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-[var(--color-bg-primary)] rounded-lg cursor-pointer">
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
                    <span className="text-sm font-medium">
                      Permitir Reservas Recurrentes
                    </span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
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
                      <label className="block text-sm font-medium mb-2">
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
                      <label className="block text-sm font-medium mb-2">
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

            <TabsContent value="programas">
              <Card>
                <CardHeader>
                  <CardTitle>Programas Académicos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[var(--color-text-tertiary)]">
                      {selectedPrograms.length} programas seleccionados
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearProgramSelection}
                      >
                        Limpiar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllPrograms}
                      >
                        {selectedPrograms.length === programsList.length
                          ? "Deseleccionar"
                          : "Todos"}
                      </Button>
                    </div>
                  </div>
                  <Input
                    placeholder="Buscar por código o nombre..."
                    value={programQuery}
                    onChange={(e) => setProgramQuery(e.target.value)}
                  />
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {filteredPrograms.map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center justify-between p-4 bg-[var(--color-bg-primary)]/50 rounded-lg cursor-pointer hover:bg-[var(--color-bg-primary)]"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedPrograms.includes(p.id)}
                            onChange={() => handleProgramToggle(p.id)}
                            className="w-5 h-5 rounded"
                          />
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-sm text-[var(--color-text-tertiary)]">
                              {p.code}
                            </p>
                          </div>
                        </div>
                        {selectedPrograms.includes(p.id) && (
                          <Badge variant="success">Seleccionado</Badge>
                        )}
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/${locale}/recursos/${resourceId}`)}
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
