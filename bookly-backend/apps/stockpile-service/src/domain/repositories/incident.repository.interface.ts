import { IncidentEntity, IncidentStatus, IncidentSeverity } from "@stockpile/domain/entities/incident.entity";

/**
 * Filtros para búsqueda de incidencias
 */
export interface IncidentFilters {
  checkInOutId?: string;
  resourceId?: string;
  reportedBy?: string;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Interfaz del repositorio de incidencias
 */
export interface IIncidentRepository {
  /**
   * Crea una nueva incidencia
   */
  create(incident: IncidentEntity): Promise<IncidentEntity>;

  /**
   * Busca una incidencia por ID
   */
  findById(id: string): Promise<IncidentEntity | null>;

  /**
   * Busca múltiples incidencias con filtros
   */
  findMany(filters: IncidentFilters): Promise<IncidentEntity[]>;

  /**
   * Actualiza una incidencia
   */
  update(id: string, incident: Partial<IncidentEntity>): Promise<IncidentEntity>;

  /**
   * Elimina una incidencia
   */
  delete(id: string): Promise<boolean>;

  /**
   * Cuenta incidencias por filtros
   */
  count(filters: IncidentFilters): Promise<number>;
}
