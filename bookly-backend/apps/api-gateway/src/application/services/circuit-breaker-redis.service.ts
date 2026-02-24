import { createLogger } from "@libs/common";
import { RedisService } from "@libs/redis";
import { HttpException, Injectable } from "@nestjs/common";

type CircuitState = "CLOSED" | "OPEN" | "HALF-OPEN";

interface CircuitConfig {
  failureThreshold: number; // Número de fallos para abrir el circuito
  successThreshold: number; // Número de éxitos para cerrar en HALF-OPEN
  timeout: number; // Tiempo en ms antes de probar recuperación
  resetTimeout: number; // Tiempo en ms para reset completo
}

interface CircuitStateData {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number;
}

/**
 * Circuit Breaker Service con Redis
 * Implementa Circuit Breaker distribuido usando Redis
 * Permite que múltiples instancias del API Gateway compartan el estado
 */
@Injectable()
export class CircuitBreakerRedisService {
  private readonly logger = createLogger("CircuitBreakerRedis");
  private readonly configs = new Map<string, CircuitConfig>();

  constructor(private readonly redis: RedisService) {}

  /**
   * Registrar un circuit breaker para un servicio
   */
  register(service: string, config: CircuitConfig): void {
    this.configs.set(service, config);
    this.logger.info(
      `Circuit breaker registered for ${service}`,
      JSON.stringify(config),
    );
  }

  /**
   * Ejecutar función con protección de circuit breaker
   */
  async execute<T>(
    service: string,
    fn: () => Promise<T>,
    fallback?: () => Promise<T>,
  ): Promise<T> {
    const config = this.configs.get(service);
    if (!config) {
      this.logger.warn(
        `No circuit breaker config for ${service}, executing without protection`,
      );
      return await fn();
    }

    // Obtener estado actual desde Redis
    const state = await this.getState(service, config);

    // Si está OPEN, usar fallback o lanzar error
    if (state.state === "OPEN") {
      const timeSinceFailure = Date.now() - state.lastFailureTime;

      // Verificar si es tiempo de intentar recuperación
      if (timeSinceFailure >= config.timeout) {
        this.logger.info(`Circuit HALF-OPEN for ${service} (testing recovery)`);
        await this.transitionToHalfOpen(service, state);
        return await this.attemptExecution(service, fn, fallback, config);
      }

      // Circuito aún está OPEN
      this.logger.warn(
        `Circuit OPEN for ${service}, using fallback (time remaining: ${Math.round((config.timeout - timeSinceFailure) / 1000)}s)`,
      );

      if (fallback) {
        return await fallback();
      }

      throw new Error(`Service ${service} is unavailable (circuit open)`);
    }

    // Estado CLOSED o HALF-OPEN: intentar ejecución
    return await this.attemptExecution(service, fn, fallback, config);
  }

  /**
   * Intentar ejecutar la función
   */
  private async attemptExecution<T>(
    service: string,
    fn: () => Promise<T>,
    fallback: (() => Promise<T>) | undefined,
    config: CircuitConfig,
  ): Promise<T> {
    try {
      const result = await fn();
      await this.onSuccess(service, config);
      return result;
    } catch (error) {
      // 4xx client errors mean the service IS responding — NOT a service failure.
      // Re-throw them without counting as a circuit breaker failure.
      if (error instanceof HttpException && error.getStatus() < 500) {
        await this.onSuccess(service, config);
        throw error;
      }

      await this.onFailure(service, config);

      // Si hay fallback, usarlo
      if (fallback) {
        this.logger.warn(`Using fallback for ${service} after failure`);
        return await fallback();
      }

      throw error;
    }
  }

  /**
   * Manejar éxito de ejecución
   */
  private async onSuccess(
    service: string,
    config: CircuitConfig,
  ): Promise<void> {
    const state = await this.getState(service, config);

    if (state.state === "HALF-OPEN") {
      state.successes++;
      state.failures = 0;

      this.logger.info(
        `Success for ${service}`,
        JSON.stringify({ successes: state.successes, state: state.state }),
      );

      // Si alcanza el threshold de éxitos, cerrar el circuito
      if (state.successes >= config.successThreshold) {
        this.logger.info(`Circuit CLOSED for ${service} (recovered)`);
        state.state = "CLOSED";
        state.successes = 0;
        state.failures = 0;
      }

      await this.saveState(service, state);
    } else if (state.state === "CLOSED") {
      // Reset failures en CLOSED si hay éxito
      if (state.failures > 0) {
        state.failures = 0;
        await this.saveState(service, state);
      }
    }
  }

  /**
   * Manejar fallo de ejecución
   */
  private async onFailure(
    service: string,
    config: CircuitConfig,
  ): Promise<void> {
    const state = await this.getState(service, config);
    state.failures++;
    state.lastFailureTime = Date.now();

    this.logger.error(
      `Failure for ${service}`,
      new Error(
        JSON.stringify({
          failures: state.failures,
          threshold: config.failureThreshold,
          state: state.state,
        }),
      ),
    );

    // Si alcanza el threshold de fallos, abrir el circuito
    if (state.failures >= config.failureThreshold) {
      this.logger.error(
        `Circuit OPENED for ${service}`,
        new Error(
          JSON.stringify({
            failures: state.failures,
            threshold: config.failureThreshold,
            state: state.state,
          }),
        ),
      );
      state.state = "OPEN";
      state.successes = 0;
    }

    await this.saveState(service, state);
  }

  /**
   * Transicionar a HALF-OPEN
   */
  private async transitionToHalfOpen(
    service: string,
    state: CircuitStateData,
  ): Promise<void> {
    state.state = "HALF-OPEN";
    state.successes = 0;
    state.failures = 0;
    await this.saveState(service, state);
  }

  /**
   * Obtener estado desde Redis
   */
  private async getState(
    service: string,
    config: CircuitConfig,
  ): Promise<CircuitStateData> {
    const key = `circuit:${service}`;
    const stateData = await this.redis.get<CircuitStateData>(key);

    if (stateData) {
      return stateData;
    }

    // Estado inicial
    return {
      state: "CLOSED",
      failures: 0,
      successes: 0,
      lastFailureTime: 0,
    };
  }

  /**
   * Guardar estado en Redis
   */
  private async saveState(
    service: string,
    state: CircuitStateData,
  ): Promise<void> {
    const key = `circuit:${service}`;
    // Guardar por 24 horas
    await this.redis.set(key, state, { key, ttl: 86400 });
  }

  /**
   * Obtener estado actual del circuito
   */
  async getCircuitState(service: string): Promise<CircuitState> {
    const config = this.configs.get(service);
    if (!config) {
      return "CLOSED";
    }

    const state = await this.getState(service, config);
    return state.state;
  }

  /**
   * Resetear circuito manualmente (admin function)
   */
  async resetCircuit(service: string): Promise<void> {
    const state: CircuitStateData = {
      state: "CLOSED",
      failures: 0,
      successes: 0,
      lastFailureTime: 0,
    };

    await this.saveState(service, state);
    await this.redis.del(`circuit:${service}:failures`);
    this.logger.info(`Circuit breaker reset for ${service}`);
  }

  /**
   * Obtener todos los circuitos registrados
   */
  async getAllCircuits(): Promise<
    Array<{
      service: string;
      state: CircuitState;
      failures: number;
      successes: number;
      config: CircuitConfig;
    }>
  > {
    const circuits: Array<{
      service: string;
      state: CircuitState;
      failures: number;
      successes: number;
      config: CircuitConfig;
    }> = [];

    for (const [service, config] of this.configs.entries()) {
      const state = await this.getState(service, config);
      circuits.push({
        service,
        state: state.state,
        failures: state.failures,
        successes: state.successes,
        config,
      });
    }

    return circuits;
  }

  /**
   * Obtener estadísticas
   */
  async getStats(): Promise<{
    total: number;
    closed: number;
    open: number;
    halfOpen: number;
  }> {
    const circuits = await this.getAllCircuits();

    return {
      total: circuits.length,
      closed: circuits.filter((c) => c.state === "CLOSED").length,
      open: circuits.filter((c) => c.state === "OPEN").length,
      halfOpen: circuits.filter((c) => c.state === "HALF-OPEN").length,
    };
  }
}
