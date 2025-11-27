import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ValidateTokenQuery } from "../queries/validate-token.query";
import { AuthService, JwtPayload } from "../services/auth.service";

/**
 * Validate Token Query Handler
 * Maneja la validación de tokens JWT
 */
@QueryHandler(ValidateTokenQuery)
export class ValidateTokenHandler
  implements IQueryHandler<ValidateTokenQuery, JwtPayload>
{
  constructor(private readonly authService: AuthService) {}

  async execute(query: ValidateTokenQuery): Promise<JwtPayload> {
    const { token } = query;

    const payload = await this.authService.validateToken(token);

    return payload;
  }
}
