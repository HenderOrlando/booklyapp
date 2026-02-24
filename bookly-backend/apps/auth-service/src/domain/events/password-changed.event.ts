import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Event payload when a user changes their password
 */
export interface PasswordChangedPayload {
  userId: string;
  email: string;
  changedBy: string;
}

/**
 * Event Factory for Password Changed
 */
export class PasswordChangedEvent {
  static create(
    payload: PasswordChangedPayload
  ): EventPayload<PasswordChangedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.PASSWORD_CHANGED,
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
