import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta?: any;
}

@Injectable()
export class GlobalResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((res) => {
        // Si la respuesta ya viene con el formato estándar (ApiResponseBookly), la dejamos pasar
        if (
          res &&
          typeof res === 'object' &&
          'success' in res &&
          'data' in res
        ) {
          return res;
        }

        // Si la respuesta es de un paginador antiguo, la dejamos pasar
        if (res && res.data && typeof res === 'object' && Object.keys(res).length <= 2 && (res.meta !== undefined || Object.keys(res).length === 1)) {
          return res;
        }

        // Si no, la envolvemos en la propiedad 'data'
        return {
          data: res,
        };
      }),
    );
  }
}
