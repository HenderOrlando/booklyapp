import { ModifyInstanceDto } from "@availability/infrastructure/dtos";

/**
 * Modify Recurring Instance Command
 * Command para modificar una instancia individual de una serie recurrente
 */
export class ModifyRecurringInstanceCommand {
  constructor(
    public readonly dto: ModifyInstanceDto,
    public readonly userId: string
  ) {}
}
