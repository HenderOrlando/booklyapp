import { EventPayload } from "@libs/common";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";

enum SagaStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  COMPENSATING = "COMPENSATING",
  COMPENSATED = "COMPENSATED",
}

interface SagaStep {
  service: string;
  action: string;
  data: any;
  compensationAction?: string;
  compensationData?: any;
}

interface SagaDefinition {
  sagaId: string;
  name: string;
  steps: SagaStep[];
  currentStep: number;
  status: SagaStatus;
  startTime: Date;
  endTime?: Date;
  error?: string;
  completedSteps: number[];
}

/**
 * Saga Service
 * Implementa patrón Saga para transacciones distribuidas
 * Maneja compensaciones automáticas en caso de fallo
 *
 * Ejemplo: Crear reserva completa
 * 1. Verificar disponibilidad → Compensación: Liberar recurso
 * 2. Crear reserva → Compensación: Eliminar reserva
 * 3. Enviar notificación → Compensación: Cancelar notificación
 */
@Injectable()
export class SagaService {
  private readonly logger = createLogger("SagaService");
  private readonly activeSagas = new Map<string, SagaDefinition>();

  constructor(private readonly eventBusService: EventBusService) {}

  /**
   * Iniciar una saga
   */
  async startSaga(name: string, steps: SagaStep[]): Promise<string> {
    const sagaId = uuidv4();

    const saga: SagaDefinition = {
      sagaId,
      name,
      steps,
      currentStep: 0,
      status: SagaStatus.PENDING,
      startTime: new Date(),
      completedSteps: [],
    };

    this.activeSagas.set(sagaId, saga);

    this.logger.info(`[SAGA] Started saga: ${name}`, {
      sagaId,
      totalSteps: steps.length,
    });

    // Ejecutar saga de forma asíncrona
    this.executeSaga(sagaId).catch((error) => {
      this.logger.error(`[SAGA] Saga execution failed: ${sagaId}`, error);
    });

    return sagaId;
  }

  /**
   * Ejecutar saga paso a paso
   */
  private async executeSaga(sagaId: string): Promise<void> {
    const saga = this.activeSagas.get(sagaId);
    if (!saga) {
      throw new Error(`Saga not found: ${sagaId}`);
    }

    saga.status = SagaStatus.IN_PROGRESS;

    try {
      // Ejecutar cada paso
      for (let i = 0; i < saga.steps.length; i++) {
        saga.currentStep = i;
        const step = saga.steps[i];

        this.logger.info(
          `[SAGA] Executing step ${i + 1}/${saga.steps.length}: ${step.action}`,
          { sagaId, service: step.service }
        );

        await this.executeStep(sagaId, step);
        saga.completedSteps.push(i);

        this.logger.info(`[SAGA] Step completed: ${step.action}`, { sagaId });
      }

      // Saga completada exitosamente
      saga.status = SagaStatus.COMPLETED;
      saga.endTime = new Date();

      this.logger.info(`[SAGA] Saga completed successfully: ${saga.name}`, {
        sagaId,
        duration: saga.endTime.getTime() - saga.startTime.getTime(),
      });
    } catch (error) {
      // Error en algún paso, iniciar compensación
      saga.status = SagaStatus.FAILED;
      saga.error = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `[SAGA] Saga failed at step ${saga.currentStep}: ${saga.name}`,
        error instanceof Error ? error : new Error(String(error)),
        { sagaId }
      );

      // Ejecutar compensaciones
      await this.compensateSaga(sagaId);
    }
  }

  /**
   * Ejecutar un paso individual
   */
  private async executeStep(sagaId: string, step: SagaStep): Promise<void> {
    const topic = `${step.service}.commands`;

    const event: EventPayload = {
      eventId: uuidv4(),
      eventType: `${step.service}.${step.action}`,
      timestamp: new Date(),
      service: "api-gateway",
      data: {
        ...step.data,
        sagaId,
      },
      metadata: {
        sagaId,
        sagaAction: step.action,
      },
    };

    // Publicar evento al servicio a través del Event Bus
    await this.eventBusService.publish(topic, event);

    // En producción, deberías esperar confirmación del servicio
    // Aquí simulamos espera
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Compensar saga (rollback)
   */
  private async compensateSaga(sagaId: string): Promise<void> {
    const saga = this.activeSagas.get(sagaId);
    if (!saga) return;

    saga.status = SagaStatus.COMPENSATING;

    this.logger.warn(`[SAGA] Starting compensation for saga: ${saga.name}`, {
      sagaId,
      stepsToCompensate: saga.completedSteps.length,
    });

    // Compensar en orden inverso
    for (let i = saga.completedSteps.length - 1; i >= 0; i--) {
      const stepIndex = saga.completedSteps[i];
      const step = saga.steps[stepIndex];

      if (step.compensationAction) {
        this.logger.info(
          `[SAGA] Compensating step ${stepIndex + 1}: ${step.compensationAction}`,
          { sagaId }
        );

        try {
          await this.executeCompensation(sagaId, step);
        } catch (error) {
          this.logger.error(
            `[SAGA] Compensation failed for step ${stepIndex + 1}`,
            error instanceof Error ? error : new Error(String(error)),
            { sagaId }
          );
          // Continuar compensando otros pasos aunque uno falle
        }
      }
    }

    saga.status = SagaStatus.COMPENSATED;
    saga.endTime = new Date();

    this.logger.info(`[SAGA] Saga compensated: ${saga.name}`, {
      sagaId,
      duration: saga.endTime.getTime() - saga.startTime.getTime(),
    });
  }

  /**
   * Ejecutar compensación de un paso
   */
  private async executeCompensation(
    sagaId: string,
    step: SagaStep
  ): Promise<void> {
    if (!step.compensationAction) return;

    const topic = `${step.service}.commands`;

    const event: EventPayload = {
      eventId: uuidv4(),
      eventType: `${step.service}.${step.compensationAction}`,
      timestamp: new Date(),
      service: "api-gateway",
      data: {
        ...(step.compensationData || step.data),
        sagaId,
      },
      metadata: {
        sagaId,
        sagaAction: step.compensationAction,
        isCompensation: true,
      },
    };

    await this.eventBusService.publish(topic, event);

    // Esperar confirmación
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Obtener estado de una saga
   */
  getSagaStatus(sagaId: string): SagaDefinition | undefined {
    return this.activeSagas.get(sagaId);
  }

  /**
   * Obtener todas las sagas activas
   */
  getActiveSagas(): SagaDefinition[] {
    return Array.from(this.activeSagas.values()).filter(
      (saga) =>
        saga.status === SagaStatus.PENDING ||
        saga.status === SagaStatus.IN_PROGRESS ||
        saga.status === SagaStatus.COMPENSATING
    );
  }

  /**
   * Obtener estadísticas
   */
  getStats(): {
    total: number;
    completed: number;
    failed: number;
    compensated: number;
    inProgress: number;
  } {
    const sagas = Array.from(this.activeSagas.values());

    return {
      total: sagas.length,
      completed: sagas.filter((s) => s.status === SagaStatus.COMPLETED).length,
      failed: sagas.filter((s) => s.status === SagaStatus.FAILED).length,
      compensated: sagas.filter((s) => s.status === SagaStatus.COMPENSATED)
        .length,
      inProgress: sagas.filter(
        (s) =>
          s.status === SagaStatus.IN_PROGRESS ||
          s.status === SagaStatus.COMPENSATING
      ).length,
    };
  }

  /**
   * Limpiar sagas completadas antiguas
   */
  cleanOldSagas(maxAgeMs: number = 3600000): void {
    // Default: 1 hora
    const now = Date.now();
    let cleaned = 0;

    for (const [sagaId, saga] of this.activeSagas.entries()) {
      if (
        saga.endTime &&
        now - saga.endTime.getTime() > maxAgeMs &&
        (saga.status === SagaStatus.COMPLETED ||
          saga.status === SagaStatus.COMPENSATED)
      ) {
        this.activeSagas.delete(sagaId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`[SAGA] Cleaned ${cleaned} old sagas`);
    }
  }
}
