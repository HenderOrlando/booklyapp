import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Event payload when two-factor verification fails
 */
export interface TwoFactorVerificationFailedPayload {
  userId: string;
  email: string;
  reason: 'invalid_code' | 'expired_token' | 'invalid_backup_code';
  ip?: string;
}

/**
 * Event Factory for Two Factor Verification Failed
 */
export class TwoFactorVerificationFailedEvent {
  static create(
    payload: TwoFactorVerificationFailedPayload
  ): EventPayload<TwoFactorVerificationFailedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.TWO_FACTOR_VERIFICATION_FAILED,
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
