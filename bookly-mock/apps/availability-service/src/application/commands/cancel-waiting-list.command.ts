/**
 * Cancel Waiting List Command
 * Comando para cancelar/eliminar una entrada de la lista de espera
 */
export class CancelWaitingListCommand {
  constructor(
    public readonly waitingListId: string,
    public readonly cancelledBy: string,
  ) {}
}
