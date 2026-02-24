import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ForgotPasswordCommand } from "../commands/forgot-password.command";
import { AuthService } from "../services/auth.service";

export interface ForgotPasswordResponse {
  message: string;
}

/**
 * Forgot Password Command Handler
 * Maneja la solicitud de recuperación de contraseña
 */
@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler
  implements ICommandHandler<ForgotPasswordCommand, ForgotPasswordResponse>
{
  constructor(private readonly authService: AuthService) {}

  async execute(
    command: ForgotPasswordCommand
  ): Promise<ForgotPasswordResponse> {
    const { email } = command;

    await this.authService.forgotPassword(email);

    return {
      message:
        "Si el email existe, recibirás instrucciones para restablecer tu contraseña",
    };
  }
}
