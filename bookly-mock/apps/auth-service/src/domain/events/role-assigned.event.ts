/**
 * Role Assigned Event
 * Evento publicado cuando se asigna un rol a un usuario
 */
export class RoleAssignedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly roleId: string,
    public readonly roleName: string,
    public readonly assignedBy: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
