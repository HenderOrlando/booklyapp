/**
 * Password Changed Event
 * Evento publicado cuando un usuario cambia su contraseña
 */
export class PasswordChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly changedBy: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
