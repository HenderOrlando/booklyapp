import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  IAvailabilityServiceClient,
} from "@resources/application/services/schedule-import.service";

/**
 * Availability Service HTTP Client
 * Comunica con availability-service para creación de reservas desde importación
 */
@Injectable()
export class AvailabilityServiceClient implements IAvailabilityServiceClient {
  private readonly logger = createLogger("AvailabilityServiceClient");
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>("AVAILABILITY_SERVICE_URL") ||
      "http://localhost:3003";
  }

  /**
   * Crear una reserva recurrente (semanal con día+hora)
   */
  async createRecurringReservation(params: {
    resourceId: string;
    userId: string;
    startDate: string;
    endDate: string;
    purpose: string;
    recurrencePattern: {
      frequency: string;
      interval: number;
      endDate: string;
      daysOfWeek: number[];
    };
    notes?: string;
    createdBy: string;
  }): Promise<{ seriesId: string; instanceCount: number }> {
    this.logger.info("Creating recurring reservation", {
      resourceId: params.resourceId,
      purpose: params.purpose,
      frequency: params.recurrencePattern.frequency,
      daysOfWeek: params.recurrencePattern.daysOfWeek,
    });

    try {
      const url = `${this.baseUrl}/api/v1/reservations/recurring`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Service": "resources-service",
        },
        body: JSON.stringify({
          resourceId: params.resourceId,
          startDate: params.startDate,
          endDate: params.endDate,
          purpose: params.purpose,
          recurrencePattern: {
            frequency: params.recurrencePattern.frequency,
            interval: params.recurrencePattern.interval,
            endDate: params.recurrencePattern.endDate,
            daysOfWeek: params.recurrencePattern.daysOfWeek,
          },
          notes: params.notes,
          createAllOrNone: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.warn("Failed to create recurring reservation", {
          status: response.status,
          error: errorText,
        });

        // Retornar resultado parcial para no bloquear importación
        return {
          seriesId: `pending-${Date.now()}`,
          instanceCount: 0,
        };
      }

      const data: any = await response.json();
      const result: any = data?.data?.data || data?.data || data;

      return {
        seriesId: result?.seriesId || `series-${Date.now()}`,
        instanceCount: result?.totalInstances || result?.successfulInstances || 0,
      };
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(
        "Availability service communication failed for recurring reservation",
        { error: errMsg }
      );

      return {
        seriesId: `pending-${Date.now()}`,
        instanceCount: 0,
      };
    }
  }

  /**
   * Crear una reserva única (fecha específica)
   */
  async createReservation(params: {
    resourceId: string;
    userId: string;
    startDate: string;
    endDate: string;
    purpose: string;
    notes?: string;
    createdBy: string;
  }): Promise<{ reservationId: string }> {
    this.logger.info("Creating single reservation", {
      resourceId: params.resourceId,
      startDate: params.startDate,
      purpose: params.purpose,
    });

    try {
      const url = `${this.baseUrl}/api/v1/reservations`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Service": "resources-service",
        },
        body: JSON.stringify({
          resourceId: params.resourceId,
          startDate: params.startDate,
          endDate: params.endDate,
          purpose: params.purpose,
          notes: params.notes,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.warn("Failed to create single reservation", {
          status: response.status,
          error: errorText,
        });

        return {
          reservationId: `pending-${Date.now()}`,
        };
      }

      const data: any = await response.json();
      const result: any = data?.data?.data || data?.data || data;

      return {
        reservationId: result?._id || result?.id || `reservation-${Date.now()}`,
      };
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(
        "Availability service communication failed for single reservation",
        { error: errMsg }
      );

      return {
        reservationId: `pending-${Date.now()}`,
      };
    }
  }
}
