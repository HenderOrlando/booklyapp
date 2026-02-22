"use client";

import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { DurationBadge } from "@/components/atoms/DurationBadge";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { InfoField } from "@/components/molecules/InfoField";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { ReservationModal } from "@/components/organisms/ReservationModal";
import { useCancelReservation, useUpdateReservation } from "@/hooks/mutations";
import { useReservation } from "@/hooks/useReservations";
import { mockResourcesForReservations } from "@/infrastructure/mock/data/reservations-service.mock";
import type { CreateReservationDto } from "@/types/entities/reservation";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Página de Detalle de Reserva
 *
 * Muestra toda la información de una reserva específica.
 * Permite editar y cancelar la reserva.
 */

export default function ReservaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const _t = useTranslations("reservations");
  const router = useRouter();
  const _queryClient = useQueryClient();

  // React Query para cargar reserva
  const { data: reservation, isLoading: loading } = useReservation(resolvedParams.id);

  // Mutations
  const updateReservation = useUpdateReservation();
  const cancelReservation = useCancelReservation();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // useReservation se encarga de cargar los datos automáticamente

  // Calcular duración en minutos
  const calculateDuration = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  };

  // Formatear fecha y hora
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(date);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "long",
    }).format(date);
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      timeStyle: "short",
    }).format(date);
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleUpdate = async (data: CreateReservationDto) => {
    updateReservation.mutate(
      { id: resolvedParams.id, data },
      {
        onSuccess: () => {
          setShowEditModal(false);
          // El cache se actualiza automáticamente
        },
        onError: (error) => {
          console.error("Error al actualizar reserva:", error);
        },
      }
    );
  };

  const handleCancel = async () => {
    cancelReservation.mutate(resolvedParams.id, {
      onSuccess: () => {
        setShowCancelDialog(false);
        // El cache se actualiza automáticamente
      },
      onError: (error) => {
        console.error("Error al cancelar reserva:", error);
      },
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex-1">
          <AppHeader />
          <main className="p-6 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </main>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="flex min-h-screen bg-[var(--color-bg-secondary)]">
        <AppSidebar />
        <div className="flex-1">
          <AppHeader />
          <main className="p-6">
            <Card>
              <CardContent className="text-center py-12">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                  Reserva no encontrada
                </h2>
                <p className="text-[var(--color-text-secondary)] mb-6">
                  La reserva que buscas no existe o ha sido eliminada.
                </p>
                <Button onClick={() => router.push("/reservas")}>
                  Volver al Listado
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const canEdit =
    reservation.status === "PENDING" || reservation.status === "CONFIRMED";
  const canCancel =
    reservation.status !== "CANCELLED" && reservation.status !== "COMPLETED";

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-secondary)]">
      <AppSidebar />
      <div className="flex-1">
        <AppHeader />
        <main className="p-6">
          <div className="mb-6">
            <Button variant="outline" onClick={() => router.push("/reservas")}>
              ← Volver al Listado
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle>{reservation.title}</CardTitle>
                    <StatusBadge
                      type="reservation"
                      status={reservation.status}
                    />
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    ID: {reservation.id}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  {canEdit && <Button onClick={handleEdit}>Editar</Button>}
                  {canCancel && (
                    <Button
                      variant="outline"
                      onClick={() => setShowCancelDialog(true)}
                    >
                      Cancelar Reserva
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Información del Recurso */}
              <section>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                  Recurso
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField
                    label="Nombre del Recurso"
                    value={
                      reservation.resourceName ||
                      `Recurso #${reservation.resourceId}`
                    }
                  />
                  <InfoField
                    label="ID del Recurso"
                    value={reservation.resourceId}
                  />
                </div>
              </section>

              {/* Información de Fechas y Horarios */}
              <section>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                  Fechas y Horarios
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField
                    label="Fecha de Inicio"
                    value={formatDate(reservation.startDate)}
                  />
                  <InfoField
                    label="Hora de Inicio"
                    value={formatTime(reservation.startDate)}
                  />
                  <InfoField
                    label="Fecha de Fin"
                    value={formatDate(reservation.endDate)}
                  />
                  <InfoField
                    label="Hora de Fin"
                    value={formatTime(reservation.endDate)}
                  />
                </div>

                {/* Duración */}
                <div className="mt-4">
                  <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                    Duración Total
                  </p>
                  <DurationBadge
                    minutes={calculateDuration(
                      reservation.startDate,
                      reservation.endDate
                    )}
                  />
                </div>

                {/* Recurrencia */}
                {reservation.recurrenceType &&
                  reservation.recurrenceType !== "NONE" && (
                    <div className="mt-4 p-4 bg-[var(--color-bg-secondary)] rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoField
                          label="Tipo de Recurrencia"
                          value={reservation.recurrenceType}
                        />
                        {reservation.recurrenceEndDate && (
                          <InfoField
                            label="Repetir Hasta"
                            value={formatDate(reservation.recurrenceEndDate)}
                          />
                        )}
                      </div>
                    </div>
                  )}
              </section>

              {/* Información del Solicitante */}
              <section>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                  Solicitante
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField
                    label="Nombre"
                    value={reservation.userName || "N/A"}
                  />
                  <InfoField
                    label="Correo"
                    value={reservation.userEmail || "N/A"}
                  />
                  {reservation.attendees && (
                    <InfoField
                      label="Número de Asistentes"
                      value={reservation.attendees.toString()}
                    />
                  )}
                </div>
              </section>

              {/* Descripción y Notas */}
              {(reservation.description || reservation.notes) && (
                <section>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                    Detalles Adicionales
                  </h3>
                  {reservation.description && (
                    <InfoField
                      label="Descripción"
                      value={reservation.description}
                    />
                  )}
                  {reservation.notes && (
                    <InfoField
                      label="Notas"
                      value={reservation.notes}
                      className="mt-4"
                    />
                  )}
                </section>
              )}

              {/* Información de Aprobación */}
              {(reservation.approvedBy || reservation.rejectedReason) && (
                <section>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                    Información de Aprobación
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reservation.approvedBy && (
                      <InfoField
                        label="Aprobado Por"
                        value={reservation.approvedBy}
                      />
                    )}
                    {reservation.approvedAt && (
                      <InfoField
                        label="Fecha de Aprobación"
                        value={formatDateTime(reservation.approvedAt)}
                      />
                    )}
                    {reservation.rejectedReason && (
                      <InfoField
                        label="Razón de Rechazo"
                        value={reservation.rejectedReason}
                      />
                    )}
                  </div>
                </section>
              )}

              {/* Metadatos */}
              <section className="pt-4 border-t border-[var(--color-border-subtle)]">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                  Información del Sistema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField
                    label="Fecha de Creación"
                    value={formatDateTime(reservation.createdAt)}
                  />
                  <InfoField
                    label="Última Actualización"
                    value={formatDateTime(reservation.updatedAt)}
                  />
                </div>
              </section>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Dialog de Confirmación */}
      <ConfirmDialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancel}
        title="Cancelar Reserva"
        description="¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer."
        confirmText={
          cancelReservation.isPending ? "Cancelando..." : "Sí, Cancelar"
        }
        cancelText="No, Volver"
        variant="destructive"
        loading={cancelReservation.isPending}
      />

      {/* Modal de Edición */}
      {reservation && showEditModal && (
        <ReservationModal
          isOpen={true}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdate}
          resources={mockResourcesForReservations as any}
          reservation={reservation}
          mode="edit"
          loading={updateReservation.isPending}
        />
      )}
    </div>
  );
}
