import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LoginUserCommand } from "../commands/login-user.command";
import { AuthService, LoginResponse } from "../services/auth.service";

/**
 * Login User Command Handler
 * Maneja la autenticación de usuarios
 * Ahora soporta flujo 2FA con respuestas condicionales
 */
@CommandHandler(LoginUserCommand)
export class LoginUserHandler
  implements ICommandHandler<LoginUserCommand, LoginResponse>
{
  constructor(private readonly authService: AuthService) {}

  async execute(command: LoginUserCommand): Promise<LoginResponse> {
    const { email, password } = command;

    const result = await this.authService.login(email, password);

    return result;
  }
}
