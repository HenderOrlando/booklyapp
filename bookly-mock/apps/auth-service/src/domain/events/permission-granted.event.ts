/**
 * Permission Granted Event
 * Evento publicado cuando se otorga un permiso a un usuario o rol
 */
export class PermissionGrantedEvent {
  constructor(
    public readonly targetId: string, // userId or roleId
    public readonly targetType: 'user' | 'role',
    public readonly permissionId: string,
    public readonly permissionName: string,
    public readonly grantedBy: string,
    public readonly timestamp: Date = new Date()
  ) {}
}
