/**
 * Two Factor Disabled Event
 * Evento publicado cuando un usuario deshabilita 2FA
 */
export class TwoFactorDisabledEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
