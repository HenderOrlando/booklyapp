import { useToast } from "@/hooks/useToast";
import {
  validateCheckIn as apiValidateCheckIn,
  validateCheckOut as apiValidateCheckOut,
  performCheckIn,
  performCheckOut,
} from "@/services/checkInOutClient";
import type { CheckInDto, CheckOutDto } from "@/types/entities/checkInOut";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

/**
 * useCheckInOut - Custom Hook
 *
 * Hook personalizado para manejar check-in y check-out de reservas.
 * Incluye validación, estado y manejo de errores.
 *
 * @example
 * ```tsx
 * const { checkIn, checkOut, validate, isLoading } = useCheckInOut();
 *
 * const validation = validate("res_001");
 * if (validation.canCheckIn) {
 *   checkIn.mutate({ reservationId: "res_001", method: "QR" });
 * }
 * ```
 */

export interface CheckInParams {
  reservationId: string;
  method?: "QR" | "MANUAL" | "AUTOMATIC" | "BIOMETRIC";
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface CheckOutParams {
  reservationId: string;
  notes?: string;
  rating?: number;
}

export function useCheckInOut() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const [lastCheckInId, setLastCheckInId] = React.useState<string | null>(null);

  // Mutation para check-in
  const checkIn = useMutation({
    mutationFn: async (params: CheckInParams) => {
      const checkInData: CheckInDto = {
        reservationId: params.reservationId,
        method: params.method || "MANUAL",
        notes: params.notes,
        location: params.location
          ? `${params.location.latitude},${params.location.longitude}`
          : undefined,
      };
      return await performCheckIn(checkInData);
    },
    onSuccess: (data) => {
      setLastCheckInId(data.reservationId);
      // Invalidar queries relevantes
      queryClient.invalidateQueries({ queryKey: ["user-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["active-reservations"] });
      queryClient.invalidateQueries({
        queryKey: ["check-in-history", data.reservationId],
      });
      queryClient.invalidateQueries({ queryKey: ["vigilance-alerts"] });

      // Notificación de éxito
      showSuccess("Check-in Exitoso", "El check-in se realizó correctamente");
      console.log("✅ Check-in realizado exitosamente", data);
    },
    onError: (error: any) => {
      console.error("❌ Error en check-in:", error);
      const errorMessage =
        error?.response?.data?.message || "Error al realizar check-in";
      showError("Error en Check-in", errorMessage);
      console.error(errorMessage);
    },
  });

  // Mutation para check-out
  const checkOut = useMutation({
    mutationFn: async (params: CheckOutParams) => {
      const checkOutData: CheckOutDto = {
        reservationId: params.reservationId,
        checkInId: "auto", // Se obtendrá del backend
        method: "MANUAL",
        notes: params.notes,
        // rating se puede añadir en las notas o crear un campo separado
      };
      return await performCheckOut(checkOutData);
    },
    onSuccess: (data) => {
      // Invalidar queries relevantes
      queryClient.invalidateQueries({ queryKey: ["user-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["active-reservations"] });
      queryClient.invalidateQueries({
        queryKey: ["check-in-history", data.reservationId],
      });
      queryClient.invalidateQueries({ queryKey: ["check-in-stats"] });
      queryClient.invalidateQueries({ queryKey: ["vigilance-alerts"] });

      // Notificación de éxito
      showSuccess("Check-out Exitoso", "El check-out se realizó correctamente");
      console.log("✅ Check-out realizado exitosamente", data);
    },
    onError: (error: any) => {
      console.error("❌ Error en check-out:", error);
      const errorMessage =
        error?.response?.data?.message || "Error al realizar check-out";
      showError("Error en Check-out", errorMessage);
      console.error(errorMessage);
    },
  });

  // Función asíncrona para validar si se puede hacer check-in
  const validateCheckInAction = async (reservationId: string) => {
    try {
      const result = await apiValidateCheckIn(reservationId);
      return {
        isValid: result.valid,
        canCheckIn: result.valid,
        canCheckOut: false,
        reason: result.reason,
        requiresApproval: false,
        requiresVigilance: false,
      };
    } catch (error: any) {
      console.error("❌ Error al validar check-in:", error);
      return {
        isValid: false,
        canCheckIn: false,
        canCheckOut: false,
        reason: "Error al validar la reserva",
        requiresApproval: false,
        requiresVigilance: false,
      };
    }
  };

  // Función asíncrona para validar si se puede hacer check-out
  const validateCheckOutAction = async (reservationId: string) => {
    try {
      const result = await apiValidateCheckOut(reservationId);
      return {
        isValid: result.valid,
        canCheckIn: false,
        canCheckOut: result.valid,
        reason: result.reason,
        requiresApproval: false,
        requiresVigilance: false,
      };
    } catch (error: any) {
      console.error("❌ Error al validar check-out:", error);
      return {
        isValid: false,
        canCheckIn: false,
        canCheckOut: false,
        reason: "Error al validar la reserva",
        requiresApproval: false,
        requiresVigilance: false,
      };
    }
  };

  // Estado de carga combinado
  const isLoading = checkIn.isPending || checkOut.isPending;

  // Estado de error combinado
  const error = checkIn.error || checkOut.error;

  // Limpiar último check-in ID
  const clearLastCheckIn = () => setLastCheckInId(null);

  return {
    checkIn,
    checkOut,
    validateCheckIn: validateCheckInAction,
    validateCheckOut: validateCheckOutAction,
    isLoading,
    error,
    lastCheckInId,
    clearLastCheckIn,
  };
}
