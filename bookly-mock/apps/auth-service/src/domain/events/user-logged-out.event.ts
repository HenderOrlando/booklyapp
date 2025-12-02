/**
 * User Logged Out Event
 * Evento publicado cuando un usuario cierra sesión
 */
export class UserLoggedOutEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
