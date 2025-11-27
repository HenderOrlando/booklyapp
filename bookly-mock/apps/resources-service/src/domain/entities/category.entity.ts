import { CategoryType } from "@libs/common/enums";
import { AuditInfo } from "@libs/common";

/**
 * Category Entity
 * Entidad de dominio para categorías de recursos
 */
export class CategoryEntity {
  constructor(
    public readonly id: string,
    public code: string,
    public name: string,
    public description: string,
    public type: CategoryType,
    public color?: string,
    public icon?: string,
    public parentId?: string,
    public isActive: boolean = true,
    public metadata: Record<string, any> = {},
    public createdAt?: Date,
    public updatedAt?: Date,
    public audit?: AuditInfo
  ) {}

  /**
   * Verifica si la categoría es raíz (no tiene padre)
   */
  isRoot(): boolean {
    return !this.parentId;
  }

  /**
   * Activa la categoría
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * Desactiva la categoría
   */
  deactivate(): void {
    this.isActive = false;
  }

  /**
   * Actualiza el código de la categoría
   */
  updateCode(newCode: string): void {
    this.code = newCode.toUpperCase();
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toObject(): any {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      description: this.description,
      type: this.type,
      color: this.color,
      icon: this.icon,
      parentId: this.parentId,
      isActive: this.isActive,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      audit: this.audit,
    };
  }

  /**
   * Crea una entidad desde un objeto plano
   */
  static fromObject(obj: any): CategoryEntity {
    return new CategoryEntity(
      obj.id || obj._id?.toString(),
      obj.code,
      obj.name,
      obj.description,
      obj.type,
      obj.color,
      obj.icon,
      obj.parentId,
      obj.isActive,
      obj.metadata,
      obj.createdAt,
      obj.updatedAt,
      obj.audit
    );
  }
}
