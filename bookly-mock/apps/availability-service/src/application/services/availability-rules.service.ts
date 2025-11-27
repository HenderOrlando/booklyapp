import { createLogger } from "@libs/common";
import { RedisService } from "@libs/redis";
import { Injectable } from "@nestjs/common";
import {
  AvailabilityRulesDto,
  ValidationResultDto,
} from "../../infrastructure/dtos/availability-rules.dto";
import { CreateReservationDto } from "../../infrastructure/dtos/create-reservation.dto";

/**
 * Service for managing and validating availability rules
 */
@Injectable()
export class AvailabilityRulesService {
  private readonly logger = createLogger("AvailabilityRulesService");
  private readonly CACHE_PREFIX = "availability:rules:";
  private readonly CACHE_TTL = 3600; // 1 hora

  constructor(private readonly redisService: RedisService) {}

  /**
   * Get availability rules for a resource (with cache)
   */
  async getAvailabilityRules(
    resourceId: string
  ): Promise<AvailabilityRulesDto> {
    try {
      // 1. Intentar obtener del cache
      const cacheKey = `${this.CACHE_PREFIX}${resourceId}`;
      const cached =
        await this.redisService.get<AvailabilityRulesDto>(cacheKey);

      if (cached) {
        this.logger.debug("Availability rules retrieved from cache", {
          resourceId,
        });
        return cached;
      }

      this.logger.debug("Cache miss for availability rules", { resourceId });

      // 2. Si no está en cache, usar reglas por defecto
      // En una implementación real, aquí se llamaría al resources-service via eventos
      const rules = this.getDefaultRules(resourceId);

      // 3. Guardar en cache
      await this.redisService.set(cacheKey, rules, {
        key: cacheKey,
        ttl: this.CACHE_TTL,
      });

      this.logger.info("Availability rules cached", {
        resourceId,
        ttl: this.CACHE_TTL,
      });

      return rules;
    } catch (error) {
      this.logger.error("Error getting availability rules", error as Error, {
        resourceId,
      });
      // Fallback a reglas por defecto en caso de error
      return this.getDefaultRules(resourceId);
    }
  }

  /**
   * Update cached availability rules
   */
  async updateCachedRules(
    resourceId: string,
    rules: AvailabilityRulesDto
  ): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${resourceId}`;
      await this.redisService.set(cacheKey, rules, {
        key: cacheKey,
        ttl: this.CACHE_TTL,
      });

      this.logger.info("Availability rules cache updated", {
        resourceId,
        ttl: this.CACHE_TTL,
      });
    } catch (error) {
      this.logger.error("Error updating cached rules", error as Error, {
        resourceId,
      });
    }
  }

  /**
   * Invalidate cached rules for a resource
   */
  async invalidateCachedRules(resourceId: string): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${resourceId}`;
      await this.redisService.del(cacheKey);

      this.logger.info("Availability rules cache invalidated", { resourceId });
    } catch (error) {
      this.logger.error("Error invalidating cached rules", error as Error, {
        resourceId,
      });
    }
  }

  /**
   * Validate reservation against availability rules
   */
  async validateReservation(
    resourceId: string,
    reservationData: CreateReservationDto
  ): Promise<ValidationResultDto> {
    try {
      const rules = await this.getAvailabilityRules(resourceId);
      const errors: string[] = [];
      const warnings: string[] = [];

      const startDate = new Date(reservationData.startDate);
      const endDate = new Date(reservationData.endDate);
      const now = new Date();

      // 1. Validar anticipación
      const advanceDays = Math.ceil(
        (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (advanceDays > rules.maxAdvanceBookingDays) {
        errors.push(
          `Anticipación excedida. Máximo permitido: ${rules.maxAdvanceBookingDays} días`
        );
      }

      if (advanceDays < 0) {
        errors.push("No se pueden crear reservas con fecha pasada");
      }

      // 2. Validar duración
      const durationMinutes = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60)
      );

      if (durationMinutes < rules.minBookingDurationMinutes) {
        errors.push(
          `Duración mínima no cumplida. Mínimo: ${rules.minBookingDurationMinutes} minutos`
        );
      }

      if (durationMinutes > rules.maxBookingDurationMinutes) {
        errors.push(
          `Duración máxima excedida. Máximo: ${rules.maxBookingDurationMinutes} minutos`
        );
      }

      // 3. Validar reglas personalizadas
      if (rules.customRules) {
        // Business hours only
        if (rules.customRules.businessHoursOnly) {
          const startHour = startDate.getHours();
          const endHour = endDate.getHours();

          if (startHour < 7 || startHour > 18 || endHour < 7 || endHour > 19) {
            errors.push(
              "Solo se permiten reservas en horario laboral (7:00 - 19:00)"
            );
          }
        }

        // Weekdays only
        if (rules.customRules.weekdaysOnly) {
          const startDay = startDate.getDay();
          const endDay = endDate.getDay();

          if (
            startDay === 0 ||
            startDay === 6 ||
            endDay === 0 ||
            endDay === 6
          ) {
            errors.push(
              "Solo se permiten reservas entre semana (Lunes-Viernes)"
            );
          }
        }

        // Cancellation deadline
        if (rules.customRules.cancellationDeadlineHours) {
          warnings.push(
            `Recuerda: solo puedes cancelar hasta ${rules.customRules.cancellationDeadlineHours} horas antes`
          );
        }
      }

      // 4. Validar aprobación requerida
      if (rules.requiresApproval) {
        warnings.push(
          "Este recurso requiere aprobación. La reserva quedará pendiente hasta su aprobación."
        );
      }

      // 5. Validar reservas recurrentes
      if (reservationData.isRecurring && !rules.allowRecurring) {
        errors.push("Este recurso no permite reservas recurrentes");
      }

      const result: ValidationResultDto = {
        isValid: errors.length === 0,
        errors,
        warnings: warnings.length > 0 ? warnings : undefined,
      };

      this.logger.debug("Reservation validation completed", {
        resourceId,
        isValid: result.isValid,
        errorsCount: errors.length,
        warningsCount: warnings.length,
      });

      return result;
    } catch (error) {
      this.logger.error("Error validating reservation", error as Error, {
        resourceId,
      });

      return {
        isValid: false,
        errors: ["Error al validar la reserva. Intente nuevamente."],
      };
    }
  }

  /**
   * Get default availability rules (fallback)
   */
  private getDefaultRules(resourceId: string): AvailabilityRulesDto {
    this.logger.warn("Using default availability rules", { resourceId });

    return {
      resourceId,
      requiresApproval: false,
      maxAdvanceBookingDays: 30,
      minBookingDurationMinutes: 30,
      maxBookingDurationMinutes: 240,
      allowRecurring: true,
      customRules: {
        businessHoursOnly: true,
        weekdaysOnly: false,
        maxConcurrentBookings: 1,
        requiresConfirmation: false,
        cancellationDeadlineHours: 24,
      },
    };
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalCached: number;
    keys: string[];
  }> {
    try {
      const pattern = `${this.CACHE_PREFIX}*`;
      const keys = await this.redisService.keys(pattern);

      return {
        totalCached: keys.length,
        keys,
      };
    } catch (error) {
      this.logger.error("Error getting cache stats", error as Error);
      return {
        totalCached: 0,
        keys: [],
      };
    }
  }

  /**
   * Clear all cached rules
   */
  async clearAllCache(): Promise<void> {
    try {
      const pattern = `${this.CACHE_PREFIX}*`;
      const keys = await this.redisService.keys(pattern);

      if (keys.length > 0) {
        await this.redisService.delMany(keys);
        this.logger.info("All cached rules cleared", { count: keys.length });
      }
    } catch (error) {
      this.logger.error("Error clearing cache", error as Error);
    }
  }
}
