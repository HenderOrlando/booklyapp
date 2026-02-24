/**
 * CharacteristicsClient - Cliente de API para Características de Recursos
 *
 * Dominio: Resources (Características dinámicas)
 *
 * Este cliente gestiona las características que se pueden asignar a los recursos
 * consumiendo los endpoints de reference-data filtrados por el grupo 'resource_characteristic'.
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/types/api/response";
import { RESOURCES_ENDPOINTS } from "./endpoints";

export interface Characteristic {
  id: string;
  group: string;
  code: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCharacteristicDto {
  group: string;
  code: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  order?: number;
  isDefault?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateCharacteristicDto {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
  isDefault?: boolean;
  metadata?: Record<string, unknown>;
}

export class CharacteristicsClient {
  private static readonly GROUP = "resource_characteristic";

  /**
   * Obtiene todas las características del catálogo
   */
  static async getCharacteristics(
    onlyActive = false,
  ): Promise<ApiResponse<Characteristic[]>> {
    const url = `${RESOURCES_ENDPOINTS.REFERENCE_DATA}?group=${this.GROUP}${onlyActive ? "&active=true" : ""}`;
    return httpClient.get<Characteristic[]>(url);
  }

  /**
   * Obtiene una característica por ID
   */
  static async getById(id: string): Promise<ApiResponse<Characteristic>> {
    return httpClient.get<Characteristic>(
      RESOURCES_ENDPOINTS.REFERENCE_DATA_BY_ID(id),
    );
  }

  /**
   * Crea una nueva característica
   */
  static async create(
    data: Omit<CreateCharacteristicDto, "group" | "isActive">,
  ): Promise<ApiResponse<Characteristic>> {
    // El backend no permite enviar isActive en la creación.
    // Usamos esta forma para asegurar que no se incluya en el payload final
    // sin generar errores de lint por variables no usadas.
    const payload: CreateCharacteristicDto = {
      name: data.name,
      code: data.code,
      description: data.description,
      color: data.color,
      icon: data.icon,
      order: data.order,
      isDefault: data.isDefault,
      metadata: data.metadata,
      group: this.GROUP,
    };

    return httpClient.post<Characteristic>(
      RESOURCES_ENDPOINTS.REFERENCE_DATA,
      payload,
    );
  }

  /**
   * Actualiza una característica existente
   */
  static async update(
    id: string,
    data: UpdateCharacteristicDto,
  ): Promise<ApiResponse<Characteristic>> {
    return httpClient.patch<Characteristic>(
      RESOURCES_ENDPOINTS.REFERENCE_DATA_BY_ID(id),
      data,
    );
  }

  /**
   * Elimina (desactiva) una característica
   */
  static async delete(id: string): Promise<ApiResponse<Characteristic>> {
    return httpClient.delete<Characteristic>(
      RESOURCES_ENDPOINTS.REFERENCE_DATA_BY_ID(id),
    );
  }
}
