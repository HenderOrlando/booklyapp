import { createLogger } from "@libs/common";
import { ReservationStatus } from "@libs/common/enums";
import { Inject, Injectable } from "@nestjs/common";
import { IReservationRepository } from "@availability/domain/repositories/reservation.repository.interface";

const logger = createLogger("CancellationPenaltyService");

/**
 * Tipos de penalización por cancelación tardía
 */
export enum PenaltyType {
  WARNING = "warning",
  TEMPORARY_RESTRICTION = "temporary_restriction",
  PRIORITY_REDUCTION = "priority_reduction",
}

/**
 * Resultado de evaluación de penalización
 */
export interface PenaltyEvaluation {
  shouldApplyPenalty: boolean;
  penaltyType?: PenaltyType;
  reason?: string;
  hoursBeforeStart: number;
  cancellationCount30Days: number;
  restrictionUntil?: Date;
}

/**
 * Historial de penalizaciones del usuario
 */
export interface UserPenaltyRecord {
  userId: string;
  totalCancellations30Days: number;
  lateCancellations30Days: number;
  noShows30Days: number;
  currentPenalty?: {
    type: PenaltyType;
    appliedAt: Date;
    expiresAt: Date;
    reason: string;
  };
  warningsCount: number;
}

/**
 * Configuración de reglas de penalización
 */
interface PenaltyRules {
  lateCancellationThresholdHours: number;
  maxLateCancellations30Days: number;
  maxNoShows30Days: number;
  warningThreshold: number;
  temporaryRestrictionDays: number;
  priorityReductionDays: number;
}

const DEFAULT_PENALTY_RULES: PenaltyRules = {
  lateCancellationThresholdHours: 24,
  maxLateCancellations30Days: 3,
  maxNoShows30Days: 2,
  warningThreshold: 2,
  temporaryRestrictionDays: 7,
  priorityReductionDays: 30,
};

/**
 * Cancellation Penalty Service (RF-18, RF-40)
 * Gestiona penalizaciones por cancelaciones tardías y ausencias
 *
 * Reglas:
 * - Cancelación con < 24h de anticipación = cancelación tardía
 * - 2 cancelaciones tardías en 30 días = warning
 * - 3 cancelaciones tardías en 30 días = restricción temporal (7 días)
 * - 2 no-shows en 30 días = restricción temporal (7 días)
 * - Reincidencia = reducción de prioridad en lista de espera (30 días)
 */
@Injectable()
export class CancellationPenaltyService {
  private readonly rules: PenaltyRules = DEFAULT_PENALTY_RULES;

  constructor(
    @Inject("IReservationRepository")
    private readonly reservationRepository: IReservationRepository,
  ) {}

  /**
   * Evaluar si una cancelación debe generar penalización
   */
  async evaluateCancellation(
    userId: string,
    reservationId: string,
    reservationStartDate: Date,
  ): Promise<PenaltyEvaluation> {
    const now = new Date();
    const hoursBeforeStart =
      (reservationStartDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    const isLateCancellation =
      hoursBeforeStart < this.rules.lateCancellationThresholdHours;

    if (!isLateCancellation) {
      return {
        shouldApplyPenalty: false,
        hoursBeforeStart,
        cancellationCount30Days: 0,
      };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCancellations =
      await this.getLateCancellationCount(userId, thirtyDaysAgo);

    const totalCount = recentCancellations + 1;

    if (totalCount >= this.rules.maxLateCancellations30Days) {
      const restrictionUntil = new Date();
      restrictionUntil.setDate(
        restrictionUntil.getDate() + this.rules.temporaryRestrictionDays,
      );

      logger.warn("Temporary restriction applied for late cancellations", {
        userId,
        totalCount,
        restrictionUntil,
      });

      return {
        shouldApplyPenalty: true,
        penaltyType: PenaltyType.TEMPORARY_RESTRICTION,
        reason: `${totalCount} cancelaciones tardías en los últimos 30 días. Restricción temporal de ${this.rules.temporaryRestrictionDays} días para nuevas reservas.`,
        hoursBeforeStart,
        cancellationCount30Days: totalCount,
        restrictionUntil,
      };
    }

    if (totalCount >= this.rules.warningThreshold) {
      logger.info("Warning issued for late cancellation", {
        userId,
        totalCount,
      });

      return {
        shouldApplyPenalty: true,
        penaltyType: PenaltyType.WARNING,
        reason: `${totalCount} cancelaciones tardías en los últimos 30 días. Advertencia: al llegar a ${this.rules.maxLateCancellations30Days} se aplicará restricción temporal.`,
        hoursBeforeStart,
        cancellationCount30Days: totalCount,
      };
    }

    return {
      shouldApplyPenalty: false,
      hoursBeforeStart,
      cancellationCount30Days: totalCount,
    };
  }

  /**
   * Evaluar penalización por no-show (no check-in)
   */
  async evaluateNoShow(userId: string): Promise<PenaltyEvaluation> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const noShowCount = await this.getNoShowCount(userId, thirtyDaysAgo);
    const totalCount = noShowCount + 1;

    if (totalCount >= this.rules.maxNoShows30Days) {
      const restrictionUntil = new Date();
      restrictionUntil.setDate(
        restrictionUntil.getDate() + this.rules.temporaryRestrictionDays,
      );

      logger.warn("Temporary restriction applied for no-shows", {
        userId,
        totalCount,
        restrictionUntil,
      });

      return {
        shouldApplyPenalty: true,
        penaltyType: PenaltyType.TEMPORARY_RESTRICTION,
        reason: `${totalCount} ausencias (no-show) en los últimos 30 días. Restricción temporal de ${this.rules.temporaryRestrictionDays} días.`,
        hoursBeforeStart: 0,
        cancellationCount30Days: totalCount,
        restrictionUntil,
      };
    }

    return {
      shouldApplyPenalty: totalCount >= 1,
      penaltyType: totalCount >= 1 ? PenaltyType.WARNING : undefined,
      reason:
        totalCount >= 1
          ? `${totalCount} ausencia(s) en los últimos 30 días. Al llegar a ${this.rules.maxNoShows30Days} se aplicará restricción.`
          : undefined,
      hoursBeforeStart: 0,
      cancellationCount30Days: totalCount,
    };
  }

  /**
   * Obtener historial de penalizaciones de un usuario
   */
  async getUserPenaltyRecord(userId: string): Promise<UserPenaltyRecord> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [lateCancellations, noShows, totalCancellations] = await Promise.all([
      this.getLateCancellationCount(userId, thirtyDaysAgo),
      this.getNoShowCount(userId, thirtyDaysAgo),
      this.getTotalCancellationCount(userId, thirtyDaysAgo),
    ]);

    const record: UserPenaltyRecord = {
      userId,
      totalCancellations30Days: totalCancellations,
      lateCancellations30Days: lateCancellations,
      noShows30Days: noShows,
      warningsCount: Math.max(
        0,
        lateCancellations - this.rules.warningThreshold + 1,
      ),
    };

    if (lateCancellations >= this.rules.maxLateCancellations30Days) {
      record.currentPenalty = {
        type: PenaltyType.TEMPORARY_RESTRICTION,
        appliedAt: new Date(),
        expiresAt: new Date(
          Date.now() +
            this.rules.temporaryRestrictionDays * 24 * 60 * 60 * 1000,
        ),
        reason: "Exceso de cancelaciones tardías",
      };
    } else if (noShows >= this.rules.maxNoShows30Days) {
      record.currentPenalty = {
        type: PenaltyType.TEMPORARY_RESTRICTION,
        appliedAt: new Date(),
        expiresAt: new Date(
          Date.now() +
            this.rules.temporaryRestrictionDays * 24 * 60 * 60 * 1000,
        ),
        reason: "Exceso de ausencias (no-show)",
      };
    }

    return record;
  }

  /**
   * Verificar si un usuario tiene restricción activa
   */
  async hasActiveRestriction(userId: string): Promise<boolean> {
    const record = await this.getUserPenaltyRecord(userId);
    return (
      !!record.currentPenalty &&
      record.currentPenalty.type === PenaltyType.TEMPORARY_RESTRICTION
    );
  }

  private async getLateCancellationCount(
    userId: string,
    since: Date,
  ): Promise<number> {
    try {
      const result = await this.reservationRepository.findMany(
        { page: 1, limit: 1000 },
        {
          userId,
          status: ReservationStatus.CANCELLED,
          startDate: since,
        },
      );

      return result.reservations.filter((r: any) => {
        if (!r.updatedAt || !r.startDate) return false;
        const cancelledAt = new Date(r.updatedAt);
        const startDate = new Date(r.startDate);
        const hoursBeforeStart =
          (startDate.getTime() - cancelledAt.getTime()) / (1000 * 60 * 60);
        return hoursBeforeStart < this.rules.lateCancellationThresholdHours;
      }).length;
    } catch {
      return 0;
    }
  }

  private async getNoShowCount(
    userId: string,
    since: Date,
  ): Promise<number> {
    try {
      const result = await this.reservationRepository.findMany(
        { page: 1, limit: 1000 },
        {
          userId,
          status: "NO_SHOW" as ReservationStatus,
          startDate: since,
        },
      );
      return result.reservations.length;
    } catch {
      return 0;
    }
  }

  private async getTotalCancellationCount(
    userId: string,
    since: Date,
  ): Promise<number> {
    try {
      const result = await this.reservationRepository.findMany(
        { page: 1, limit: 1000 },
        {
          userId,
          status: ReservationStatus.CANCELLED,
          startDate: since,
        },
      );
      return result.reservations.length;
    } catch {
      return 0;
    }
  }
}
