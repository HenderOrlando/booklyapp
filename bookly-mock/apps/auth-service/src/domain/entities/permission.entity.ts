import { AuditInfo } from "@libs/common";

/**
 * Permission Domain Entity
 * Representa un permiso específico del sistema
 */
export class PermissionEntity {
  constructor(
    public readonly id: string,
    public code: string,
    public name: string,
    public description: string,
    public resource: string,
    public action: string,
    public isActive: boolean,
    public audit?: AuditInfo
  ) {}

  /**
   * Obtener el código completo del permiso (resource:action)
   */
  get fullCode(): string {
    return `${this.resource}:${this.action}`;
  }

  /**
   * Activar permiso
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * Desactivar permiso
   */
  deactivate(): void {
    this.isActive = false;
  }

  /**
   * Verificar si el permiso coincide con un patrón
   * Soporta wildcards: resource:* o *:action
   */
  matches(pattern: string): boolean {
    if (pattern === "*" || pattern === "*:*") {
      return true;
    }

    const [patternResource, patternAction] = pattern.split(":");

    if (patternResource === "*") {
      return this.action === patternAction;
    }

    if (patternAction === "*") {
      return this.resource === patternResource;
    }

    return this.fullCode === pattern;
  }

  /**
   * Convertir a objeto plano (para persistencia)
   */
  toObject(): Record<string, any> {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      description: this.description,
      resource: this.resource,
      action: this.action,
      isActive: this.isActive,
      audit: this.audit,
    };
  }

  /**
   * Crear desde objeto plano
   */
  static fromObject(data: any): PermissionEntity {
    return new PermissionEntity(
      data.id || data._id?.toString(),
      data.code,
      data.name,
      data.description,
      data.resource,
      data.action,
      data.isActive ?? true,
      data.audit
    );
  }
}
