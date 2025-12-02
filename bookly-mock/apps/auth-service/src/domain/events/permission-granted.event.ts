import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Event payload when a permission is granted to a user or role
 */
export interface PermissionGrantedPayload {
  targetId: string; // userId or roleId
  targetType: 'user' | 'role';
  permissionId: string;
  permissionName: string;
  grantedBy: string;
}

/**
 * Event Factory for Permission Granted
 */
export class PermissionGrantedEvent {
  static create(
    payload: PermissionGrantedPayload
  ): EventPayload<PermissionGrantedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.PERMISSION_GRANTED,
      service: 'auth-service',
      data: payload,
      timestamp: new Date(),
      metadata: {
        version: '1.0',
        aggregateType: payload.targetType === 'user' ? 'User' : 'Role',
        aggregateId: payload.targetId,
      },
    };
  }
}
