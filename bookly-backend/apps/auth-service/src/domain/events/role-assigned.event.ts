import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Event payload when a role is assigned to a user
 */
export interface RoleAssignedPayload {
  userId: string;
  email: string;
  roleId: string;
  roleName: string;
  assignedBy: string;
}

/**
 * Event Factory for Role Assigned
 */
export class RoleAssignedEvent {
  static create(
    payload: RoleAssignedPayload
  ): EventPayload<RoleAssignedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.ROLE_ASSIGNED,
      service: 'auth-service',
      data: payload,
      timestamp: new Date(),
      metadata: {
        version: '1.0',
        aggregateType: 'User',
        aggregateId: payload.userId,
      },
    };
  }
}
