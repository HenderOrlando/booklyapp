/**
 * Two Factor Enabled Event
 * Evento publicado cuando un usuario habilita 2FA
 */
export class TwoFactorEnabledEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
