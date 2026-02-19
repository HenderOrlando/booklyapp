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
  CreateResourceDto,
  ResourceType,
} from "@/types/entities/resource";
import { AlertCircle, Plus, Search, Tag, X } from "lucide-react";
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

export default function CreateResourcePage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "es";
  const [loading, setLoading] = React.useState(false);

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
  const programs = React.useMemo(
    () => extractPrograms(programsData),
    [programsData],
  );

  const { data: characteristicsData } = useResourceCharacteristics();
  const characteristicsCatalog = React.useMemo(() => {
    return extractCharacteristicOptions(characteristicsData);
  }, [characteristicsData]);

  const [selectedPrograms, setSelectedPrograms] = React.useState<string[]>([]);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("basica");
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>(
    {},
  );
  const [tabErrors, setTabErrors] = React.useState<Record<string, boolean>>({});

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
      ? programs
      : programs.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.code?.toLowerCase().includes(query) ||
            p.faculty?.toLowerCase().includes(query),
        );
    return options.slice(0, 6);
  }, [programs, programQuery]);

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

      setFormData((prevData) => ({
        ...prevData,
        programIds: newSelection,
      }));

      return newSelection;
    });
  };

  const handleSelectAllPrograms = () => {
    if (selectedPrograms.length === programs.length) {
      setSelectedPrograms([]);
      setFormData((prev) => ({ ...prev, programIds: [] }));
    } else {
      const allIds = programs.map((p) => p.id);
      setSelectedPrograms(allIds);
      setFormData((prev) => ({ ...prev, programIds: allIds }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const tabsWithErrors: Record<string, boolean> = {
      basica: false,
      ubicacion: false,
      caracteristicas: false,
      programas: false,
      disponibilidad: false,
    };

    if (!formData.code?.trim()) {
      errors.code = "El código es obligatorio";
      tabsWithErrors.basica = true;
    }
    if (!formData.name?.trim()) {
      errors.name = "El nombre es obligatorio";
      tabsWithErrors.basica = true;
    }
    if (!formData.categoryId) {
      errors.categoryId = "La categoría es obligatoria";
      tabsWithErrors.basica = true;
    }

    if (!formData.building?.trim()) {
      errors.building = "El edificio es obligatorio";
      tabsWithErrors.ubicacion = true;
    }
    if (!formData.location?.trim()) {
      errors.location = "La ubicación específica es obligatoria";
      tabsWithErrors.ubicacion = true;
    }

    setFormErrors(errors);
    setTabErrors(tabsWithErrors);

    if (Object.keys(errors).length > 0) {
      if (tabsWithErrors.basica) return "basica";
      if (tabsWithErrors.ubicacion) return "ubicacion";
      if (tabsWithErrors.caracteristicas) return "caracteristicas";
      if (tabsWithErrors.programas) return "programas";
      if (tabsWithErrors.disponibilidad) return "disponibilidad";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const firstTabWithError = validateForm();
    if (firstTabWithError) {
      setActiveTab(firstTabWithError);
      setError("Por favor completa los campos obligatorios marcados en rojo.");
      return;
    }

    setLoading(true);
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

      const effectiveType = formData.type;

      if (effectiveType === ResourceType.MULTIMEDIA_EQUIPMENT) {
        if (!attributesPayload.equipmentType) {
          attributesPayload.equipmentType = "laptop";
        }
        if (attributesPayload.isPortable === undefined) {
          attributesPayload.isPortable = true;
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-bg-primary)] p-6 rounded-xl border border-[var(--color-border-subtle)] shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Crear Nuevo Recurso
            </h2>
            <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
              Completa el formulario para agregar un nuevo recurso al sistema
              institucional
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/${locale}/recursos`)}
              disabled={loading}
              className="min-w-[100px]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="create-resource-form"
              disabled={loading}
              className="min-w-[120px] bg-[var(--color-action-primary)] hover:opacity-90"
            >
              {loading ? "Creando..." : "Crear Recurso"}
            </Button>
          </div>
        </div>

        {error && <Alert variant="error">{error}</Alert>}
        {success && (
          <Alert variant="success">
            ¡Recurso creado exitosamente! Redirigiendo...
          </Alert>
        )}

        <form id="create-resource-form" onSubmit={handleSubmit}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="flex flex-wrap md:grid w-full md:grid-cols-5 h-auto mb-8 bg-[var(--color-bg-tertiary)]/20 p-1 rounded-xl border border-[var(--color-border-subtle)]">
              <TabsTrigger
                value="basica"
                className={cn(
                  "flex-1 py-3 px-4 transition-all duration-200",
                  tabErrors.basica &&
                    "text-state-error-600 bg-state-error-50/50",
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="hidden sm:inline">1.</span>
                  <span>Básica</span>
                  {tabErrors.basica && (
                    <AlertCircle className="w-3.5 h-3.5 text-state-error-500 animate-pulse" />
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="ubicacion"
                className={cn(
                  "flex-1 py-3 px-4 transition-all duration-200",
                  tabErrors.ubicacion &&
                    "text-state-error-600 bg-state-error-50/50",
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="hidden sm:inline">2.</span>
                  <span>Ubicación</span>
                  {tabErrors.ubicacion && (
                    <AlertCircle className="w-3.5 h-3.5 text-state-error-500 animate-pulse" />
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="caracteristicas"
                className={cn(
                  "flex-1 py-3 px-4 transition-all duration-200",
                  tabErrors.caracteristicas &&
                    "text-state-error-600 bg-state-error-50/50",
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="hidden sm:inline">3.</span>
                  <span>Características</span>
                  {tabErrors.caracteristicas && (
                    <AlertCircle className="w-3.5 h-3.5 text-state-error-500 animate-pulse" />
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="programas"
                className={cn(
                  "flex-1 py-3 px-4 transition-all duration-200",
                  tabErrors.programas &&
                    "text-state-error-600 bg-state-error-50/50",
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="hidden sm:inline">4.</span>
                  <span>Programas</span>
                  {tabErrors.programas && (
                    <AlertCircle className="w-3.5 h-3.5 text-state-error-500 animate-pulse" />
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="disponibilidad"
                className={cn(
                  "flex-1 py-3 px-4 transition-all duration-200",
                  tabErrors.disponibilidad &&
                    "text-state-error-600 bg-state-error-50/50",
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="hidden sm:inline">5.</span>
                  <span>Disponibilidad</span>
                  {tabErrors.disponibilidad && (
                    <AlertCircle className="w-3.5 h-3.5 text-state-error-500 animate-pulse" />
                  )}
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basica">
              <Card
                className={cn(tabErrors.basica && "border-state-error-500")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Información Básica
                    {tabErrors.basica && (
                      <Badge variant="error" className="text-[10px] py-0">
                        Incompleto
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Datos principales del recurso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Código del Recurso{" "}
                        <span className="text-state-error-500">*</span>
                      </label>
                      <Input
                        value={formData.code || ""}
                        className={cn(
                          "h-11 transition-all",
                          formErrors.code
                            ? "border-state-error-500 bg-state-error-50"
                            : "focus:border-[var(--color-border-focus)]",
                        )}
                        onChange={(e) =>
                          handleInputChange("code", e.target.value)
                        }
                        placeholder="Ej: SALA-01"
                      />
                      {formErrors.code && (
                        <p className="text-[11px] font-medium text-state-error-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {formErrors.code}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Nombre del Recurso{" "}
                        <span className="text-state-error-500">*</span>
                      </label>
                      <Input
                        value={formData.name || ""}
                        className={cn(
                          "h-11 transition-all",
                          formErrors.name
                            ? "border-state-error-500 bg-state-error-50"
                            : "focus:border-[var(--color-border-focus)]",
                        )}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Ej: Sala de Juntas A"
                      />
                      {formErrors.name && (
                        <p className="text-[11px] font-medium text-state-error-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {formErrors.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description || ""}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={3}
                      className="w-full rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus:border-[var(--color-border-focus)]"
                      placeholder="Describe brevemente el recurso, su propósito y cualquier detalle relevante para los usuarios..."
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
                              formData.type === id
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
                        {filteredTypes.length === 0 && (
                          <div className="col-span-full py-4 text-center text-xs text-[var(--color-text-tertiary)] italic">
                            No se encontraron tipos de recurso que coincidan.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Categoría *
                        </label>
                        <Select
                          value={formData.categoryId}
                          onValueChange={(value) =>
                            handleInputChange("categoryId", value)
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              formErrors.categoryId && "border-state-error-500",
                            )}
                          >
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formErrors.categoryId && (
                          <p className="text-[10px] text-state-error-500 mt-1">
                            {formErrors.categoryId}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Capacidad *
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
              <Card
                className={cn(tabErrors.ubicacion && "border-state-error-500")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Ubicación
                    {tabErrors.ubicacion && (
                      <Badge variant="error" className="text-[10px] py-0">
                        Incompleto
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Datos de ubicación del recurso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Edificio <span className="text-state-error-500">*</span>
                      </label>
                      <Input
                        value={formData.building || ""}
                        className={cn(
                          "h-11 transition-all",
                          formErrors.building
                            ? "border-state-error-500 bg-state-error-50"
                            : "focus:border-[var(--color-border-focus)]",
                        )}
                        onChange={(e) =>
                          handleInputChange("building", e.target.value)
                        }
                        placeholder="Ej: Edificio Administrativo"
                      />
                      {formErrors.building && (
                        <p className="text-[11px] font-medium text-state-error-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {formErrors.building}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Piso
                      </label>
                      <Input
                        value={formData.floor || ""}
                        className="h-11 focus:border-[var(--color-border-focus)]"
                        onChange={(e) =>
                          handleInputChange("floor", e.target.value)
                        }
                        placeholder="Ej: 2do Piso"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                      Ubicación Específica / Referencia{" "}
                      <span className="text-state-error-500">*</span>
                    </label>
                    <Input
                      value={formData.location || ""}
                      className={cn(
                        "h-11 transition-all",
                        formErrors.location
                          ? "border-state-error-500 bg-state-error-50"
                          : "focus:border-[var(--color-border-focus)]",
                      )}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="Ej: Costado Norte, al lado de la biblioteca"
                    />
                    {formErrors.location && (
                      <p className="text-[11px] font-medium text-state-error-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{" "}
                        {formErrors.location}
                      </p>
                    )}
                    <p className="text-[11px] text-[var(--color-text-tertiary)] italic">
                      Proporciona detalles que ayuden a los usuarios a encontrar
                      el recurso fácilmente.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="caracteristicas">
              <Card>
                <CardHeader>
                  <CardTitle>Características y Equipamiento</CardTitle>
                  <CardDescription>
                    Selecciona las características del recurso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Características Seleccionadas
                      </label>
                      <Badge
                        variant="secondary"
                        className="bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border-none"
                      >
                        {selectedCharacteristics.length} seleccionadas
                      </Badge>
                    </div>

                    {selectedCharacteristics.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]/30 text-center">
                        <Tag className="w-8 h-8 text-[var(--color-text-tertiary)] mb-2 opacity-20" />
                        <p className="text-sm text-[var(--color-text-tertiary)] max-w-[200px]">
                          No has seleccionado características para este recurso.
                        </p>
                      </div>
                    ) : (
                      <div
                        className="flex flex-wrap gap-2 p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] shadow-sm min-h-[58px]"
                        data-testid="resource-characteristics-selected"
                      >
                        {selectedCharacteristics.map((characteristic) => (
                          <div
                            key={characteristic.normalizedName}
                            data-testid={`resource-characteristic-chip-${characteristic.isNew ? "new-" : ""}${toCharacteristicTestId(characteristic.name)}`}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all animate-in fade-in zoom-in duration-200",
                              characteristic.isNew
                                ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                                : "border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]",
                            )}
                          >
                            {characteristic.isNew ? (
                              <Plus className="h-3.5 w-3.5" />
                            ) : (
                              <Tag className="h-3.5 w-3.5" />
                            )}
                            <span>{characteristic.name}</span>
                            {characteristic.isNew && (
                              <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                            )}
                            <button
                              type="button"
                              data-testid={`resource-characteristic-remove-${toCharacteristicTestId(characteristic.name)}`}
                              className="ml-1 rounded-md p-0.5 hover:bg-black/5 transition-colors"
                              onClick={() =>
                                handleRemoveCharacteristic(
                                  characteristic.normalizedName,
                                )
                              }
                              aria-label={`Eliminar característica ${characteristic.name}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                      Buscar o Agregar Características
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] group-focus-within:text-[var(--color-action-primary)] transition-colors">
                        <Plus className="w-4 h-4" />
                      </div>
                      <Input
                        data-testid="resource-characteristics-search-input"
                        placeholder="Escribe para buscar o crear una característica nueva..."
                        value={characteristicQuery}
                        onChange={(e) => setCharacteristicQuery(e.target.value)}
                        className="h-11 pl-10 focus:border-[var(--color-border-focus)] transition-all"
                      />
                    </div>

                    <div
                      className="max-h-[220px] overflow-y-auto rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] p-1.5 shadow-inner custom-scrollbar"
                      data-testid="resource-characteristics-options"
                    >
                      {filteredCharacteristics.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-1">
                          {filteredCharacteristics.map((characteristic) => (
                            <button
                              key={String(characteristic.id)}
                              type="button"
                              data-testid={`resource-characteristic-option-${toCharacteristicTestId(String(characteristic.name))}`}
                              onClick={() =>
                                handleSelectExistingCharacteristic(
                                  characteristic,
                                )
                              }
                              className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-lg hover:bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text-primary)] transition-colors group"
                            >
                              <Tag className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-action-primary)]" />
                              <span className="truncate">
                                {characteristic.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {canCreateCharacteristic && (
                        <button
                          type="button"
                          data-testid="resource-characteristic-create-option"
                          onClick={handleCreateCharacteristic}
                          className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-sm text-blue-700 transition-all font-medium group"
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                          </div>
                          <span>
                            Crear nueva característica:{" "}
                            <strong className="font-bold underline underline-offset-2">
                              &quot;{normalizedCharacteristicQuery}&quot;
                            </strong>
                          </span>
                        </button>
                      )}

                      {!canCreateCharacteristic &&
                        filteredCharacteristics.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-6 text-center">
                            <p className="text-sm text-[var(--color-text-tertiary)]">
                              {characteristicQuery.trim()
                                ? "No se encontraron coincidencias."
                                : "Comienza a escribir para ver sugerencias."}
                            </p>
                          </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-[var(--color-bg-tertiary)]/50 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                      <p className="text-[11px] text-[var(--color-text-tertiary)] leading-tight">
                        Las características nuevas se guardarán automáticamente
                        en el catálogo institucional al crear este recurso.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="programas">
              <Card>
                <CardHeader>
                  <CardTitle>Programas Académicos</CardTitle>
                  <CardDescription>
                    Selecciona los programas que pueden reservar este recurso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 p-4 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-border-subtle)]">
                    <div className="flex-1">
                      <Input
                        placeholder="Buscar programa por nombre, código o facultad..."
                        value={programQuery}
                        onChange={(e) => setProgramQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-bold">
                          Seleccionados
                        </div>
                        <div className="text-xl font-bold text-[var(--color-text-primary)]">
                          {selectedPrograms.length}{" "}
                          <span className="text-sm font-normal text-[var(--color-text-tertiary)]">
                            / {programs.length}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleClearProgramSelection}
                          data-testid="resource-program-clear-selection"
                          className="h-8 text-xs"
                        >
                          Limpiar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAllPrograms}
                          className="h-8 text-xs"
                        >
                          {selectedPrograms.length === programs.length
                            ? "Deseleccionar"
                            : "Todos"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      <strong>Nota:</strong> Si no seleccionas ningún programa,
                      el recurso estará disponible para todos los programas
                      académicos de la institución.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredPrograms.length === 0 ? (
                      <div className="col-span-full text-center py-12 border border-dashed border-[var(--color-border-subtle)] rounded-xl">
                        <p className="text-[var(--color-text-tertiary)]">
                          No se encontraron programas que coincidan con la
                          búsqueda
                        </p>
                      </div>
                    ) : (
                      <>
                        {filteredPrograms.map((program) => (
                          <label
                            key={program.id}
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer group",
                              selectedPrograms.includes(program.id)
                                ? "bg-[var(--color-bg-secondary)] border-[var(--color-border-focus)] shadow-sm"
                                : "bg-[var(--color-bg-primary)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-focus)]",
                            )}
                          >
                            <div className="relative flex items-center justify-center mt-0.5">
                              <input
                                type="checkbox"
                                checked={selectedPrograms.includes(program.id)}
                                onChange={() => handleProgramToggle(program.id)}
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[var(--color-border-subtle)] checked:bg-[var(--color-action-primary)] checked:border-[var(--color-action-primary)] transition-all"
                              />
                              <svg
                                className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                                  {program.name}
                                </span>
                                <span className="text-[10px] font-mono bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded text-[var(--color-text-secondary)]">
                                  {program.code}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                <span className="text-[10px] text-[var(--color-text-tertiary)] flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                  {program.faculty}
                                </span>
                                {program.department && (
                                  <span className="text-[10px] text-[var(--color-text-tertiary)] flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                    {program.department}
                                  </span>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="disponibilidad">
              <Card>
                <CardHeader>
                  <CardTitle>Reglas de Disponibilidad</CardTitle>
                  <CardDescription>
                    Configura cómo se puede reservar este recurso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex items-start gap-4 p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-secondary)] transition-all cursor-pointer group">
                      <div className="relative flex items-center justify-center mt-1">
                        <input
                          type="checkbox"
                          checked={
                            formData.availabilityRules?.requiresApproval ||
                            false
                          }
                          onChange={(e) =>
                            handleAvailabilityRuleChange(
                              "requiresApproval",
                              e.target.checked,
                            )
                          }
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[var(--color-border-subtle)] checked:bg-[var(--color-action-primary)] checked:border-[var(--color-action-primary)] transition-all"
                        />
                        <svg
                          className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-action-primary)] transition-colors">
                          Requiere Aprobación
                        </div>
                        <div className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                          Las solicitudes de reserva deberán ser validadas por
                          un administrador antes de confirmarse.
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-4 p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-secondary)] transition-all cursor-pointer group">
                      <div className="relative flex items-center justify-center mt-1">
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
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[var(--color-border-subtle)] checked:bg-[var(--color-action-primary)] checked:border-[var(--color-action-primary)] transition-all"
                        />
                        <svg
                          className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-action-primary)] transition-colors">
                          Permitir Reservas Recurrentes
                        </div>
                        <div className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                          Habilita la opción para que los usuarios programen
                          reservas periódicas (diarias, semanales, etc).
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Anticipación Máxima
                      </label>
                      <div className="relative">
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
                          className="h-11 pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase">
                          Días
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Duración Mínima
                      </label>
                      <div className="relative">
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
                          className="h-11 pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase">
                          Min.
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Duración Máxima
                      </label>
                      <div className="relative">
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
                          className="h-11 pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase">
                          Min.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-[var(--color-bg-tertiary)]/30 rounded-xl border border-[var(--color-border-subtle)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
                        Información de Disponibilidad
                      </h4>
                      <p className="text-xs text-[var(--color-text-tertiary)]">
                        Estas reglas define los límites técnicos para las
                        reservas. Puedes ajustarlas en cualquier momento desde
                        la configuración del recurso.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Botones de Acción Inferiores (Opcional, eliminados para limpieza ya que están arriba) */}
        </form>
      </div>
    </MainLayout>
  );
}
