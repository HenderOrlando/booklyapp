import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Event payload when a user disables two-factor authentication
 */
export interface TwoFactorDisabledPayload {
  userId: string;
  email: string;
}

/**
 * Event Factory for Two Factor Disabled
 */
export class TwoFactorDisabledEvent {
  static create(
    payload: TwoFactorDisabledPayload
  ): EventPayload<TwoFactorDisabledPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.TWO_FACTOR_DISABLED,
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
