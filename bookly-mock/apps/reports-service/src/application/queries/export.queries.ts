/**
 * Export Queries
 * Queries CQRS para exportaciones
 */

/**
 * Get Export Status Query
 */
export class GetExportStatusQuery {
  constructor(public readonly exportId: string) {}
}

/**
 * Get User Export History Query
 */
export class GetUserExportHistoryQuery {
  constructor(
    public readonly userId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20
  ) {}
}
