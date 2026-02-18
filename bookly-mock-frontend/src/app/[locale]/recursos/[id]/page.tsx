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
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { DatePicker } from "@/components/molecules/DatePicker";
import { InfoField } from "@/components/molecules/InfoField";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { DetailLayout } from "@/components/templates/DetailLayout";
import { MainLayout } from "@/components/templates/MainLayout";
import { useResource } from "@/hooks/useResources";
import { httpClient } from "@/infrastructure/http";
import { AcademicProgram } from "@/types/entities/resource";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";

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

function isLikelyCharacteristicIdentifier(value: string): boolean {
  const normalized = value.trim();

  if (!normalized) {
    return false;
  }

  return (
    /^[a-fA-F0-9]{24}$/.test(normalized) ||
    /^char[_-][a-zA-Z0-9_-]+$/i.test(normalized)
  );
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

  return normalized;
}

function resolveResourceCharacteristicNames(
  attributes: Record<string, unknown> | undefined,
  characteristicsCatalog: ResourceCharacteristicOption[],
): string[] {
  if (!attributes) {
    return [];
  }

  const catalogById = new Map(
    characteristicsCatalog
      .filter((item) => item.id && item.name)
      .map((item) => [String(item.id), String(item.name)]),
  );

  const catalogByCode = new Map(
    characteristicsCatalog
      .filter((item) => item.code && item.name)
      .map((item) => [String(item.code).toUpperCase(), String(item.name)]),
  );

  const catalogByName = new Map(
    characteristicsCatalog
      .filter((item) => item.name)
      .map((item) => [
        toCharacteristicKey(String(item.name)),
        String(item.name),
      ]),
  );

  const names = new Map<string, string>();

  const addName = (value: string | undefined) => {
    if (!value) {
      return;
    }

    const normalized = normalizeCharacteristicName(value);
    if (!normalized || isLikelyCharacteristicIdentifier(normalized)) {
      return;
    }

    names.set(toCharacteristicKey(normalized), normalized);
  };

  const rawCharacteristics = Array.isArray(attributes.characteristics)
    ? attributes.characteristics
    : [];

  rawCharacteristics.forEach((item) => {
    const rawId =
      typeof item === "object" && item !== null
        ? ((item as { id?: string; _id?: string }).id ??
          (item as { _id?: string })._id)
        : typeof item === "string"
          ? item
          : undefined;
    const rawCode =
      typeof item === "object" && item !== null
        ? (item as { code?: string }).code
        : undefined;
    const rawName =
      typeof item === "object" && item !== null
        ? (item as { name?: string }).name
        : undefined;

    if (rawId && catalogById.has(String(rawId))) {
      addName(catalogById.get(String(rawId)));
      return;
    }

    if (rawCode && catalogByCode.has(String(rawCode).toUpperCase())) {
      addName(catalogByCode.get(String(rawCode).toUpperCase()));
      return;
    }

    if (rawName) {
      const byName = catalogByName.get(toCharacteristicKey(rawName));
      addName(byName ?? rawName);
      return;
    }

    if (typeof item === "string") {
      const byId = catalogById.get(item);
      const byName = catalogByName.get(toCharacteristicKey(item));
      addName(byId ?? byName ?? item);
    }
  });

  const rawFeatures = Array.isArray(attributes.features)
    ? attributes.features
    : [];
  rawFeatures.forEach((feature) => {
    if (typeof feature === "string") {
      addName(feature);
    }
  });

  Object.entries(BOOLEAN_ATTRIBUTE_TO_CHARACTERISTIC).forEach(
    ([attribute, name]) => {
      if (attributes[attribute] === true) {
        addName(name);
      }
    },
  );

  return Array.from(names.values()).sort((a, b) => a.localeCompare(b, "es"));
}

function extractPrograms(
  data: ProgramCollectionPayload | AcademicProgram[] | undefined,
): AcademicProgram[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data?.items && Array.isArray(data.items)) {
    return data.items;
  }

  return [];
}

/**
 * Página de Detalle de Recurso - Bookly
 *
 * Usa MainLayout + DetailLayout del sistema de diseño
 * Incluye: tabs, sidebar con info rápida, acciones
 */

export default function RecursoDetailPage() {
  const t = useTranslations("resource_detail");
  const params = useParams();
  const router = useRouter();
  const resourceId = params.id as string;
  const locale = (params.locale as string) || "es";

  // React Query para cargar recurso
  const {
    data: resource,
    isLoading: loading,
    error: queryError,
  } = useResource(resourceId);

  const [selectedDate, setSelectedDate] = React.useState<Date>();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const error = queryError ? String(queryError) : "";

  // Estados para programas académicos
  const [allPrograms, setAllPrograms] = React.useState<AcademicProgram[]>([]);
  const [resourcePrograms, setResourcePrograms] = React.useState<
    AcademicProgram[]
  >([]);
  const [characteristicsCatalog, setCharacteristicsCatalog] = React.useState<
    ResourceCharacteristicOption[]
  >([]);

  // Cargar programas académicos
  React.useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const programsRes = await httpClient.get<
          ProgramCollectionPayload | AcademicProgram[]
        >("programs");

        if (programsRes.success) {
          setAllPrograms(extractPrograms(programsRes.data));
        }
      } catch (err) {
        console.error("Error al cargar programas:", err);
      }
    };

    if (resourceId) {
      fetchPrograms();
    }
  }, [resourceId]);

  React.useEffect(() => {
    const fetchCharacteristicsCatalog = async () => {
      try {
        const characteristicsResponse = await httpClient.get<
          | ResourceCharacteristicsCollectionPayload
          | ResourceCharacteristicOption[]
        >("resources/characteristics");

        if (characteristicsResponse.success) {
          setCharacteristicsCatalog(
            extractCharacteristicOptions(characteristicsResponse.data),
          );
        }
      } catch (err) {
        console.error("Error al cargar características de recursos:", err);
      }
    };

    if (resourceId) {
      fetchCharacteristicsCatalog();
    }
  }, [resourceId]);

  // Calcular programas asociados al recurso a partir de resource.programIds
  React.useEffect(() => {
    if (!resource?.programIds?.length) {
      setResourcePrograms([]);
      return;
    }

    const programIds = new Set(resource.programIds);
    setResourcePrograms(
      allPrograms.filter((program) => programIds.has(program.id)),
    );
  }, [allPrograms, resource]);

  const resourceCharacteristicNames = React.useMemo(
    () =>
      resolveResourceCharacteristicNames(
        (resource?.attributes as Record<string, unknown> | undefined) ??
          undefined,
        characteristicsCatalog,
      ),
    [characteristicsCatalog, resource],
  );

  // Eliminar recurso
  const handleDelete = async () => {
    if (!resource) return;

    try {
      await httpClient.delete(`resources/${resource.id}`);
      router.push(`/${locale}/recursos`);
    } catch (err) {
      console.error("Error al eliminar recurso:", err);
      alert(t("delete_error"));
    }
  };

  const header = <AppHeader title={t("title")} />;
  const sidebar = <AppSidebar />;

  const sidebarContent = resource ? (
    <div className="space-y-4">
      {/* Info Rápida */}
      <Card>
        <CardHeader>
          <CardTitle>{t("quick_info")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoField
            label={t("status")}
            value={<StatusBadge type="resource" status={resource.status} />}
          />
          <InfoField label={t("type")} value={resource.type} />
          <InfoField
            label={t("capacity")}
            value={`${resource.capacity} ${t("people")}`}
          />
          <InfoField label={t("location")} value={resource.location} />
        </CardContent>
      </Card>

      {/* Botón Reserva Rápida */}
      <Button
        className="w-full"
        onClick={() => {
          if (resource) {
            router.push(`/${locale}/recursos/${resource.id}?tab=reserva`);
          }
        }}
      >
        {t("quick_reserve")}
      </Button>
    </div>
  ) : null;

  // Loading state
  if (loading) {
    return (
      <MainLayout header={header} sidebar={sidebar}>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  // Error or not found state
  if (error || !resource) {
    return (
      <MainLayout header={header} sidebar={sidebar}>
        <div className="max-w-2xl mx-auto mt-12">
          <Alert variant="error">{error || t("not_found")}</Alert>
          <Button
            className="mt-4"
            onClick={() => router.push(`/${locale}/recursos`)}
          >
            {t("back_list")}
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout header={header} sidebar={sidebar}>
      {/* Modal de Confirmación de Eliminación */}
      <ConfirmDialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t("delete_title")}
        description={t("delete_confirm")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        variant="destructive"
      >
        <div className="space-y-2">
          <div className="bg-[var(--color-bg-primary)] p-4 rounded-lg">
            <p className="font-medium text-foreground">{resource.name}</p>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              {resource.code}
            </p>
          </div>
          <p className="text-sm text-[var(--color-text-tertiary)]">
            {t("delete_warning")}
          </p>
        </div>
      </ConfirmDialog>

      <DetailLayout
        title={resource.name}
        subtitle={resource.description}
        badge={{
          text: resource.status,
          variant: "default",
        }}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: `/${locale}/dashboard` },
          { label: t("breadcrumbs.resources"), href: `/${locale}/recursos` },
          { label: resource.name },
        ]}
        defaultTab="reserva"
        tabs={[
          {
            value: "detalles",
            label: t("tabs.details"),
            content: (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("general_info")}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        {t("code")}
                      </p>
                      <p className="text-sm text-[var(--color-text-primary)]">
                        {resource.code}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        {t("type")}
                      </p>
                      <p className="text-sm text-[var(--color-text-primary)]">
                        {resource.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        {t("capacity")}
                      </p>
                      <p className="text-sm text-[var(--color-text-primary)]">
                        {resource.capacity} {t("people")}
                      </p>
                    </div>
                    <InfoField
                      label={t("status")}
                      value={
                        <StatusBadge type="resource" status={resource.status} />
                      }
                    />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        {t("category")}
                      </p>
                      <p className="text-sm text-[var(--color-text-primary)]">
                        {resource.category?.name || t("no_category")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        {t("created_at")}
                      </p>
                      <p className="text-sm text-[var(--color-text-primary)]">
                        {new Date(resource.createdAt).toLocaleDateString(
                          locale,
                        )}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        {t("location")}
                      </p>
                      <p className="text-sm text-[var(--color-text-primary)]">
                        {resource.location}
                        {resource.building && ` - ${resource.building}`}
                        {resource.floor && `, ${resource.floor}`}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                        {t("description")}
                      </p>
                      <p className="text-sm text-[var(--color-text-primary)]">
                        {resource.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ),
          },
          {
            value: "historial",
            label: t("tabs.history"),
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>{t("history_title")}</CardTitle>
                  <CardDescription>{t("history_desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-center text-[var(--color-text-secondary)] py-8">
                      {t("history_title")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ),
          },
          {
            value: "reserva",
            label: t("tabs.availability"),
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>{t("availability_title")}</CardTitle>
                  <CardDescription>{t("availability_desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-[var(--color-text-secondary)] mb-4">
                    {t("select_date_avail")}
                  </p>
                  <DatePicker date={selectedDate} onSelect={setSelectedDate} />
                  {selectedDate && (
                    <div className="mt-6 space-y-2">
                      <p className="font-medium text-[var(--color-text-primary)] mb-3">
                        {t("avail_slots", {
                          date: selectedDate.toLocaleDateString(locale),
                        })}
                      </p>
                      {[
                        { hora: "07:00 - 09:00", disponible: true },
                        { hora: "09:00 - 11:00", disponible: false },
                        { hora: "11:00 - 13:00", disponible: true },
                        { hora: "14:00 - 16:00", disponible: true },
                        { hora: "16:00 - 18:00", disponible: true },
                      ].map((slot, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-md border border-[var(--color-border-subtle)]"
                        >
                          <span className="text-sm text-[var(--color-text-primary)]">
                            {slot.hora}
                          </span>
                          {slot.disponible ? (
                            <Button size="sm">{t("reserve_action")}</Button>
                          ) : (
                            <Badge variant="error">{t("occupied")}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ),
          },
          {
            value: "caracteristicas",
            label: t("tabs.features"),
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>{t("features_title")}</CardTitle>
                  <CardDescription>{t("features_desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {resourceCharacteristicNames.length === 0 ? (
                    <p className="text-center text-[var(--color-text-secondary)] py-8">
                      {t("no_features")}
                    </p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {resourceCharacteristicNames.map((name) => (
                        <div
                          key={name}
                          className="flex items-center justify-between rounded-lg border border-[var(--color-border-subtle)] bg-state-success-500/10 p-4"
                        >
                          <p className="font-medium text-[var(--color-text-primary)]">
                            {name}
                          </p>
                          <Badge variant="success">✓</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ),
          },
          {
            value: "configuracion",
            label: t("tabs.config"),
            content: (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("config_title")}</CardTitle>
                    <CardDescription>{t("config_desc")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                          {t("requires_approval")}
                        </p>
                        <div className="flex items-center gap-2">
                          {resource.availabilityRules?.requiresApproval ? (
                            <>
                              <Badge variant="warning">{t("yes")}</Badge>
                              <span className="text-xs text-[var(--color-text-secondary)]">
                                {t("approval_required_desc")}
                              </span>
                            </>
                          ) : (
                            <>
                              <Badge variant="success">{t("no")}</Badge>
                              <span className="text-xs text-[var(--color-text-secondary)]">
                                {t("approval_not_required")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                          {t("allow_recurring")}
                        </p>
                        <div className="flex items-center gap-2">
                          {resource.availabilityRules?.allowRecurring ? (
                            <>
                              <Badge variant="success">{t("yes")}</Badge>
                              <span className="text-xs text-[var(--color-text-secondary)]">
                                {t("recurring_allowed")}
                              </span>
                            </>
                          ) : (
                            <>
                              <Badge variant="secondary">{t("no")}</Badge>
                              <span className="text-xs text-[var(--color-text-secondary)]">
                                {t("recurring_not_allowed")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                          {t("max_advance")}
                        </p>
                        <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                          {resource.availabilityRules?.maxAdvanceBookingDays ||
                            30}{" "}
                          {t("days")}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                          {t("min_duration")}
                        </p>
                        <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                          {resource.availabilityRules
                            ?.minBookingDurationMinutes || 60}{" "}
                          {t("minutes")}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                          {t("max_duration")}
                        </p>
                        <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                          {resource.availabilityRules
                            ?.maxBookingDurationMinutes || 240}{" "}
                          {t("minutes")}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                          {t("updated_at")}
                        </p>
                        <p className="text-sm text-[var(--color-text-primary)]">
                          {new Date(resource.updatedAt).toLocaleDateString(
                            locale,
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {resource.maintenanceSchedule && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("maintenance_title")}</CardTitle>
                      <CardDescription>{t("maintenance_desc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        {resource.maintenanceSchedule.lastMaintenanceDate && (
                          <div className="p-3 rounded-md border border-[var(--color-border-subtle)]">
                            <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                              {t("last_maintenance")}
                            </p>
                            <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                              {new Date(
                                resource.maintenanceSchedule.lastMaintenanceDate,
                              ).toLocaleDateString(locale)}
                            </p>
                          </div>
                        )}

                        {resource.maintenanceSchedule.nextMaintenanceDate && (
                          <div className="p-3 rounded-md border border-[var(--color-border-subtle)]">
                            <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                              {t("next_maintenance")}
                            </p>
                            <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                              {new Date(
                                resource.maintenanceSchedule.nextMaintenanceDate,
                              ).toLocaleDateString(locale)}
                            </p>
                          </div>
                        )}

                        {resource.maintenanceSchedule
                          .maintenanceFrequencyDays && (
                          <div className="p-3 rounded-md border border-[var(--color-border-subtle)] md:col-span-2">
                            <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                              {t("maintenance_freq")}
                            </p>
                            <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                              {t("every")}{" "}
                              {
                                resource.maintenanceSchedule
                                  .maintenanceFrequencyDays
                              }{" "}
                              {t("days")}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ),
          },
          {
            value: "programas",
            label: t("tabs.programs"),
            content: (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-foreground">
                    {t("programs_title_prefix")} ({resourcePrograms.length})
                  </h3>
                </div>
                {resourcePrograms.length === 0 ? (
                  <p className="text-center text-[var(--color-text-tertiary)] py-8">
                    {t("no_programs")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {resourcePrograms.map((program) => (
                      <div
                        key={program.id}
                        className="flex items-center justify-between p-4 bg-[var(--color-bg-primary)]/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {program.name}
                          </p>
                          <p className="text-sm text-[var(--color-text-tertiary)]">
                            {program.code} - {program.faculty}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/${locale}/programas/${program.id}`)
                            }
                          >
                            {t("view_detail")}
                          </Button>
                          <Badge variant="success">{t("associated")}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
        ]}
        sidebar={sidebarContent}
        onBack={() => router.push(`/${locale}/recursos`)}
        onEdit={() => router.push(`/${locale}/recursos/${resource.id}/editar`)}
        onDelete={() => setShowDeleteModal(true)}
      />
    </MainLayout>
  );
}
