import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@libs/redis';

/**
 * Cache Service para Auth Service
 * 
 * Gestiona cache de:
 * - Sesiones de usuario
 * - Tokens JWT
 * - Permisos y roles
 * - Intentos de login
 * - Tokens de 2FA
 */
@Injectable()
export class AuthCacheService {
  private readonly logger = new Logger(AuthCacheService.name);
  
  // Prefijos de cache
  private readonly PREFIXES = {
    SESSION: 'auth:session:',
    TOKEN: 'auth:token:',
    REFRESH_TOKEN: 'auth:refresh:',
    USER_PERMISSIONS: 'auth:perms:',
    USER_ROLES: 'auth:roles:',
    LOGIN_ATTEMPTS: 'auth:attempts:',
    TWO_FA_TOKEN: 'auth:2fa:',
    PASSWORD_RESET: 'auth:reset:',
    BLACKLIST: 'auth:blacklist:',
  };

  // TTL por tipo de dato (en segundos)
  private readonly TTL = {
    SESSION: 3600, // 1 hora
    TOKEN: 900, // 15 minutos
    REFRESH_TOKEN: 604800, // 7 días
    USER_PERMISSIONS: 1800, // 30 minutos
    USER_ROLES: 1800, // 30 minutos
    LOGIN_ATTEMPTS: 900, // 15 minutos
    TWO_FA_TOKEN: 300, // 5 minutos
    PASSWORD_RESET: 3600, // 1 hora
    BLACKLIST: 86400, // 24 horas
  };

  constructor(private readonly redis: RedisService) {}

  /**
   * Cache de sesiones de usuario
   */
  async cacheSession(sessionId: string, sessionData: any): Promise<void> {
    const key = `${this.PREFIXES.SESSION}${sessionId}`;
    await this.redis.set(key, sessionData, { key, ttl: this.TTL.SESSION });
    this.logger.debug(`Cached session ${sessionId}`);
  }

  async getSession(sessionId: string): Promise<any | null> {
    const key = `${this.PREFIXES.SESSION}${sessionId}`;
    return await this.redis.get(key);
  }

  async invalidateSession(sessionId: string): Promise<void> {
    const key = `${this.PREFIXES.SESSION}${sessionId}`;
    await this.redis.del(key);
    this.logger.debug(`Invalidated session ${sessionId}`);
  }

  /**
   * Cache de tokens JWT
   */
  async cacheToken(userId: string, token: string): Promise<void> {
    const key = `${this.PREFIXES.TOKEN}${userId}`;
    await this.redis.setString(key, token, this.TTL.TOKEN);
    this.logger.debug(`Cached token for user ${userId}`);
  }

  async getToken(userId: string): Promise<string | null> {
    const key = `${this.PREFIXES.TOKEN}${userId}`;
    return await this.redis.getString(key);
  }

  async invalidateToken(userId: string): Promise<void> {
    const key = `${this.PREFIXES.TOKEN}${userId}`;
    await this.redis.del(key);
    this.logger.debug(`Invalidated token for user ${userId}`);
  }

  /**
   * Cache de refresh tokens
   */
  async cacheRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const key = `${this.PREFIXES.REFRESH_TOKEN}${userId}`;
    await this.redis.setString(key, refreshToken, this.TTL.REFRESH_TOKEN);
    this.logger.debug(`Cached refresh token for user ${userId}`);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    const key = `${this.PREFIXES.REFRESH_TOKEN}${userId}`;
    return await this.redis.getString(key);
  }

  async invalidateRefreshToken(userId: string): Promise<void> {
    const key = `${this.PREFIXES.REFRESH_TOKEN}${userId}`;
    await this.redis.del(key);
    this.logger.debug(`Invalidated refresh token for user ${userId}`);
  }

  /**
   * Cache de permisos de usuario
   */
  async cacheUserPermissions(userId: string, permissions: string[]): Promise<void> {
    const key = `${this.PREFIXES.USER_PERMISSIONS}${userId}`;
    await this.redis.set(key, permissions, { key, ttl: this.TTL.USER_PERMISSIONS });
    this.logger.debug(`Cached permissions for user ${userId}`);
  }

  async getUserPermissions(userId: string): Promise<string[] | null> {
    const key = `${this.PREFIXES.USER_PERMISSIONS}${userId}`;
    return await this.redis.get(key);
  }

  async invalidateUserPermissions(userId: string): Promise<void> {
    const key = `${this.PREFIXES.USER_PERMISSIONS}${userId}`;
    await this.redis.del(key);
    this.logger.debug(`Invalidated permissions for user ${userId}`);
  }

  /**
   * Cache de roles de usuario
   */
  async cacheUserRoles(userId: string, roles: string[]): Promise<void> {
    const key = `${this.PREFIXES.USER_ROLES}${userId}`;
    await this.redis.set(key, roles, { key, ttl: this.TTL.USER_ROLES });
    this.logger.debug(`Cached roles for user ${userId}`);
  }

  async getUserRoles(userId: string): Promise<string[] | null> {
    const key = `${this.PREFIXES.USER_ROLES}${userId}`;
    return await this.redis.get(key);
  }

  async invalidateUserRoles(userId: string): Promise<void> {
    const key = `${this.PREFIXES.USER_ROLES}${userId}`;
    await this.redis.del(key);
    this.logger.debug(`Invalidated roles for user ${userId}`);
  }

  /**
   * Gestión de intentos de login (rate limiting)
   */
  async incrementLoginAttempts(identifier: string): Promise<number> {
    const key = `${this.PREFIXES.LOGIN_ATTEMPTS}${identifier}`;
    const attempts = await this.redis.incr(key);
    
    if (attempts === 1) {
      // Primera vez, establecer TTL
      await this.redis.expire(key, this.TTL.LOGIN_ATTEMPTS);
    }

    this.logger.debug(`Login attempts for ${identifier}: ${attempts}`);
    return attempts;
  }

  async getLoginAttempts(identifier: string): Promise<number> {
    const key = `${this.PREFIXES.LOGIN_ATTEMPTS}${identifier}`;
    const value = await this.redis.getString(key);
    return value ? parseInt(value, 10) : 0;
  }

  async resetLoginAttempts(identifier: string): Promise<void> {
    const key = `${this.PREFIXES.LOGIN_ATTEMPTS}${identifier}`;
    await this.redis.del(key);
    this.logger.debug(`Reset login attempts for ${identifier}`);
  }

  /**
   * Cache de tokens de 2FA
   */
  async cache2FAToken(userId: string, token: string): Promise<void> {
    const key = `${this.PREFIXES.TWO_FA_TOKEN}${userId}`;
    await this.redis.setString(key, token, this.TTL.TWO_FA_TOKEN);
    this.logger.debug(`Cached 2FA token for user ${userId}`);
  }

  async get2FAToken(userId: string): Promise<string | null> {
    const key = `${this.PREFIXES.TWO_FA_TOKEN}${userId}`;
    return await this.redis.getString(key);
  }

  async invalidate2FAToken(userId: string): Promise<void> {
    const key = `${this.PREFIXES.TWO_FA_TOKEN}${userId}`;
    await this.redis.del(key);
    this.logger.debug(`Invalidated 2FA token for user ${userId}`);
  }

  /**
   * Cache de tokens de reseteo de contraseña
   */
  async cachePasswordResetToken(email: string, token: string): Promise<void> {
    const key = `${this.PREFIXES.PASSWORD_RESET}${email}`;
    await this.redis.setString(key, token, this.TTL.PASSWORD_RESET);
    this.logger.debug(`Cached password reset token for ${email}`);
  }

  async getPasswordResetToken(email: string): Promise<string | null> {
    const key = `${this.PREFIXES.PASSWORD_RESET}${email}`;
    return await this.redis.getString(key);
  }

  async invalidatePasswordResetToken(email: string): Promise<void> {
    const key = `${this.PREFIXES.PASSWORD_RESET}${email}`;
    await this.redis.del(key);
    this.logger.debug(`Invalidated password reset token for ${email}`);
  }

  /**
   * Blacklist de tokens (tokens revocados)
   */
  async blacklistToken(token: string): Promise<void> {
    const key = `${this.PREFIXES.BLACKLIST}${token}`;
    await this.redis.setString(key, 'revoked', this.TTL.BLACKLIST);
    this.logger.warn(`Token blacklisted`);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `${this.PREFIXES.BLACKLIST}${token}`;
    return await this.redis.exists(key);
  }

  /**
   * Invalidar todo el cache de un usuario
   */
  async invalidateAllUserCache(userId: string): Promise<void> {
    const keysToDelete = [
      `${this.PREFIXES.TOKEN}${userId}`,
      `${this.PREFIXES.REFRESH_TOKEN}${userId}`,
      `${this.PREFIXES.USER_PERMISSIONS}${userId}`,
      `${this.PREFIXES.USER_ROLES}${userId}`,
      `${this.PREFIXES.TWO_FA_TOKEN}${userId}`,
    ];

    await this.redis.delMany(keysToDelete);

    // También invalidar sesiones del usuario
    const sessionKeys = await this.redis.keys(`${this.PREFIXES.SESSION}*`);
    // TODO: Filtrar solo las sesiones de este usuario
    
    this.logger.log(`Invalidated all cache for user ${userId}`);
  }

  /**
   * Obtener estadísticas de cache
   */
  async getCacheStats(): Promise<any> {
    const stats = {
      sessions: 0,
      tokens: 0,
      refreshTokens: 0,
      userPermissions: 0,
      userRoles: 0,
      loginAttempts: 0,
      twoFATokens: 0,
      passwordResets: 0,
      blacklistedTokens: 0,
    };

    try {
      stats.sessions = (await this.redis.keys(`${this.PREFIXES.SESSION}*`)).length;
      stats.tokens = (await this.redis.keys(`${this.PREFIXES.TOKEN}*`)).length;
      stats.refreshTokens = (await this.redis.keys(`${this.PREFIXES.REFRESH_TOKEN}*`)).length;
      stats.userPermissions = (await this.redis.keys(`${this.PREFIXES.USER_PERMISSIONS}*`)).length;
      stats.userRoles = (await this.redis.keys(`${this.PREFIXES.USER_ROLES}*`)).length;
      stats.loginAttempts = (await this.redis.keys(`${this.PREFIXES.LOGIN_ATTEMPTS}*`)).length;
      stats.twoFATokens = (await this.redis.keys(`${this.PREFIXES.TWO_FA_TOKEN}*`)).length;
      stats.passwordResets = (await this.redis.keys(`${this.PREFIXES.PASSWORD_RESET}*`)).length;
      stats.blacklistedTokens = (await this.redis.keys(`${this.PREFIXES.BLACKLIST}*`)).length;
    } catch (error) {
      this.logger.error('Error getting cache stats', error);
    }

    return stats;
  }
}
