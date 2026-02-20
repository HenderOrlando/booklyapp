import { IUserRepository } from "@auth/domain/repositories/user.repository.interface";
import { Inject } from "@nestjs/common";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { UpdateUserCommand } from "../commands/update-user.command";

/**
 * Update User Handler
 * Maneja la actualización de información de un usuario
 */
@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject("IUserRepository")
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateUserCommand) {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new Error(`User with id ${command.userId} not found`);
    }

    const updateData: Record<string, any> = {};
    if (command.data.firstName !== undefined)
      updateData.firstName = command.data.firstName;
    if (command.data.lastName !== undefined)
      updateData.lastName = command.data.lastName;
    if (command.data.phone !== undefined) updateData.phone = command.data.phone;
    if (command.data.documentType !== undefined)
      updateData.documentType = command.data.documentType;
    if (command.data.documentNumber !== undefined)
      updateData.documentNumber = command.data.documentNumber;
    if (command.data.roles !== undefined) updateData.roles = command.data.roles;
    if (command.data.isActive !== undefined)
      updateData.isActive = command.data.isActive;
    if (command.data.isEmailVerified !== undefined)
      updateData.isEmailVerified = command.data.isEmailVerified;
    if (command.data.isPhoneVerified !== undefined)
      updateData.isPhoneVerified = command.data.isPhoneVerified;
    if (command.data.programId !== undefined)
      updateData.programId = command.data.programId;
    if (command.data.coordinatedProgramId !== undefined)
      updateData.coordinatedProgramId = command.data.coordinatedProgramId;
    updateData["audit.updatedBy"] = command.updatedBy;

    const updated = await this.userRepository.update(
      command.userId,
      updateData,
    );

    // Publicar evento de auditoría o similar si es necesario
    this.eventBus.publish({
      type: "USER_UPDATED",
      userId: command.userId,
      updatedBy: command.updatedBy,
      timestamp: new Date(),
      changes: Object.keys(updateData).filter(key => key !== "audit.updatedBy"),
    });

    return updated;
  }
}
