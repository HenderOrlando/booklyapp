/**
 * User Logged In Event
 * Evento publicado cuando un usuario inicia sesión exitosamente
 */
export class UserLoggedInEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly ip?: string,
    public readonly userAgent?: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
