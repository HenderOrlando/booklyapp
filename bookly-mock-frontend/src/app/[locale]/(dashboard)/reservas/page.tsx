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

import { ListLayout } from "@/components/templates/ListLayout";

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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-content-tertiary">
          {tCommon("loading")}
        </p>
      </div>
    );
  }

  return (
    <>
      <ListLayout
        title={t("title")}
        badge={{ text: t("management"), variant: "secondary" }}
        onCreate={() => setShowCreateModal(true)}
        createLabel={t("create")}
        actions={
          <div className="flex items-center gap-1 bg-[var(--color-bg-muted)]/50 p-1 rounded-xl border border-[var(--color-border-subtle)]/50">
            <Button
              variant={!useVirtualScrolling ? "default" : "ghost"}
              size="sm"
              onClick={() => setUseVirtualScrolling(false)}
              className={
                !useVirtualScrolling
                  ? "h-8 px-3 rounded-lg text-xs font-bold bg-white text-brand-primary-600 shadow-sm border-none hover:bg-white transition-all"
                  : "h-8 px-3 rounded-lg text-xs font-bold text-[var(--color-text-tertiary)] hover:text-brand-primary-500 transition-all"
              }
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              {t("view_grid")}
            </Button>
            <Button
              variant={useVirtualScrolling ? "default" : "ghost"}
              size="sm"
              onClick={() => setUseVirtualScrolling(true)}
              className={
                useVirtualScrolling
                  ? "h-8 px-3 rounded-lg text-xs font-bold bg-white text-brand-primary-600 shadow-sm border-none hover:bg-white transition-all"
                  : "h-8 px-3 rounded-lg text-xs font-bold text-[var(--color-text-tertiary)] hover:text-brand-primary-500 transition-all"
              }
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              {t("view_virtual")}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
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
      </ListLayout>

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
    </>
  );
}
