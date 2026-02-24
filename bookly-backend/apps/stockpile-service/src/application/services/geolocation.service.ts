import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";

const logger = createLogger("GeolocationService");

/**
 * Coordenadas geográficas
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number; // Precisión en metros
  altitude?: number;
  timestamp: Date;
}

/**
 * Ubicación de recurso
 */
export interface ResourceLocation {
  resourceId: string;
  name: string;
  coordinates: Coordinates;
  radius: number; // Radio permitido en metros
}

/**
 * Geolocation Service
 * Servicio para validar ubicación geográfica en check-in/check-out
 */
@Injectable()
export class GeolocationService {
  // Ubicaciones de recursos (en producción vendría de base de datos)
  private readonly resourceLocations: Map<string, ResourceLocation> = new Map();

  /**
   * Registrar ubicación de un recurso
   */
  async registerResourceLocation(location: ResourceLocation): Promise<void> {
    this.resourceLocations.set(location.resourceId, location);
    logger.info("Resource location registered", {
      resourceId: location.resourceId,
      name: location.name,
    });
  }

  /**
   * Validar si el usuario está cerca del recurso
   */
  async validateProximity(
    resourceId: string,
    userCoordinates: Coordinates
  ): Promise<{
    valid: boolean;
    distance?: number;
    reason?: string;
  }> {
    try {
      const resourceLocation = this.resourceLocations.get(resourceId);

      if (!resourceLocation) {
        logger.warn("Resource location not found", { resourceId });
        // Si no hay ubicación registrada, permitir check-in
        return {
          valid: true,
          reason: "Ubicación del recurso no configurada",
        };
      }

      // Calcular distancia
      const distance = this.calculateDistance(
        userCoordinates,
        resourceLocation.coordinates
      );

      const valid = distance <= resourceLocation.radius;

      logger.info("Proximity validation", {
        resourceId,
        distance,
        radius: resourceLocation.radius,
        valid,
      });

      return {
        valid,
        distance,
        reason: valid
          ? "Usuario dentro del rango permitido"
          : `Usuario fuera del rango (${distance.toFixed(0)}m de ${resourceLocation.radius}m permitidos)`,
      };
    } catch (error) {
      logger.error("Error validating proximity", error as Error, {
        resourceId,
      });
      throw error;
    }
  }

  /**
   * Calcular distancia entre dos coordenadas usando fórmula de Haversine
   * Retorna distancia en metros
   */
  calculateDistance(
    coords1: Coordinates | { latitude: number; longitude: number },
    coords2: Coordinates | { latitude: number; longitude: number }
  ): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (coords1.latitude * Math.PI) / 180;
    const φ2 = (coords2.latitude * Math.PI) / 180;
    const Δφ = ((coords2.latitude - coords1.latitude) * Math.PI) / 180;
    const Δλ = ((coords2.longitude - coords1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  }

  /**
   * Obtener ubicación de un recurso
   */
  async getResourceLocation(
    resourceId: string
  ): Promise<ResourceLocation | null> {
    return this.resourceLocations.get(resourceId) || null;
  }

  /**
   * Actualizar radio permitido para un recurso
   */
  async updateResourceRadius(
    resourceId: string,
    radius: number
  ): Promise<void> {
    const location = this.resourceLocations.get(resourceId);
    if (location) {
      location.radius = radius;
      logger.info("Resource radius updated", { resourceId, radius });
    }
  }

  /**
   * Inicializar ubicaciones de ejemplo (UFPS)
   */
  async initializeUFPSLocations(): Promise<void> {
    // Coordenadas de ejemplo de la UFPS Cúcuta
    const ufpsCoordinates: Coordinates = {
      latitude: 7.8939,
      longitude: -72.5078,
      timestamp: new Date(),
    };

    const exampleLocations: ResourceLocation[] = [
      {
        resourceId: "sala-101",
        name: "Sala 101 - Edificio A",
        coordinates: { ...ufpsCoordinates, latitude: 7.894 },
        radius: 50, // 50 metros
      },
      {
        resourceId: "sala-202",
        name: "Sala 202 - Edificio B",
        coordinates: { ...ufpsCoordinates, latitude: 7.8938 },
        radius: 50,
      },
      {
        resourceId: "auditorio-principal",
        name: "Auditorio Principal",
        coordinates: { ...ufpsCoordinates, longitude: -72.5075 },
        radius: 100, // 100 metros para auditorio más grande
      },
      {
        resourceId: "laboratorio-computo",
        name: "Laboratorio de Cómputo",
        coordinates: { ...ufpsCoordinates, latitude: 7.8941 },
        radius: 30,
      },
    ];

    for (const location of exampleLocations) {
      await this.registerResourceLocation(location);
    }

    logger.info("UFPS locations initialized", {
      count: exampleLocations.length,
    });
  }

  /**
   * Validar precisión de coordenadas
   */
  validateCoordinatesAccuracy(coords: Coordinates): {
    valid: boolean;
    reason?: string;
  } {
    const maxAccuracy = 100; // Máximo 100 metros de precisión

    if (!coords.accuracy) {
      return {
        valid: true,
        reason: "Precisión no especificada",
      };
    }

    if (coords.accuracy > maxAccuracy) {
      return {
        valid: false,
        reason: `Precisión insuficiente (${coords.accuracy}m > ${maxAccuracy}m)`,
      };
    }

    return {
      valid: true,
      reason: `Precisión aceptable (${coords.accuracy}m)`,
    };
  }
}
