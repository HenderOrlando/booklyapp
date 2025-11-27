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
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { ReservationModal } from "@/components/organisms/ReservationModal";
import { VirtualizedList } from "@/components/organisms/VirtualizedList";
import { MainLayout } from "@/components/templates/MainLayout";
import {
  useCancelReservation,
  useCreateReservation,
  useUpdateReservation,
} from "@/hooks/mutations";
import { reservationKeys } from "@/hooks/useReservations";
import { useRouter } from "@/i18n/navigation";
import { ReservationsClient } from "@/infrastructure/api";
import { mockResourcesForReservations } from "@/infrastructure/mock/data/reservations-service.mock";
import type {
  CreateReservationDto,
  Reservation,
  ReservationStatus,
} from "@/types/entities/reservation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
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

  // React Query para cargar reservas
  const { data: reservations = [], isLoading: loading } = useQuery({
    queryKey: reservationKeys.all,
    queryFn: async () => {
      const response = await ReservationsClient.getAll();
      return response.data?.items || [];
    },
    staleTime: 1000 * 60 * 3, // 3 minutos
  });

  // Mutations
  const createReservation = useCreateReservation();
  const updateReservation = useUpdateReservation();
  const cancelReservation = useCancelReservation();

  // Estados locales
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">(
    "all"
  );
  const [useVirtualScrolling, setUseVirtualScrolling] = useState(true);
  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // React Query maneja el fetch automáticamente

  // Filtrar reservas
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.title.toLowerCase().includes(filter.toLowerCase()) ||
      reservation.resourceName?.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || reservation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleView = (id: string) => {
    router.push(`/reservas/${id}`);
  };

  const handleEdit = (id: string) => {
    const reservation = reservations.find((r) => r.id === id);
    if (reservation) {
      setEditingReservation(reservation);
    }
  };

  const handleSaveEdit = (data: CreateReservationDto) => {
    if (!editingReservation) return;

    updateReservation.mutate(
      {
        id: editingReservation.id,
        data: data as any,
      },
      {
        onSuccess: () => {
          setEditingReservation(null);
        },
        onError: (error) => {
          console.error("Error al actualizar reserva:", error);
        },
      }
    );
  };

  const handleCreateReservation = (data: CreateReservationDto) => {
    createReservation.mutate(data as any, {
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

  // Usar componentes compartidos de Header y Sidebar
  const header = <AppHeader title="Reservas" />;
  const sidebar = <AppSidebar />;

  if (loading) {
    return (
      <MainLayout header={header} sidebar={sidebar}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-400">{tCommon("loading")}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout header={header} sidebar={sidebar}>
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
        <ReservationStatsCards reservations={reservations} />

        {/* Card con contenido */}
        <Card>
          <CardHeader>
            <CardTitle>{t("list")}</CardTitle>
            <CardDescription>
              {t("showing_count", { count: filteredReservations.length })}
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
            {filteredReservations.length === 0 ? (
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
                items={filteredReservations}
                renderItem={(reservation: Reservation, index: number) => (
                  <div className="p-4 border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
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
                {filteredReservations.map((reservation) => (
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
          resources={mockResourcesForReservations as any}
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
          resources={mockResourcesForReservations as any}
          mode="create"
          loading={createReservation.isPending}
        />
      )}
    </MainLayout>
  );
}
