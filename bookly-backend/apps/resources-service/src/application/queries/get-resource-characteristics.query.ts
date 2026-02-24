/**
 * Get Resource Characteristics Query
 * Query para listar características disponibles desde reference_data
 */
export class GetResourceCharacteristicsQuery {
  constructor(public readonly onlyActive: boolean = true) {}
}
