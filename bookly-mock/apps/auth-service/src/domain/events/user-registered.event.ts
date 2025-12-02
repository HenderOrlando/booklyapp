/**
 * User Registered Event
 * Evento publicado cuando un nuevo usuario se registra en el sistema
 */
export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly roles: string[],
    public readonly timestamp: Date = new Date()
  ) {}
}
