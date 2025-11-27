import { createLogger } from "@libs/common";
import { HttpException, Injectable } from "@nestjs/common";

enum CircuitState {
  CLOSED = "CLOSED", // Normal operation
  OPEN = "OPEN", // Failing, reject requests
  HALF_OPEN = "HALF_OPEN", // Testing if service recovered
}

interface CircuitConfig {
  failureThreshold: number; // Número de fallos antes de abrir
  successThreshold: number; // Número de éxitos para cerrar desde half-open
  timeout: number; // Tiempo en ms antes de intentar half-open
  resetTimeout: number; // Tiempo para resetear contadores
}

interface CircuitStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime?: Date;
  lastStateChange: Date;
}

/**
 * Circuit Breaker Service
 * Implementa patrón Circuit Breaker para proteger contra fallos en cascada
 * Previene llamadas a servicios que están fallando
 */
@Injectable()
export class CircuitBreakerService {
  private readonly logger = createLogger("CircuitBreakerService");
  private readonly circuits = new Map<string, CircuitStats>();
  private readonly configs = new Map<string, CircuitConfig>();

  private readonly defaultConfig: CircuitConfig = {
    failureThreshold: 5, // Abrir después de 5 fallos
    successThreshold: 2, // Cerrar después de 2 éxitos
    timeout: 60000, // 1 minuto para intentar recuperación
    resetTimeout: 300000, // 5 minutos para resetear contadores
  };

  /**
   * Registrar circuito para un servicio
   */
  register(service: string, config?: Partial<CircuitConfig>): void {
    const finalConfig = { ...this.defaultConfig, ...config };
    this.configs.set(service, finalConfig);

    this.circuits.set(service, {
      state: CircuitState.CLOSED,
      failures: 0,
      successes: 0,
      lastStateChange: new Date(),
    });

    this.logger.info(`Circuit breaker registered for service: ${service}`, {
      config: finalConfig,
    });
  }

  /**
   * Ejecutar función con circuit breaker
   */
  async execute<T>(
    service: string,
    fn: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    // Registrar circuito si no existe
    if (!this.circuits.has(service)) {
      this.register(service);
    }

    const circuit = this.circuits.get(service)!;
    const config = this.configs.get(service)!;

    // Verificar estado del circuito
    this.updateCircuitState(service);

    // Si está OPEN, rechazar inmediatamente
    if (circuit.state === CircuitState.OPEN) {
      this.logger.warn(
        `[CIRCUIT-BREAKER] Circuit OPEN for ${service}, rejecting request`
      );

      if (fallback) {
        this.logger.info(`[CIRCUIT-BREAKER] Executing fallback for ${service}`);
        return await fallback();
      }

      throw new HttpException(
        `Service ${service} is temporarily unavailable (Circuit OPEN)`,
        503
      );
    }

    // Intentar ejecutar
    try {
      const result = await fn();
      this.onSuccess(service);
      return result;
    } catch (error) {
      this.onFailure(service, error);

      // Si hay fallback, ejecutarlo
      if (fallback) {
        this.logger.info(
          `[CIRCUIT-BREAKER] Executing fallback after failure for ${service}`
        );
        return await fallback();
      }

      throw error;
    }
  }

  /**
   * Registrar éxito
   */
  private onSuccess(service: string): void {
    const circuit = this.circuits.get(service)!;
    const config = this.configs.get(service)!;

    circuit.successes++;
    circuit.failures = 0; // Reset failures on success

    this.logger.debug(`[CIRCUIT-BREAKER] Success for ${service}`, {
      successes: circuit.successes,
      state: circuit.state,
    });

    // Si está en HALF_OPEN y alcanza threshold, cerrar
    if (
      circuit.state === CircuitState.HALF_OPEN &&
      circuit.successes >= config.successThreshold
    ) {
      this.closeCircuit(service);
    }
  }

  /**
   * Registrar fallo
   */
  private onFailure(service: string, error: any): void {
    const circuit = this.circuits.get(service)!;
    const config = this.configs.get(service)!;

    circuit.failures++;
    circuit.lastFailureTime = new Date();
    circuit.successes = 0; // Reset successes on failure

    this.logger.error(
      `[CIRCUIT-BREAKER] Failure for ${service}`,
      error instanceof Error ? error : new Error(String(error)),
      {
        failures: circuit.failures,
        threshold: config.failureThreshold,
        state: circuit.state,
      }
    );

    // Si alcanza threshold, abrir circuito
    if (
      circuit.state === CircuitState.CLOSED &&
      circuit.failures >= config.failureThreshold
    ) {
      this.openCircuit(service);
    } else if (circuit.state === CircuitState.HALF_OPEN) {
      // Si falla en HALF_OPEN, volver a OPEN
      this.openCircuit(service);
    }
  }

  /**
   * Actualizar estado del circuito
   */
  private updateCircuitState(service: string): void {
    const circuit = this.circuits.get(service)!;
    const config = this.configs.get(service)!;

    if (circuit.state === CircuitState.OPEN) {
      const timeSinceLastFailure =
        Date.now() - (circuit.lastFailureTime?.getTime() || 0);

      // Si pasó el timeout, intentar HALF_OPEN
      if (timeSinceLastFailure >= config.timeout) {
        this.halfOpenCircuit(service);
      }
    }

    // Reset contadores si pasó mucho tiempo
    const timeSinceStateChange = Date.now() - circuit.lastStateChange.getTime();
    if (timeSinceStateChange >= config.resetTimeout) {
      circuit.failures = 0;
      circuit.successes = 0;
    }
  }

  /**
   * Abrir circuito
   */
  private openCircuit(service: string): void {
    const circuit = this.circuits.get(service)!;
    circuit.state = CircuitState.OPEN;
    circuit.lastStateChange = new Date();

    this.logger.warn(`[CIRCUIT-BREAKER] Circuit OPENED for ${service}`, {
      failures: circuit.failures,
    });
  }

  /**
   * Medio abrir circuito (probar recuperación)
   */
  private halfOpenCircuit(service: string): void {
    const circuit = this.circuits.get(service)!;
    circuit.state = CircuitState.HALF_OPEN;
    circuit.lastStateChange = new Date();
    circuit.successes = 0;

    this.logger.info(
      `[CIRCUIT-BREAKER] Circuit HALF-OPEN for ${service} (testing recovery)`
    );
  }

  /**
   * Cerrar circuito (servicio recuperado)
   */
  private closeCircuit(service: string): void {
    const circuit = this.circuits.get(service)!;
    circuit.state = CircuitState.CLOSED;
    circuit.lastStateChange = new Date();
    circuit.failures = 0;
    circuit.successes = 0;

    this.logger.info(
      `[CIRCUIT-BREAKER] Circuit CLOSED for ${service} (recovered)`
    );
  }

  /**
   * Obtener estado de un circuito
   */
  getCircuitState(service: string): CircuitStats | undefined {
    return this.circuits.get(service);
  }

  /**
   * Obtener todos los circuitos
   */
  getAllCircuits(): Map<string, CircuitStats> {
    return this.circuits;
  }

  /**
   * Resetear circuito manualmente
   */
  resetCircuit(service: string): void {
    const circuit = this.circuits.get(service);
    if (circuit) {
      circuit.state = CircuitState.CLOSED;
      circuit.failures = 0;
      circuit.successes = 0;
      circuit.lastStateChange = new Date();
      this.logger.info(
        `[CIRCUIT-BREAKER] Circuit manually reset for ${service}`
      );
    }
  }
}
