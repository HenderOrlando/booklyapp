import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Event payload when a new user is registered
 */
export interface UserRegisteredPayload {
  userId: string;
  email: string;
  name: string;
  roles: string[];
}

/**
 * Event Factory for User Registered
 */
export class UserRegisteredEvent {
  static create(
    payload: UserRegisteredPayload
  ): EventPayload<UserRegisteredPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.USER_REGISTERED,
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
