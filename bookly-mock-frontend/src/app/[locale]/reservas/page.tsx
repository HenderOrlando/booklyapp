"use client";

import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { EmptyState } from "@/components/atoms/EmptyState";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { ReservationCard } from "@/components/molecules/ReservationCard";
import { ReservationModal } from "@/components/organisms/ReservationModal";
import { VirtualizedList } from "@/components/organisms/VirtualizedList";
import { MainLayout } from "@/components/templates/MainLayout";
import {
  useCancelReservation,
  useCreateReservation,
  useUpdateReservation,
} from "@/hooks/mutations";
import { useReservations, useReservationStats } from "@/hooks/useReservations";
import { useRouter } from "@/i18n/navigation";
import { mockResourcesForReservations } from "@/infrastructure/mock/data/reservations-service.mock";
import type { Resource } from "@/types/entities/resource";
import type {
  CreateReservationDto,
  Reservation,
  ReservationStatus,
} from "@/types/entities/reservation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { ReservationFiltersSection, ReservationStatsCards } from "./components";

/**
 * Página de Reservas
 *
 * Listado completo de reservas con:
 * - Búsqueda por título
 * - Filtros por estado
 * - FilterChips integrado
 * - EmptyState cuando no hay datos
 * - Acciones para ver, editar, cancelar
 */

export default function ReservasPage() {
  const router = useRouter();
  const t = useTranslations("reservations");
  const tCommon = useTranslations("common");

  // Estados locales
  const [filter, setFilter] = useState("");
  const debouncedFilter = useDebounce(filter, 500);
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">(
    "all",
  );
  const [useVirtualScrolling, setUseVirtualScrolling] = useState(true);
  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filtros para API
  const apiFilters: import("@/infrastructure/api/reservations-client").ReservationSearchFilters = {
    ...(debouncedFilter ? { search: debouncedFilter } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter as import("@/infrastructure/api/reservations-client").BackendReservationStatus } : {}),
  };

  const { data: reservationsData, isLoading: loadingReservations } =
    useReservations(apiFilters);
  const reservations: Reservation[] = reservationsData?.items || [];

  // React Query para estadísticas
  const { data: statsData, isLoading: loadingStats } = useReservationStats();

  const loading = loadingReservations || loadingStats;

  // Mutations
  const createReservation = useCreateReservation();
  const updateReservation = useUpdateReservation();
  const cancelReservation = useCancelReservation();

  // Handlers
  const handleView = (id: string) => {
    router.push(`/reservas/${id}`);
  };

  const handleEdit = (id: string) => {
    const reservation = reservations.find((r: Reservation) => r.id === id);
    if (reservation) {
      setEditingReservation(reservation);
    }
  };

  const handleSaveEdit = (data: CreateReservationDto) => {
    if (!editingReservation) return;

    updateReservation.mutate(
      {
        id: editingReservation.id,
        data: data,
      },
      {
        onSuccess: () => {
          setEditingReservation(null);
        },
        onError: (error) => {
          console.error("Error al actualizar reserva:", error);
        },
      },
    );
  };

  const handleCreateReservation = (data: CreateReservationDto) => {
    createReservation.mutate(data, {
      onSuccess: () => {
        setShowCreateModal(false);
      },
      onError: (error) => {
        console.error("Error al crear reserva:", error);
      },
    });
  };

  const handleCancel = (id: string) => {
    cancelReservation.mutate(id, {
      onError: (error) => {
        console.error("Error al cancelar reserva:", error);
      },
    });
  };

  const handleClearFilters = () => {
    setFilter("");
    setStatusFilter("all");
  };

  const hasActiveFilters = filter || statusFilter !== "all";

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-[var(--color-text-tertiary)]">
            {tCommon("loading")}
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header de página */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
              {t("title")}
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-1">
              {t("management")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUseVirtualScrolling(!useVirtualScrolling)}
            >
              {useVirtualScrolling ? t("view_grid") : t("view_virtual")}
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              {t("create")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <ReservationStatsCards stats={statsData} />

        {/* Card con contenido */}
        <Card>
          <CardHeader>
            <CardTitle>{t("list")}</CardTitle>
            <CardDescription>
              {t("showing_count", { count: reservations.length })}
            </CardDescription>

            {/* Filtros */}
            <div className="mt-4">
              <ReservationFiltersSection
                filter={filter}
                statusFilter={statusFilter}
                onFilterChange={setFilter}
                onStatusFilterChange={setStatusFilter}
                onClearFilters={handleClearFilters}
              />
            </div>
          </CardHeader>

          <CardContent>
            {reservations.length === 0 ? (
              <EmptyState
                title={t("no_results_title")}
                description={
                  hasActiveFilters ? t("no_results_desc") : t("empty_desc")
                }
                action={
                  hasActiveFilters ? (
                    <Button onClick={handleClearFilters}>
                      {tCommon("clear_filters")}
                    </Button>
                  ) : (
                    <Button onClick={() => setShowCreateModal(true)}>
                      {t("create_action")}
                    </Button>
                  )
                }
              />
            ) : useVirtualScrolling ? (
              <VirtualizedList
                items={reservations}
                renderItem={(reservation: Reservation) => (
                  <div className="p-4 border-b border-[var(--color-border-strong)] hover:bg-[var(--color-bg-primary)]/50 transition-colors">
                    <ReservationCard
                      reservation={reservation}
                      onView={handleView}
                      onEdit={handleEdit}
                      onCancel={handleCancel}
                      showActions
                    />
                  </div>
                )}
                onItemClick={(reservation: Reservation) =>
                  handleView(reservation.id)
                }
                itemHeight={180}
                containerHeight="600px"
                isLoading={loading}
                emptyMessage={t("no_results_title")}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reservations.map((reservation: Reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onView={handleView}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    showActions
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edición */}
      {editingReservation && (
        <ReservationModal
          isOpen={true}
          onClose={() => setEditingReservation(null)}
          onSave={handleSaveEdit}
          resources={mockResourcesForReservations as Resource[]}
          reservation={editingReservation}
          mode="edit"
          loading={updateReservation.isPending}
        />
      )}

      {/* Modal de Creación */}
      {showCreateModal && (
        <ReservationModal
          isOpen={true}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateReservation}
          resources={mockResourcesForReservations as Resource[]}
          mode="create"
          loading={createReservation.isPending}
        />
      )}
    </MainLayout>
  );
}
