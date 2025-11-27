import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

/**
 * Guard para proteger rutas con autenticación JWT
 * Valida que el usuario tenga un token válido
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Llamar a la validación del guard padre (Passport JWT)
    return super.canActivate(context);
  }
}
