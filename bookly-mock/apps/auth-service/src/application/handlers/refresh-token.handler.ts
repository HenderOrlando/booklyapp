import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RefreshTokenCommand } from "../commands/refresh-token.command";
import { AuthService, AuthTokens } from "../services/auth.service";

/**
 * Refresh Token Command Handler
 * Maneja la renovación de access tokens
 */
@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler
  implements ICommandHandler<RefreshTokenCommand, AuthTokens>
{
  constructor(private readonly authService: AuthService) {}

  async execute(command: RefreshTokenCommand): Promise<AuthTokens> {
    const { refreshToken } = command;

    const tokens = await this.authService.refreshTokens(refreshToken);

    return tokens;
  }
}
