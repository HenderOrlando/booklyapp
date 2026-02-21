import { useToast } from "@/hooks/useToast";
import { CheckInClient } from "@/infrastructure/api/check-in-client";
import type { CheckInDto, CheckOutDto } from "@/types/entities/checkInOut";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

/**
 * useCheckInOut - Custom Hook
 *
 * Hook personalizado para manejar check-in y check-out de reservas.
 * Incluye validación, estado y manejo de errores.
 */

export interface CheckInParams {
  reservationId: string;
  method?: "QR" | "MANUAL" | "AUTOMATIC" | "BIOMETRIC";
  notes?: string;
  location?: string;
  vigilantId?: string;
}

export interface CheckOutParams {
  reservationId: string;
  checkInId?: string;
  method?: "QR" | "MANUAL" | "AUTOMATIC" | "BIOMETRIC";
  condition?: "GOOD" | "FAIR" | "POOR" | "DAMAGED";
  issues?: string[];
  notes?: string;
  vigilantId?: string;
}

export function useCheckInOut() {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const [lastCheckInId, setLastCheckInId] = React.useState<string | null>(null);

  // Mutation para check-in
  const checkIn = useMutation({
    mutationFn: async (params: CheckInParams) => {
      const checkInData: CheckInDto = {
        reservationId: params.reservationId,
        method: params.method || "MANUAL",
        notes: params.notes,
        location: params.location,
        vigilantId: params.vigilantId,
      };
      const response = await CheckInClient.checkIn(checkInData);
      return response.data;
    },
    onSuccess: (data) => {
      setLastCheckInId(data.id);
      
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
    onError: (error: Error & { mapped?: { fallbackMessage: string } }) => {
      console.error("❌ Error en check-in:", error);
      const errorMessage = error.mapped?.fallbackMessage || error.message || "Error al realizar check-in";
      showError("Error en Check-in", errorMessage);
    },
  });

  // Mutation para check-out
  const checkOut = useMutation({
    mutationFn: async (params: CheckOutParams) => {
      const checkOutData: CheckOutDto = {
        reservationId: params.reservationId,
        checkInId: params.checkInId || "auto", // Idealmente el backend lo infiere desde la reserva activa
        method: params.method || "MANUAL",
        notes: params.notes,
        condition: params.condition,
        issues: params.issues,
        vigilantId: params.vigilantId,
      };
      const response = await CheckInClient.checkOut(checkOutData);
      return response.data;
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
    onError: (error: Error & { mapped?: { fallbackMessage: string } }) => {
      console.error("❌ Error en check-out:", error);
      const errorMessage = error.mapped?.fallbackMessage || error.message || "Error al realizar check-out";
      showError("Error en Check-out", errorMessage);
    },
  });

  // Función asíncrona para validar si se puede hacer check-in
  const validateCheckInAction = async (_reservationId: string) => {
    try {
      // Ahora delegamos esta validación al backend mediante un try-catch de fetch inicial
      // o se puede crear un endpoint específico en CheckInClient. 
      // Por ahora simulamos que siempre es válido a menos que falle.
      return {
        isValid: true,
        canCheckIn: true,
        canCheckOut: false,
        reason: "",
        requiresApproval: false,
        requiresVigilance: false,
      };
    } catch (error) {
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
  const validateCheckOutAction = async (_reservationId: string) => {
    try {
      return {
        isValid: true,
        canCheckIn: false,
        canCheckOut: true,
        reason: "",
        requiresApproval: false,
        requiresVigilance: false,
      };
    } catch (error) {
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
