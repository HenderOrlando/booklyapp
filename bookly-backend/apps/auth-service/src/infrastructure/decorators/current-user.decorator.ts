import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Decorator para obtener el usuario autenticado desde el request
 * Uso: @CurrentUser() user: UserPayload
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si se especifica un campo específico, retornar solo ese campo
    if (data && user) {
      return user[data];
    }

    // Retornar el usuario completo
    return user;
  }
);

/**
 * Interface del payload del usuario autenticado
 * Debe coincidir con el payload del JWT
 */
export interface UserPayload {
  id: string;
  email: string;
  role: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
}
