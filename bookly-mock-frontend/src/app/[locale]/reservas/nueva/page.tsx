"use client";

import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { ReservationModal } from "@/components/organisms/ReservationModal";
import { useCreateReservation } from "@/hooks/mutations";
import { useResources } from "@/hooks/useResources";
import type { CreateReservationDto } from "@/types/entities/reservation";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Página Nueva Reserva
 *
 * Muestra el modal de creación de reserva.
 * Los recursos se cargan desde el servicio mock.
 */

export default function NuevaReservaPage() {
  const t = useTranslations("reservations");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Hook de React Query para crear reserva
  const createReservation = useCreateReservation();
  const { data: resourcesData } = useResources();
  const allResources = resourcesData?.items || [];

  // Detectar desde dónde se llamó
  const from = searchParams.get("from") || "reservas";

  const handleSave = async (data: CreateReservationDto) => {
    createReservation.mutate(data, {
      onSuccess: () => {
        // Redirigir según el origen
        const redirectTo = from === "calendario" ? "/calendario" : "/reservas";
        router.push(redirectTo);
      },
      onError: (error) => {
        console.error("Error al crear reserva:", error);
        // Aquí podrías mostrar un toast/notification de error
      },
    });
  };

  const handleClose = () => {
    // Redirigir según el origen
    const redirectTo = from === "calendario" ? "/calendario" : "/reservas";
    router.push(redirectTo);
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-secondary)]">
      <AppSidebar />
      <div className="flex-1">
        <AppHeader />
        <main className="p-6">
          <ReservationModal
            isOpen={true}
            onClose={handleClose}
            onSave={handleSave}
            resources={allResources as any}
            mode="create"
            loading={createReservation.isPending}
          />
        </main>
      </div>
    </div>
  );
}
