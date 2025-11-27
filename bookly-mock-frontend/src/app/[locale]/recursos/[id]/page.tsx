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
  const [programFilter, setProgramFilter] = React.useState("");
  const [isEditingPrograms, setIsEditingPrograms] = React.useState(false);
  const [selectedProgramIds, setSelectedProgramIds] = React.useState<
    Set<string>
  >(new Set());

  // Cargar programas académicos (se mantiene para la asociación)
  React.useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const [programsRes, resourceProgramsRes] = await Promise.all([
          httpClient.get("academic-programs"),
          httpClient.get(`program-resources?programId=all`),
        ]);

        if (programsRes.success && programsRes.data) {
          setAllPrograms(programsRes.data.items || []);
        }

        // Filtrar programas que tienen este recurso
        if (resourceProgramsRes.success && resourceProgramsRes.data) {
          const associations = resourceProgramsRes.data.items || [];
          const programIds = associations
            .filter((a: any) => a.resourceId === resourceId)
            .map((a: any) => a.programId);

          const associatedProgs = (programsRes.data?.items || []).filter(
            (p: AcademicProgram) => programIds.includes(p.id)
          );
          setResourcePrograms(associatedProgs);
        }
      } catch (err: any) {
        console.error("Error al cargar programas:", err);
      }
    };

    if (resourceId) {
      fetchPrograms();
    }
  }, [resourceId]);

  // Inicializar selección de programas cuando se cargan
  React.useEffect(() => {
    const ids = new Set(resourcePrograms.map((p) => p.id));
    setSelectedProgramIds(ids);
  }, [resourcePrograms]);

  // Eliminar recurso
  const handleDelete = async () => {
    if (!resource) return;

    try {
      await httpClient.delete(`resources/${resource.id}`);
      router.push("/recursos");
    } catch (err: any) {
      console.error("Error al eliminar recurso:", err);
      alert(t("delete_error"));
    }
  };

  // Iniciar modo edición de programas
  const handleStartEditPrograms = () => {
    setProgramFilter("");
  };

  // Cancelar edición de programas
  const handleCancelEditPrograms = () => {
    // Restaurar selección original
    const ids = new Set(resourcePrograms.map((p) => p.id));
    setSelectedProgramIds(ids);
    setProgramFilter("");
  };

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

  // Guardar cambios en programas
  const handleSavePrograms = async () => {
    try {
      const currentIds = new Set(resourcePrograms.map((p) => p.id));
      const toAdd = Array.from(selectedProgramIds).filter(
        (id) => !currentIds.has(id)
      );
      const toRemove = Array.from(currentIds).filter(
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

      // Actualizar lista de programas del recurso
      const newResourcePrograms = allPrograms.filter((p) =>
        selectedProgramIds.has(p.id)
      );
      setResourcePrograms(newResourcePrograms);
      setProgramFilter("");
    } catch (err: any) {
      console.error("Error al guardar programas:", err);
      alert(t("save_programs_error"));
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

      {/* Reserva Rápida */}
      <Card>
        <CardHeader>
          <CardTitle>{t("quick_reserve")}</CardTitle>
          <CardDescription>{t("select_date")}</CardDescription>
        </CardHeader>
        <CardContent>
          <DatePicker
            date={selectedDate}
            onSelect={setSelectedDate}
            placeholder={t("select_date_placeholder")}
          />
          <Button
            className="w-full mt-4"
            disabled={!selectedDate}
            onClick={() => {
              if (selectedDate && resource) {
                const dateStr = selectedDate.toISOString().split("T")[0];
                router.push(
                  `/calendario?date=${dateStr}&resourceId=${resource.id}`
                );
              }
            }}
          >
            {t("continue_reserve")}
          </Button>
        </CardContent>
      </Card>
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
          <Button className="mt-4" onClick={() => router.push("/recursos")}>
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
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="font-medium text-white">{resource.name}</p>
            <p className="text-sm text-gray-400">{resource.code}</p>
          </div>
          <p className="text-sm text-gray-400">{t("delete_warning")}</p>
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
          { label: t("breadcrumbs.home"), href: "/dashboard" },
          { label: t("breadcrumbs.resources"), href: "/recursos" },
          { label: resource.name },
        ]}
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
                          locale
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
            value: "disponibilidad",
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
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { key: "hasProjector", label: "Proyector", icon: "📽️" },
                      {
                        key: "hasAirConditioning",
                        label: "Aire Acondicionado",
                        icon: "❄️",
                      },
                      {
                        key: "hasWhiteboard",
                        label: "Tablero/Pizarra",
                        icon: "📝",
                      },
                      {
                        key: "hasComputers",
                        label: "Computadores",
                        icon: "💻",
                      },
                    ].map((attr) => {
                      const hasAttribute =
                        resource.attributes?.[
                          attr.key as keyof typeof resource.attributes
                        ];
                      return (
                        <div
                          key={attr.key}
                          className={`flex items-center gap-3 p-4 rounded-lg border ${
                            hasAttribute
                              ? "border-green-500/50 bg-green-500/10"
                              : "border-[var(--color-border-subtle)] bg-gray-800/50"
                          }`}
                        >
                          <span className="text-2xl">{attr.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-[var(--color-text-primary)]">
                              {attr.label}
                            </p>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                              {hasAttribute
                                ? t("available")
                                : t("not_available")}
                            </p>
                          </div>
                          {hasAttribute ? (
                            <Badge variant="success">✓</Badge>
                          ) : (
                            <Badge variant="secondary">—</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {resource.attributes &&
                    Object.keys(resource.attributes).length === 0 && (
                      <p className="text-center text-[var(--color-text-secondary)] py-8">
                        {t("no_features")}
                      </p>
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
                            locale
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
                                resource.maintenanceSchedule.lastMaintenanceDate
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
                                resource.maintenanceSchedule.nextMaintenanceDate
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
                  <h3 className="text-xl font-semibold text-white">
                    {t("programs_title_prefix")} ({resourcePrograms.length})
                  </h3>
                </div>
                {resourcePrograms.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">
                    {t("no_programs")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {resourcePrograms.map((program) => (
                      <div
                        key={program.id}
                        className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-white">
                            {program.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {program.code} - {program.faculty}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/programas/${program.id}`)
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
        onBack={() => router.push("/recursos")}
        onEdit={() => router.push(`/recursos/${resource.id}/editar`)}
        onDelete={() => setShowDeleteModal(true)}
      />
    </MainLayout>
  );
}
