/**
 * useAvailability - Hooks para Gestión de Disponibilidad
 *
 * Cubre los controladores del backend Availability Service:
 * - AvailabilitiesController (RF-07: Configurar disponibilidad)
 * - AvailabilityExceptionsController (días festivos, cierres)
 * - MaintenanceBlocksController (bloqueos por mantenimiento)
 */

import {
  AvailabilityClient,
  type AvailabilityException,
  type AvailabilityRecord,
  type AvailabilitySlot,
  type CreateAvailabilityDto,
  type CreateAvailabilityExceptionDto,
  type CreateMaintenanceBlockDto,
  type MaintenanceBlock,
  type SearchAvailabilityDto,
} from "@/infrastructure/api/availability-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================
// CACHE KEYS
// ============================================

export const availabilityKeys = {
  all: ["availability"] as const,
  byResource: (resourceId: string) =>
    [...availabilityKeys.all, "resource", resourceId] as const,
  search: (filters?: SearchAvailabilityDto) =>
    [...availabilityKeys.all, "search", filters] as const,

  exceptions: () => [...availabilityKeys.all, "exceptions"] as const,
  exceptionsByResource: (resourceId: string) =>
    [...availabilityKeys.exceptions(), "resource", resourceId] as const,

  maintenanceBlocks: () => [...availabilityKeys.all, "maintenance-blocks"] as const,
  maintenanceBlocksByResource: (resourceId: string) =>
    [...availabilityKeys.maintenanceBlocks(), "resource", resourceId] as const,
  activeMaintenanceBlocks: () =>
    [...availabilityKeys.maintenanceBlocks(), "active"] as const,
};

// ============================================
// AVAILABILITY QUERIES
// ============================================

export function useAvailabilitiesByResource(resourceId: string) {
  return useQuery<AvailabilityRecord[]>({
    queryKey: availabilityKeys.byResource(resourceId),
    queryFn: async () => {
      const response = await AvailabilityClient.getByResource(resourceId);
      if (!response.success || !response.data) {
        return [];
      }
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === "object" && "items" in data) {
        return (data as Record<string, unknown>).items as AvailabilityRecord[];
      }
      return [];
    },
    enabled: !!resourceId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearchAvailability(filters?: SearchAvailabilityDto) {
  return useQuery<AvailabilitySlot[]>({
    queryKey: availabilityKeys.search(filters),
    queryFn: async () => {
      if (!filters) return [];
      const response = await AvailabilityClient.searchAvailability(filters);
      return response.data || [];
    },
    enabled: !!filters?.startDate && !!filters?.endDate,
    staleTime: 1000 * 30,
  });
}

// ============================================
// AVAILABILITY MUTATIONS
// ============================================

export function useCreateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAvailabilityDto) => {
      const response = await AvailabilityClient.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al crear disponibilidad");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.byResource(variables.resourceId),
      });
    },
  });
}

export function useDeleteAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await AvailabilityClient.delete(id);
      if (!response.success) {
        throw new Error(response.message || "Error al eliminar disponibilidad");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
    },
  });
}

// ============================================
// EXCEPTION QUERIES
// ============================================

export function useAvailabilityExceptions(filters?: {
  resourceId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<AvailabilityException[]>({
    queryKey: [...availabilityKeys.exceptions(), filters],
    queryFn: async () => {
      const response = await AvailabilityClient.getExceptions(filters);
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useAvailabilityExceptionsByResource(resourceId: string) {
  return useQuery<AvailabilityException[]>({
    queryKey: availabilityKeys.exceptionsByResource(resourceId),
    queryFn: async () => {
      const response =
        await AvailabilityClient.getExceptionsByResource(resourceId);
      return response.data || [];
    },
    enabled: !!resourceId,
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================
// EXCEPTION MUTATIONS
// ============================================

export function useCreateAvailabilityException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAvailabilityExceptionDto) => {
      const response = await AvailabilityClient.createException(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al crear excepción");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.exceptions(),
      });
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.exceptionsByResource(variables.resourceId),
      });
    },
  });
}

export function useDeleteAvailabilityException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await AvailabilityClient.deleteException(id);
      if (!response.success) {
        throw new Error(response.message || "Error al eliminar excepción");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.exceptions(),
      });
    },
  });
}

// ============================================
// MAINTENANCE BLOCKS QUERIES
// ============================================

export function useMaintenanceBlocks() {
  return useQuery<MaintenanceBlock[]>({
    queryKey: availabilityKeys.maintenanceBlocks(),
    queryFn: async () => {
      const response = await AvailabilityClient.getMaintenanceBlocks();
      return response.data || [];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useMaintenanceBlocksByResource(resourceId: string) {
  return useQuery<MaintenanceBlock[]>({
    queryKey: availabilityKeys.maintenanceBlocksByResource(resourceId),
    queryFn: async () => {
      const response =
        await AvailabilityClient.getMaintenanceBlocksByResource(resourceId);
      return response.data || [];
    },
    enabled: !!resourceId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useActiveMaintenanceBlocks() {
  return useQuery<MaintenanceBlock[]>({
    queryKey: availabilityKeys.activeMaintenanceBlocks(),
    queryFn: async () => {
      const response = await AvailabilityClient.getActiveMaintenanceBlocks();
      return response.data || [];
    },
    staleTime: 1000 * 60,
  });
}

// ============================================
// MAINTENANCE BLOCKS MUTATIONS
// ============================================

export function useCreateMaintenanceBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMaintenanceBlockDto) => {
      const response = await AvailabilityClient.createMaintenanceBlock(data);
      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Error al crear bloqueo de mantenimiento",
        );
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.maintenanceBlocks(),
      });
    },
  });
}

export function useCompleteMaintenanceBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const response = await AvailabilityClient.completeMaintenanceBlock(
        id,
        notes,
      );
      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Error al completar bloqueo de mantenimiento",
        );
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.maintenanceBlocks(),
      });
    },
  });
}

export function useCancelMaintenanceBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await AvailabilityClient.cancelMaintenanceBlock(
        id,
        reason,
      );
      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Error al cancelar bloqueo de mantenimiento",
        );
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.maintenanceBlocks(),
      });
    },
  });
}
