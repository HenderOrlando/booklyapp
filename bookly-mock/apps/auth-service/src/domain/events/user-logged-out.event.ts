import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Event payload when a user logs out
 */
export interface UserLoggedOutPayload {
  userId: string;
  email: string;
}

/**
 * Event Factory for User Logged Out
 */
export class UserLoggedOutEvent {
  static create(
    payload: UserLoggedOutPayload
  ): EventPayload<UserLoggedOutPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.USER_LOGGED_OUT,
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
