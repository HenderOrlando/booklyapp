/**
 * Query para obtener un job de importación por ID
 */
export class GetImportJobQuery {
  constructor(
    public readonly jobId: string,
    public readonly userId: string
  ) {}
}

/**
 * Query para listar jobs de importación de un usuario
 */
export class GetUserImportJobsQuery {
  constructor(
    public readonly userId: string,
    public readonly limit: number = 20
  ) {}
}
