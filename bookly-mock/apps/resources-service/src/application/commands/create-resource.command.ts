import { ResourceType } from "@libs/common/enums";

/**
 * Create Resource Command
 * Command para crear un nuevo recurso
 */
export class CreateResourceCommand {
  constructor(
    public readonly code: string,
    public readonly name: string,
    public readonly description: string,
    public readonly type: ResourceType,
    public readonly categoryId: string,
    public readonly capacity: number,
    public readonly location: string,
    public readonly floor?: string,
    public readonly building?: string,
    public readonly attributes?: Record<string, any>,
    public readonly programIds?: string[],
    public readonly availabilityRules?: {
      requiresApproval: boolean;
      maxAdvanceBookingDays: number;
      minBookingDurationMinutes: number;
      maxBookingDurationMinutes: number;
      allowRecurring: boolean;
    },
    public readonly createdBy?: string
  ) {}
}
