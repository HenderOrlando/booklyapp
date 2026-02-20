import { UserEntity } from "@auth/domain/entities/user.entity";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
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
  constructor(
    private readonly authService: AuthService,
    private readonly eventBus: EventBus,
  ) {}

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
      programId,
      coordinatedProgramId,
    } = command;

    const createdUser = await this.authService.register(
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
      programId,
      coordinatedProgramId,
    );

    // Publicar evento de auditoría
    this.eventBus.publish({
      type: "USER_REGISTERED",
      userId: createdUser.id,
      email: createdUser.email,
      roles: createdUser.roles,
      timestamp: new Date(),
    });

    return createdUser;
  }
}
