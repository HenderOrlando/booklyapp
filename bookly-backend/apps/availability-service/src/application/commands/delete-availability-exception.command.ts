/**
 * Command para eliminar excepción de disponibilidad
 */
export class DeleteAvailabilityExceptionCommand {
  constructor(public readonly exceptionId: string) {}
}
