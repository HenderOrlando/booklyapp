import { ResourceStatus, ResourceType } from "@libs/common/enums";

/**
 * Update Resource Command
 * Command para actualizar un recurso existente
 */
export class UpdateResourceCommand {
  constructor(
    public readonly id: string,
    public readonly data: {
      code?: string;
      name?: string;
      description?: string;
      type?: ResourceType;
      categoryId?: string;
      capacity?: number;
      location?: string;
      floor?: string;
      building?: string;
      attributes?: Record<string, any>;
      programIds?: string[];
      status?: ResourceStatus;
      isActive?: boolean;
      availabilityRules?: {
        requiresApproval?: boolean;
        maxAdvanceBookingDays?: number;
        minBookingDurationMinutes?: number;
        maxBookingDurationMinutes?: number;
        allowRecurring?: boolean;
      };
    },
    public readonly updatedBy?: string
  ) {}
}
