import { PaginationMeta, PaginationQuery } from "@libs/common";
import { ApprovalFlowEntity } from "../entities/approval-flow.entity";

/**
 * Approval Flow Repository Interface
 * Define los métodos para acceso y persistencia de flujos de aprobación
 */
export interface IApprovalFlowRepository {
  /**
   * Crea un nuevo flujo de aprobación
   */
  create(flow: ApprovalFlowEntity): Promise<ApprovalFlowEntity>;

  /**
   * Busca un flujo por ID
   */
  findById(id: string): Promise<ApprovalFlowEntity | null>;

  /**
   * Busca múltiples flujos con paginación
   */
  findMany(
    query: PaginationQuery,
    filters?: {
      isActive?: boolean;
      resourceType?: string;
    }
  ): Promise<{ flows: ApprovalFlowEntity[]; meta: PaginationMeta }>;

  /**
   * Busca flujos activos
   */
  findActive(
    query: PaginationQuery
  ): Promise<{ flows: ApprovalFlowEntity[]; meta: PaginationMeta }>;

  /**
   * Busca flujos por tipo de recurso
   */
  findByResourceType(
    resourceType: string,
    query: PaginationQuery
  ): Promise<{ flows: ApprovalFlowEntity[]; meta: PaginationMeta }>;

  /**
   * Busca flujos que aplican a un tipo de recurso específico
   */
  findApplicableTo(resourceType: string): Promise<ApprovalFlowEntity[]>;

  /**
   * Busca flujo por nombre
   */
  findByName(name: string): Promise<ApprovalFlowEntity | null>;

  /**
   * Actualiza un flujo
   */
  update(
    id: string,
    data: Partial<ApprovalFlowEntity>
  ): Promise<ApprovalFlowEntity>;

  /**
   * Elimina un flujo
   */
  delete(id: string): Promise<boolean>;

  /**
   * Cuenta flujos con filtros opcionales
   */
  count(filters?: {
    isActive?: boolean;
    resourceType?: string;
  }): Promise<number>;

  /**
   * Verifica si existe un flujo con el mismo nombre
   */
  existsByName(name: string, excludeId?: string): Promise<boolean>;
}
