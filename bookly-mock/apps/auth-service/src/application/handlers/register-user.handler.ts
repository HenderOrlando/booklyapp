import { UserEntity } from "@auth/domain/entities/user.entity";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RegisterUserCommand } from "../commands/register-user.command";
import { AuthService } from "../services/auth.service";

/**
 * Register User Command Handler
 * Maneja el registro de nuevos usuarios
 */
@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand, UserEntity>
{
  constructor(private readonly authService: AuthService) {}

  async execute(command: RegisterUserCommand): Promise<UserEntity> {
    const {
      email,
      password,
      firstName,
      lastName,
      roles,
      permissions,
      username,
      phone,
      documentType,
      documentNumber,
      tenantId,
    } = command;

    return await this.authService.register(
      email,
      password,
      firstName,
      lastName,
      roles,
      permissions,
      username,
      phone,
      documentType,
      documentNumber,
      tenantId,
    );
  }
}
