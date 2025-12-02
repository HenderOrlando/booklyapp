import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@libs/redis';

/**
 * Cache Service para Availability Service
 * 
 * Gestiona cache de:
 * - Disponibilidad de recursos
 * - Reservas activas
 * - Permisos de usuario
 * - Listas de espera
 */
@Injectable()
export class AvailabilityCacheService {
  private readonly logger = new Logger(AvailabilityCacheService.name);
  
  // Prefijos de cache
  private readonly PREFIXES = {
    RESOURCE_AVAILABILITY: 'avail:resource:',
    RESERVATION: 'avail:reservation:',
    USER_PERMISSIONS: 'avail:user:perms:',
    WAITING_LIST: 'avail:waitlist:',
    SCHEDULE: 'avail:schedule:',
    CONFLICTS: 'avail:conflicts:',
  };

  // TTL por tipo de dato (en segundos)
  private readonly TTL = {
    RESOURCE_AVAILABILITY: 300, // 5 minutos
    RESERVATION: 600, // 10 minutos
    USER_PERMISSIONS: 1800, // 30 minutos
    WAITING_LIST: 180, // 3 minutos
    SCHEDULE: 300, // 5 minutos
    CONFLICTS: 60, // 1 minuto
  };

  constructor(private readonly redis: RedisService) {}

  /**
   * Cache de disponibilidad de recurso
   */
  async cacheResourceAvailability(
    resourceId: string,
    availability: any,
  ): Promise<void> {
    const key = `${this.PREFIXES.RESOURCE_AVAILABILITY}${resourceId}`;
    await this.redis.set(key, availability, { key, ttl: this.TTL.RESOURCE_AVAILABILITY });
    this.logger.debug(`Cached availability for resource ${resourceId}`);
  }

  async getResourceAvailability(resourceId: string): Promise<any | null> {
    const key = `${this.PREFIXES.RESOURCE_AVAILABILITY}${resourceId}`;
    return await this.redis.get(key);
  }

  async invalidateResourceAvailability(resourceId: string): Promise<void> {
    const key = `${this.PREFIXES.RESOURCE_AVAILABILITY}${resourceId}`;
    await this.redis.del(key);
    this.logger.debug(`Invalidated availability cache for resource ${resourceId}`);
  }

  /**
   * Cache de reservas
   */
  async cacheReservation(reservationId: string, reservation: any): Promise<void> {
    const key = `${this.PREFIXES.RESERVATION}${reservationId}`;
    await this.redis.set(key, reservation, { key, ttl: this.TTL.RESERVATION });
    this.logger.debug(`Cached reservation ${reservationId}`);
  }

  async getReservation(reservationId: string): Promise<any | null> {
    const key = `${this.PREFIXES.RESERVATION}${reservationId}`;
    return await this.redis.get(key);
  }

  async invalidateReservation(reservationId: string): Promise<void> {
    const key = `${this.PREFIXES.RESERVATION}${reservationId}`;
    await this.redis.del(key);
    this.logger.debug(`Invalidated reservation cache ${reservationId}`);
  }

  /**
   * Cache de permisos de usuario
   */
  async cacheUserPermissions(userId: string, permissions: any): Promise<void> {
    const key = `${this.PREFIXES.USER_PERMISSIONS}${userId}`;
    await this.redis.set(key, permissions, { key, ttl: this.TTL.USER_PERMISSIONS });
    this.logger.debug(`Cached permissions for user ${userId}`);
  }

  async getUserPermissions(userId: string): Promise<any | null> {
    const key = `${this.PREFIXES.USER_PERMISSIONS}${userId}`;
    return await this.redis.get(key);
  }

  async invalidateUserPermissions(userId: string): Promise<void> {
    const key = `${this.PREFIXES.USER_PERMISSIONS}${userId}`;
    await this.redis.del(key);
    this.logger.debug(`Invalidated permissions cache for user ${userId}`);
  }

  /**
   * Cache de lista de espera
   */
  async cacheWaitingList(resourceId: string, waitingList: any[]): Promise<void> {
    const key = `${this.PREFIXES.WAITING_LIST}${resourceId}`;
    await this.redis.set(key, waitingList, { key, ttl: this.TTL.WAITING_LIST });
    this.logger.debug(`Cached waiting list for resource ${resourceId}`);
  }

  async getWaitingList(resourceId: string): Promise<any[] | null> {
    const key = `${this.PREFIXES.WAITING_LIST}${resourceId}`;
    return await this.redis.get(key);
  }

  async invalidateWaitingList(resourceId: string): Promise<void> {
    const key = `${this.PREFIXES.WAITING_LIST}${resourceId}`;
    await this.redis.del(key);
    this.logger.debug(`Invalidated waiting list cache for resource ${resourceId}`);
  }

  /**
   * Cache de horarios (schedule)
   */
  async cacheSchedule(
    resourceId: string,
    date: string,
    schedule: any,
  ): Promise<void> {
    const key = `${this.PREFIXES.SCHEDULE}${resourceId}:${date}`;
    await this.redis.set(key, schedule, { key, ttl: this.TTL.SCHEDULE });
    this.logger.debug(`Cached schedule for resource ${resourceId} on ${date}`);
  }

  async getSchedule(resourceId: string, date: string): Promise<any | null> {
    const key = `${this.PREFIXES.SCHEDULE}${resourceId}:${date}`;
    return await this.redis.get(key);
  }

  async invalidateSchedule(resourceId: string, date: string): Promise<void> {
    const key = `${this.PREFIXES.SCHEDULE}${resourceId}:${date}`;
    await this.redis.del(key);
    this.logger.debug(`Invalidated schedule cache for resource ${resourceId} on ${date}`);
  }

  /**
   * Invalidar todo el cache de un recurso
   */
  async invalidateAllResourceCache(resourceId: string): Promise<void> {
    const patterns = [
      `${this.PREFIXES.RESOURCE_AVAILABILITY}${resourceId}`,
      `${this.PREFIXES.WAITING_LIST}${resourceId}`,
      `${this.PREFIXES.SCHEDULE}${resourceId}:*`,
    ];

    for (const pattern of patterns) {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.delMany(keys);
      }
    }

    this.logger.log(`Invalidated all cache for resource ${resourceId}`);
  }

  /**
   * Cache de conflictos detectados
   */
  async cacheConflict(resourceId: string, conflict: any): Promise<void> {
    const key = `${this.PREFIXES.CONFLICTS}${resourceId}:${Date.now()}`;
    await this.redis.set(key, conflict, { key, ttl: this.TTL.CONFLICTS });
    this.logger.warn(`Cached conflict for resource ${resourceId}`);
  }

  /**
   * Obtener estadísticas de cache
   */
  async getCacheStats(): Promise<any> {
    const stats = {
      resourceAvailability: 0,
      reservations: 0,
      userPermissions: 0,
      waitingLists: 0,
      schedules: 0,
      conflicts: 0,
    };

    try {
      stats.resourceAvailability = (await this.redis.keys(`${this.PREFIXES.RESOURCE_AVAILABILITY}*`)).length;
      stats.reservations = (await this.redis.keys(`${this.PREFIXES.RESERVATION}*`)).length;
      stats.userPermissions = (await this.redis.keys(`${this.PREFIXES.USER_PERMISSIONS}*`)).length;
      stats.waitingLists = (await this.redis.keys(`${this.PREFIXES.WAITING_LIST}*`)).length;
      stats.schedules = (await this.redis.keys(`${this.PREFIXES.SCHEDULE}*`)).length;
      stats.conflicts = (await this.redis.keys(`${this.PREFIXES.CONFLICTS}*`)).length;
    } catch (error) {
      this.logger.error('Error getting cache stats', error);
    }

    return stats;
  }

  /**
   * Limpiar cache expirado (opcional, Redis lo hace automáticamente)
   */
  async clearExpiredCache(): Promise<void> {
    this.logger.log('Redis handles expiration automatically');
  }
}
