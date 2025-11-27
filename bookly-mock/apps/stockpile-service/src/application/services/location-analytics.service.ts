import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { CheckInOutService } from "./check-in-out.service";
import { GeolocationService } from "./geolocation.service";

const logger = createLogger("LocationAnalyticsService");

/**
 * Location Analytics
 */
export interface LocationAnalytics {
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  totalCheckIns: number;
  uniqueUsers: Set<string>;
  avgDuration: number; // Duración promedio en ms
  peakHours: number[]; // Horas pico (0-23)
  resources: Set<string>;
  usageByDay: Map<string, number>; // YYYY-MM-DD -> count
}

/**
 * Heatmap Point
 */
export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number; // Número de check-ins
  radius?: number;
}

/**
 * Usage Statistics
 */
export interface UsageStatistics {
  totalCheckIns: number;
  totalUniqueUsers: number;
  avgDurationMinutes: number;
  mostPopularLocation: string;
  leastPopularLocation: string;
  peakHour: number;
  usageTrend: "increasing" | "decreasing" | "stable";
}

/**
 * Location Analytics Service
 * Servicio para análisis de uso por ubicación
 */
@Injectable()
export class LocationAnalyticsService {
  constructor(
    private readonly checkInOutService: CheckInOutService,
    private readonly geolocationService: GeolocationService
  ) {}

  /**
   * Obtener análisis de uso por ubicación
   */
  async getUsageByLocation(
    startDate: Date,
    endDate: Date
  ): Promise<LocationAnalytics[]> {
    try {
      // Obtener todos los check-ins en el período
      const checkIns = await this.checkInOutService.findByDateRange(
        startDate,
        endDate
      );

      const analyticsMap = new Map<string, LocationAnalytics>();

      for (const checkIn of checkIns) {
        // Obtener ubicación del recurso
        const resourceLocation =
          await this.geolocationService.getResourceLocation(checkIn.resourceId);

        if (!resourceLocation) continue;

        // Clave de ubicación: "lat,lng"
        const locationKey = `${resourceLocation.coordinates.latitude},${resourceLocation.coordinates.longitude}`;

        // Obtener o crear analytics para esta ubicación
        let analytics = analyticsMap.get(locationKey);

        if (!analytics) {
          analytics = {
            location: resourceLocation.name,
            coordinates: {
              latitude: resourceLocation.coordinates.latitude,
              longitude: resourceLocation.coordinates.longitude,
            },
            totalCheckIns: 0,
            uniqueUsers: new Set<string>(),
            avgDuration: 0,
            peakHours: [],
            resources: new Set<string>(),
            usageByDay: new Map<string, number>(),
          };
          analyticsMap.set(locationKey, analytics);
        }

        // Actualizar métricas
        analytics.totalCheckIns++;
        analytics.uniqueUsers.add(checkIn.userId);
        analytics.resources.add(checkIn.resourceId);

        // Calcular duración si tiene check-out
        if (checkIn.checkOutTime && checkIn.checkInTime) {
          const duration =
            checkIn.checkOutTime.getTime() - checkIn.checkInTime.getTime();

          // Calcular promedio móvil
          if (analytics.avgDuration === 0) {
            analytics.avgDuration = duration;
          } else {
            analytics.avgDuration = (analytics.avgDuration + duration) / 2;
          }
        }

        // Registrar uso por día
        if (checkIn.checkInTime) {
          const dayKey = checkIn.checkInTime.toISOString().split("T")[0];
          const dayCount = analytics.usageByDay.get(dayKey) || 0;
          analytics.usageByDay.set(dayKey, dayCount + 1);
        }
      }

      // Calcular horas pico para cada ubicación
      for (const analytics of analyticsMap.values()) {
        analytics.peakHours = await this.calculatePeakHours(
          Array.from(analytics.resources),
          startDate,
          endDate
        );
      }

      logger.info("Location analytics generated", {
        locations: analyticsMap.size,
        totalCheckIns: checkIns.length,
      });

      return Array.from(analyticsMap.values());
    } catch (error) {
      logger.error("Error generating location analytics", error as Error);
      throw error;
    }
  }

  /**
   * Generar datos para mapa de calor
   */
  async getHeatmapData(
    startDate: Date,
    endDate: Date
  ): Promise<HeatmapPoint[]> {
    try {
      const analytics = await this.getUsageByLocation(startDate, endDate);

      const heatmapPoints: HeatmapPoint[] = analytics.map((a) => ({
        lat: a.coordinates.latitude,
        lng: a.coordinates.longitude,
        intensity: a.totalCheckIns,
        radius: Math.min(a.totalCheckIns * 5, 50), // Radius basado en uso
      }));

      logger.info("Heatmap data generated", {
        points: heatmapPoints.length,
      });

      return heatmapPoints;
    } catch (error) {
      logger.error("Error generating heatmap data", error as Error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas generales de uso
   */
  async getUsageStatistics(
    startDate: Date,
    endDate: Date
  ): Promise<UsageStatistics> {
    try {
      const analytics = await this.getUsageByLocation(startDate, endDate);

      if (analytics.length === 0) {
        return {
          totalCheckIns: 0,
          totalUniqueUsers: 0,
          avgDurationMinutes: 0,
          mostPopularLocation: "N/A",
          leastPopularLocation: "N/A",
          peakHour: 0,
          usageTrend: "stable",
        };
      }

      // Calcular totales
      const totalCheckIns = analytics.reduce(
        (sum, a) => sum + a.totalCheckIns,
        0
      );

      const allUsers = new Set<string>();
      analytics.forEach((a) => {
        a.uniqueUsers.forEach((user) => allUsers.add(user));
      });

      const avgDuration =
        analytics.reduce((sum, a) => sum + a.avgDuration, 0) / analytics.length;

      // Ubicación más popular
      const mostPopular = analytics.reduce((prev, current) =>
        prev.totalCheckIns > current.totalCheckIns ? prev : current
      );

      // Ubicación menos popular
      const leastPopular = analytics.reduce((prev, current) =>
        prev.totalCheckIns < current.totalCheckIns ? prev : current
      );

      // Hora pico global
      const hourCounts = new Map<number, number>();
      const checkIns = await this.checkInOutService.findByDateRange(
        startDate,
        endDate
      );

      for (const checkIn of checkIns) {
        if (checkIn.checkInTime) {
          const hour = checkIn.checkInTime.getHours();
          hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        }
      }

      const peakHour = Array.from(hourCounts.entries()).reduce(
        (prev, current) => (prev[1] > current[1] ? prev : current),
        [0, 0]
      )[0];

      // Tendencia de uso
      const usageTrend = this.calculateUsageTrend(analytics);

      const stats: UsageStatistics = {
        totalCheckIns,
        totalUniqueUsers: allUsers.size,
        avgDurationMinutes: Math.round(avgDuration / 60000), // ms a minutos
        mostPopularLocation: mostPopular.location,
        leastPopularLocation: leastPopular.location,
        peakHour,
        usageTrend,
      };

      logger.info("Usage statistics calculated", stats);

      return stats;
    } catch (error) {
      logger.error("Error calculating usage statistics", error as Error);
      throw error;
    }
  }

  /**
   * Obtener análisis por recurso específico
   */
  async getResourceUsageAnalytics(
    resourceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    resourceId: string;
    location?: string;
    coordinates?: { latitude: number; longitude: number };
    totalCheckIns: number;
    uniqueUsers: number;
    avgDurationMinutes: number;
    peakHours: number[];
    usageByDayOfWeek: Map<string, number>;
  }> {
    try {
      const checkIns = await this.checkInOutService.findByResourceId(
        resourceId,
        startDate,
        endDate
      );

      const uniqueUsers = new Set(checkIns.map((c) => c.userId));
      let totalDuration = 0;
      let checkInsWithDuration = 0;

      const usageByDayOfWeek = new Map<string, number>();
      const hourCounts = new Map<number, number>();

      for (const checkIn of checkIns) {
        // Duración
        if (checkIn.checkOutTime && checkIn.checkInTime) {
          const duration =
            checkIn.checkOutTime.getTime() - checkIn.checkInTime.getTime();
          totalDuration += duration;
          checkInsWithDuration++;
        }

        // Día de la semana
        if (checkIn.checkInTime) {
          const dayOfWeek = [
            "Domingo",
            "Lunes",
            "Martes",
            "Miércoles",
            "Jueves",
            "Viernes",
            "Sábado",
          ][checkIn.checkInTime.getDay()];
          usageByDayOfWeek.set(
            dayOfWeek,
            (usageByDayOfWeek.get(dayOfWeek) || 0) + 1
          );

          // Hora
          const hour = checkIn.checkInTime.getHours();
          hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        }
      }

      // Horas pico (top 3)
      const peakHours = Array.from(hourCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map((entry) => entry[0]);

      // Ubicación del recurso
      const resourceLocation =
        await this.geolocationService.getResourceLocation(resourceId);

      const analytics = {
        resourceId,
        location: resourceLocation?.name,
        coordinates: resourceLocation
          ? {
              latitude: resourceLocation.coordinates.latitude,
              longitude: resourceLocation.coordinates.longitude,
            }
          : undefined,
        totalCheckIns: checkIns.length,
        uniqueUsers: uniqueUsers.size,
        avgDurationMinutes:
          checkInsWithDuration > 0
            ? Math.round(totalDuration / checkInsWithDuration / 60000)
            : 0,
        peakHours,
        usageByDayOfWeek,
      };

      logger.info("Resource usage analytics generated", {
        resourceId,
        totalCheckIns: analytics.totalCheckIns,
      });

      return analytics;
    } catch (error) {
      logger.error("Error generating resource analytics", error as Error, {
        resourceId,
      });
      throw error;
    }
  }

  /**
   * Calcular horas pico para recursos específicos
   */
  private async calculatePeakHours(
    resourceIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<number[]> {
    const hourCounts = new Map<number, number>();

    for (const resourceId of resourceIds) {
      const checkIns = await this.checkInOutService.findByResourceId(
        resourceId,
        startDate,
        endDate
      );

      for (const checkIn of checkIns) {
        if (checkIn.checkInTime) {
          const hour = checkIn.checkInTime.getHours();
          hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        }
      }
    }

    // Retornar top 3 horas pico
    return Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);
  }

  /**
   * Calcular tendencia de uso
   */
  private calculateUsageTrend(
    analytics: LocationAnalytics[]
  ): "increasing" | "decreasing" | "stable" {
    // Obtener datos de los últimos 7 días por cada ubicación
    const recentUsage: number[] = [];

    for (const locationAnalytics of analytics) {
      const usageByDay = Array.from(locationAnalytics.usageByDay.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map((entry) => entry[1]);

      recentUsage.push(...usageByDay);
    }

    if (recentUsage.length < 2) {
      return "stable";
    }

    // Calcular tendencia simple (primera mitad vs segunda mitad)
    const midPoint = Math.floor(recentUsage.length / 2);
    const firstHalf = recentUsage.slice(0, midPoint);
    const secondHalf = recentUsage.slice(midPoint);

    const avgFirstHalf =
      firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const avgSecondHalf =
      secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const difference = avgSecondHalf - avgFirstHalf;
    const threshold = avgFirstHalf * 0.1; // 10% de cambio

    if (difference > threshold) {
      return "increasing";
    } else if (difference < -threshold) {
      return "decreasing";
    } else {
      return "stable";
    }
  }
}
