import { UserRole } from "@libs/common/enums";
import { AuditInfo } from "@libs/common";

/**
 * Role Domain Entity
 * Representa un rol del sistema con sus permisos asociados
 */
export class RoleEntity {
  constructor(
    public readonly id: string,
    public name: UserRole,
    public displayName: string,
    public description: string,
    public permissions: string[],
    public isActive: boolean,
    public isDefault: boolean,
    public audit?: AuditInfo
  ) {}

  /**
   * Verificar si el rol tiene un permiso específico
   */
  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  /**
   * Agregar permiso al rol
   */
  addPermission(permission: string): void {
    if (!this.hasPermission(permission)) {
      this.permissions.push(permission);
    }
  }

  /**
   * Remover permiso del rol
   */
  removePermission(permission: string): void {
    this.permissions = this.permissions.filter((p) => p !== permission);
  }

  /**
   * Activar rol
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * Desactivar rol (solo si no es por defecto)
   */
  deactivate(): void {
    if (!this.isDefault) {
      this.isActive = false;
    } else {
      throw new Error("Cannot deactivate default role");
    }
  }

  /**
   * Verificar si el rol puede ser eliminado
   */
  canBeDeleted(): boolean {
    return !this.isDefault;
  }

  /**
   * Convertir a objeto plano (para persistencia)
   */
  toObject(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      permissions: this.permissions,
      isActive: this.isActive,
      isDefault: this.isDefault,
      audit: this.audit,
    };
  }

  /**
   * Crear desde objeto plano
   */
  static fromObject(data: any): RoleEntity {
    return new RoleEntity(
      data.id || data._id?.toString(),
      data.name,
      data.displayName,
      data.description,
      data.permissions || [],
      data.isActive ?? true,
      data.isDefault ?? false,
      data.audit
    );
  }
}
