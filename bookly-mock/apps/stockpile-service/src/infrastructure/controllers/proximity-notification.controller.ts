import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  ProximityNotificationService,
  ProximityThreshold,
} from "../../application/services/proximity-notification.service";

/**
 * DTO para verificar proximidad
 */
class CheckProximityDto {
  userId: string;
  reservationId: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Proximity Notification Controller
 * Endpoints para gestión de notificaciones por proximidad geográfica
 */
@ApiTags("Proximity Notifications")
@ApiBearerAuth()
@Controller("proximity-notifications")
export class ProximityNotificationController {
  constructor(
    private readonly proximityService: ProximityNotificationService
  ) {}

  /**
   * Verificar proximidad y enviar notificación si aplica
   */
  @Post("check")
  @ApiOperation({
    summary: "Verificar proximidad y notificar",
    description:
      "Calcula la distancia del usuario al recurso reservado y envía notificación push si cruza un threshold de proximidad (Approaching, Near, Arrived).",
  })
  @ApiBody({
    type: CheckProximityDto,
    description: "Datos de ubicación del usuario",
    examples: {
      example1: {
        summary: "Usuario cercano al recurso",
        value: {
          userId: "507f1f77bcf86cd799439011",
          reservationId: "507f1f77bcf86cd799439012",
          coordinates: {
            latitude: 7.8939,
            longitude: -72.5078,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      "Proximidad verificada exitosamente. Notificación enviada si aplica.",
    schema: {
      example: {
        message: "Proximity checked successfully",
        notificationSent: true,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Reserva o recurso no encontrado",
  })
  async checkProximity(@Body() dto: CheckProximityDto) {
    await this.proximityService.checkProximityAndNotify(
      dto.userId,
      dto.coordinates,
      dto.reservationId
    );

    return {
      message: "Proximity checked successfully",
      notificationSent: true,
    };
  }

  /**
   * Obtener estado de proximidad de un usuario
   */
  @Get("user/:userId/reservation/:reservationId")
  @ApiOperation({
    summary: "Estado de proximidad del usuario",
    description:
      "Obtiene el estado actual de proximidad de un usuario para una reserva específica, incluyendo última distancia y threshold.",
  })
  @ApiParam({
    name: "userId",
    type: String,
    description: "ID del usuario",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiParam({
    name: "reservationId",
    type: String,
    description: "ID de la reserva",
    example: "507f1f77bcf86cd799439012",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Estado de proximidad obtenido exitosamente",
    schema: {
      example: {
        userId: "507f1f77bcf86cd799439011",
        reservationId: "507f1f77bcf86cd799439012",
        resourceId: "507f1f77bcf86cd799439013",
        lastDistance: 45,
        lastThreshold: "NEAR",
        lastNotificationTime: "2024-01-15T14:30:00.000Z",
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "No se encontró estado de proximidad para este usuario",
  })
  async getUserProximityState(
    @Param("userId") userId: string,
    @Param("reservationId") reservationId: string
  ) {
    const state = this.proximityService.getUserProximityState(
      userId,
      reservationId
    );

    if (!state) {
      return {
        message: "No proximity state found",
        userId,
        reservationId,
      };
    }

    return {
      ...state,
      lastThreshold: ProximityThreshold[state.lastThreshold],
    };
  }

  /**
   * Obtener todas las proximidades activas
   */
  @Get("active")
  @ApiOperation({
    summary: "Proximidades activas",
    description:
      "Lista todas las proximidades activas del sistema (usuarios con estado de proximidad registrado).",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Lista de proximidades activas",
    schema: {
      example: {
        total: 15,
        proximities: [
          {
            userId: "507f1f77bcf86cd799439011",
            reservationId: "507f1f77bcf86cd799439012",
            resourceId: "507f1f77bcf86cd799439013",
            lastDistance: 45,
            lastThreshold: "NEAR",
            lastNotificationTime: "2024-01-15T14:30:00.000Z",
          },
        ],
      },
    },
  })
  async getAllActiveProximities() {
    const proximities = this.proximityService.getAllActiveProximities();

    return {
      total: proximities.length,
      proximities: proximities.map((p) => ({
        ...p,
        lastThreshold: ProximityThreshold[p.lastThreshold],
      })),
    };
  }

  /**
   * Limpiar estado de proximidad de un usuario
   */
  @Delete("user/:userId/reservation/:reservationId")
  @ApiOperation({
    summary: "Limpiar estado de proximidad",
    description:
      "Elimina el estado de proximidad de un usuario para una reserva específica. Útil cuando se completa un check-in o se cancela una reserva.",
  })
  @ApiParam({
    name: "userId",
    type: String,
    description: "ID del usuario",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiParam({
    name: "reservationId",
    type: String,
    description: "ID de la reserva",
    example: "507f1f77bcf86cd799439012",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Estado de proximidad eliminado exitosamente",
    schema: {
      example: {
        message: "Proximity state cleared successfully",
        userId: "507f1f77bcf86cd799439011",
        reservationId: "507f1f77bcf86cd799439012",
      },
    },
  })
  async clearUserProximityState(
    @Param("userId") userId: string,
    @Param("reservationId") reservationId: string
  ) {
    this.proximityService.clearUserProximityState(userId, reservationId);

    return {
      message: "Proximity state cleared successfully",
      userId,
      reservationId,
    };
  }

  /**
   * Obtener información de thresholds de proximidad
   */
  @Get("thresholds")
  @ApiOperation({
    summary: "Thresholds de proximidad",
    description:
      "Retorna los thresholds configurados para las notificaciones de proximidad (FAR, APPROACHING, NEAR, ARRIVED) con sus respectivas distancias en metros.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Thresholds de proximidad",
    schema: {
      example: {
        FAR: 200,
        APPROACHING: 100,
        NEAR: 50,
        ARRIVED: 20,
      },
    },
  })
  async getProximityThresholds() {
    return {
      FAR: ProximityThreshold.FAR,
      APPROACHING: ProximityThreshold.APPROACHING,
      NEAR: ProximityThreshold.NEAR,
      ARRIVED: ProximityThreshold.ARRIVED,
    };
  }
}
