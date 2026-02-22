/**
 * useRecurringReservations - Hook para gestionar reservas recurrentes
 */

import { useCreateReservation } from "@/hooks/mutations";
import { useReservations } from "@/hooks/useReservations";
import {
  describeRecurrencePattern,
  generateReservationInstances,
  validateRecurringReservations,
} from "@/lib/utils/recurring-reservations";
import type { RecurrencePattern } from "@/types/entities/recurring";
import type { CreateReservationDto } from "@/types/entities/reservation";
import { useState } from "react";

export function useRecurringReservations() {
  const createReservation = useCreateReservation();
  const { data: reservationsData } = useReservations();
  const [isCreating, setIsCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState({
    total: 0,
    created: 0,
    failed: 0,
    current: "",
  });

  /**
   * Previsualiza las instancias que se crearán
   */
  const previewInstances = (
    baseReservation: CreateReservationDto,
    pattern: RecurrencePattern
  ) => {
    const instances = generateReservationInstances(baseReservation, pattern);
    const validation = validateRecurringReservations(
      instances,
      reservationsData?.items || []
    );

    return {
      instances,
      validation,
      description: describeRecurrencePattern(pattern),
    };
  };

  /**
   * Crea todas las instancias de una reserva recurrente
   */
  const createRecurringReservations = async (
    baseReservation: CreateReservationDto,
    pattern: RecurrencePattern,
    options?: {
      skipConflicts?: boolean;
      onProgress?: (progress: {
        total: number;
        created: number;
        failed: number;
        current: string;
      }) => void;
    }
  ) => {
    setIsCreating(true);
    const instances = generateReservationInstances(baseReservation, pattern);
    const validation = validateRecurringReservations(
      instances,
      reservationsData?.items || []
    );

    // Si hay conflictos y no se permite saltarlos, lanzar error
    if (!validation.canCreate && !options?.skipConflicts) {
      setIsCreating(false);
      throw new Error(
        `No se pueden crear ${validation.failureCount} instancias por conflictos de horario. ` +
          `Se podrían crear ${validation.successCount} instancias sin conflicto.`
      );
    }

    const progress = {
      total: instances.length,
      created: 0,
      failed: 0,
      current: "",
    };

    setCreationProgress(progress);

    const results = {
      created: [] as string[],
      failed: [] as { date: string; error: string }[],
    };

    // Crear instancias una por una
    for (const instance of instances) {
      try {
        progress.current = `Creando reserva para ${instance.startDate.split("T")[0]}...`;
        setCreationProgress({ ...progress });
        options?.onProgress?.({ ...progress });

        // Verificar conflicto individual si skipConflicts está activo
        if (options?.skipConflicts) {
          const hasConflict = validation.conflicts.some(
            (c) => c.date === instance.startDate.split("T")[0]
          );
          if (hasConflict) {
            results.failed.push({
              date: instance.startDate.split("T")[0],
              error: "Conflicto de horario",
            });
            progress.failed++;
            continue;
          }
        }

        // Crear la reserva
        await createReservation.mutateAsync(instance as unknown as CreateReservationDto);
        results.created.push(instance.id);
        progress.created++;
      } catch (error) {
        results.failed.push({
          date: instance.startDate.split("T")[0],
          error: error instanceof Error ? error.message : "Error desconocido",
        });
        progress.failed++;
      }

      setCreationProgress({ ...progress });
      options?.onProgress?.({ ...progress });

      // Pequeña pausa para no saturar el servidor
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setIsCreating(false);

    return {
      success: results.created.length > 0,
      created: results.created,
      failed: results.failed,
      total: instances.length,
      summary: {
        totalCreated: results.created.length,
        totalFailed: results.failed.length,
        successRate: (results.created.length / instances.length) * 100,
      },
    };
  };

  return {
    previewInstances,
    createRecurringReservations,
    isCreating,
    creationProgress,
  };
}
