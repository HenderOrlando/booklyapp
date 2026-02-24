/**
 * Delete Availability Command
 * Comando para eliminar una regla de disponibilidad
 */
export class DeleteAvailabilityCommand {
  constructor(
    public readonly availabilityId: string,
    public readonly deletedBy: string,
  ) {}
}
