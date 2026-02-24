import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Event payload when a user enables two-factor authentication
 */
export interface TwoFactorEnabledPayload {
  userId: string;
  email: string;
}

/**
 * Event Factory for Two Factor Enabled
 */
export class TwoFactorEnabledEvent {
  static create(
    payload: TwoFactorEnabledPayload
  ): EventPayload<TwoFactorEnabledPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.TWO_FACTOR_ENABLED,
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
