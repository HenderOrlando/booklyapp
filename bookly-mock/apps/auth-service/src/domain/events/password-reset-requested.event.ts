import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Event payload when a user requests a password reset
 */
export interface PasswordResetRequestedPayload {
  userId: string;
  email: string;
  resetToken: string;
  expiresAt: Date;
}

/**
 * Event Factory for Password Reset Requested
 */
export class PasswordResetRequestedEvent {
  static create(
    payload: PasswordResetRequestedPayload
  ): EventPayload<PasswordResetRequestedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.PASSWORD_RESET_REQUESTED,
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
