import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Event payload when a user logs in
 */
export interface UserLoggedInPayload {
  userId: string;
  email: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Event Factory for User Logged In
 */
export class UserLoggedInEvent {
  static create(
    payload: UserLoggedInPayload
  ): EventPayload<UserLoggedInPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.USER_LOGGED_IN,
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
