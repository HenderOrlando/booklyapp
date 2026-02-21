import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class IdempotencyGuard implements CanActivate {
  private readonly logger = new Logger(IdempotencyGuard.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers['idempotency-key'];

    if (!idempotencyKey) {
      // Si la ruta requiere idempotencia, pero no se proporciona la clave, lanzamos error.
      // Opcionalmente, se podría validar si el método es POST/PATCH/PUT.
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
         throw new HttpException(
            {
               code: 'GEN-002',
               message: 'Idempotency-Key header is required for this operation',
               error: 'IdempotencyKeyMissing',
            },
            HttpStatus.BAD_REQUEST,
         );
      }
      return true;
    }

    const cacheKey = `idempotency:${idempotencyKey}`;
    const cachedResponse = await this.cacheManager.get(cacheKey);

    if (cachedResponse) {
      this.logger.warn(`Idempotent request detected for key: ${idempotencyKey}`);
      // Devuelve la respuesta cachead si ya existe, se lanza una excepción especial para
      // que un interceptor o filtro la capture, o simplemente se retorna un HTTP 409 Conflict o 429.
      throw new HttpException(
        {
           code: 'GEN-003',
           message: 'This request has already been processed (Idempotent replay)',
           error: 'IdempotencyConflict',
           data: cachedResponse // Podemos adjuntar la respuesta anterior si es necesario
        },
        HttpStatus.CONFLICT,
      );
    }

    // Opcionalmente se puede marcar como en progreso para evitar condiciones de carrera:
    // await this.cacheManager.set(cacheKey, 'IN_PROGRESS', 5000);

    return true;
  }
}
