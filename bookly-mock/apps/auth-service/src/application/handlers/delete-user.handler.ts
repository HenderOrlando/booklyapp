import { IUserRepository } from "@auth/domain/repositories/user.repository.interface";
import { Inject, NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { DeleteUserCommand } from "../commands/delete-user.command";

/**
 * Delete User Handler
 * Maneja la eliminación (desactivación) de un usuario
 */
@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @Inject("IUserRepository")
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteUserCommand) {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException(`User with id ${command.userId} not found`);
    }

    await this.userRepository.update(command.userId, {
      isActive: false,
    } as any);

    // Publicar evento de auditoría
    this.eventBus.publish({
      type: "USER_DELETED",
      userId: command.userId,
      deletedBy: command.deletedBy,
      timestamp: new Date(),
    });

    return { id: command.userId, deleted: true };
  }
}
