import { PaginationMeta, PaginationQuery } from "@libs/common";

/**
 * Program Entity (lightweight for import context)
 */
export interface ProgramEntity {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

/**
 * Program Repository Interface
 * Define los métodos para acceder a programas académicos
 */
export interface IProgramRepository {
  /**
   * Buscar programa por ID
   */
  findById(id: string): Promise<ProgramEntity | null>;

  /**
   * Buscar programa por código
   */
  findByCode(code: string): Promise<ProgramEntity | null>;

  /**
   * Buscar programas por nombre (parcial)
   */
  findByName(name: string): Promise<ProgramEntity[]>;

  /**
   * Buscar múltiples programas
   */
  findMany(query: PaginationQuery): Promise<{
    programs: ProgramEntity[];
    meta: PaginationMeta;
  }>;

  /**
   * Verificar si existe un programa con el código
   */
  existsByCode(code: string): Promise<boolean>;
}
