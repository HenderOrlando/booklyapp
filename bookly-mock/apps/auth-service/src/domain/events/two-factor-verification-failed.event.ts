/**
 * Two Factor Verification Failed Event
 * Evento publicado cuando falla la verificación de 2FA
 */
export class TwoFactorVerificationFailedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly reason:
      | "invalid_code"
      | "expired_token"
      | "invalid_backup_code",
    public readonly timestamp: Date = new Date()
  ) {}
}
