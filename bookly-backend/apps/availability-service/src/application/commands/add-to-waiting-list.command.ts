/**
 * Add To Waiting List Command
 * Command para agregar una solicitud a la lista de espera
 */
export class AddToWaitingListCommand {
  constructor(
    public readonly resourceId: string,
    public readonly userId: string,
    public readonly requestedStartDate: Date,
    public readonly requestedEndDate: Date,
    public readonly priority?: number,
    public readonly purpose?: string,
    public readonly expiresAt?: Date,
    public readonly createdBy?: string
  ) {}
}
